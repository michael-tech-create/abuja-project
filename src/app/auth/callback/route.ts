import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { applySignupRoleFromCookie } from "@/lib/auth/actions";
import { AUTH_REDIRECT_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { getSchemaStatus } from "@/lib/supabase/schema";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const errorCode = requestUrl.searchParams.get("error_code");

  if (error) {
    const message =
      errorCode === "otp_expired" || /expired|invalid/i.test(errorDescription ?? "")
        ? "That email link is invalid or has expired. Please sign in or request a new confirmation email."
        : errorDescription?.replace(/\+/g, " ") || error;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(message)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Missing auth code. Please try again.")}`,
    );
  }

  const schema = await getSchemaStatus();
  if (!schema.ok) {
    return NextResponse.redirect(`${origin}/setup`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("Session could not be created.")}`,
    );
  }

  await applySignupRoleFromCookie(user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const cookieStore = await cookies();
  const redirectFromCookie = cookieStore.get(AUTH_REDIRECT_COOKIE)?.value;

  let next = nextParam || redirectFromCookie || "/dashboard";
  if (!profile) {
    // Auth user exists but trigger/profile row missing — send to setup/login guidance
    next = "/setup";
  } else if (!profile.onboarding_completed) {
    next = "/onboarding";
  }
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete(AUTH_REDIRECT_COOKIE);
  return response;
}
