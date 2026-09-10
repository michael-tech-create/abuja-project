"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_REDIRECT_COOKIE,
  SIGNUP_ROLE_COOKIE,
} from "@/lib/auth/constants";
import {
  loginSchema,
  onboardingSchema,
  signupRoles,
  signupSchema,
} from "@/lib/auth/schemas";
import { resolveOrigin } from "@/lib/site-url";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function missingSupabaseState(): AuthActionState {
  return {
    error:
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
  };
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) return missingSupabaseState();

  const { fullName, email, password, role } = parsed.data;
  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) return missingSupabaseState();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let next = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      next = "/onboarding";
    }
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function completeOnboardingAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return missingSupabaseState();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to continue." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    role: existing?.role ?? "tenant",
    companyName: formData.get("companyName") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { fullName, phone, companyName, bio } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone.trim(),
      company_name: companyName?.trim() || null,
      bio: bio?.trim() || null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function startGoogleOAuth(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(
      `/auth/login?error=${encodeURIComponent(
        "Supabase is not configured. Add credentials to .env.local.",
      )}`,
    );
  }

  const roleRaw = String(formData.get("role") ?? "tenant");
  const mode = String(formData.get("mode") ?? "login");
  const role = signupRoles.includes(roleRaw as (typeof signupRoles)[number])
    ? (roleRaw as (typeof signupRoles)[number])
    : "tenant";

  const cookieStore = await cookies();
  if (mode === "signup") {
    cookieStore.set(SIGNUP_ROLE_COOKIE, role, {
      path: "/",
      maxAge: 60 * 10,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  const nextPath = mode === "signup" ? "/onboarding" : "/dashboard";
  cookieStore.set(AUTH_REDIRECT_COOKIE, nextPath, {
    path: "/",
    maxAge: 60 * 10,
    sameSite: "lax",
    httpOnly: true,
  });

  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `/auth/login?error=${encodeURIComponent(error?.message ?? "Google sign-in failed")}`,
    );
  }

  redirect(data.url);
}

export async function applySignupRoleFromCookie(userId: string) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(SIGNUP_ROLE_COOKIE)?.value;
  if (
    !roleCookie ||
    !signupRoles.includes(roleCookie as (typeof signupRoles)[number])
  ) {
    return;
  }

  const role = roleCookie as (typeof signupRoles)[number];
  const supabase = await createClient();
  await supabase.rpc("claim_signup_role", {
    desired_role: role,
  });

  // userId kept for call-site clarity / future audit
  void userId;
  cookieStore.delete(SIGNUP_ROLE_COOKIE);
}
