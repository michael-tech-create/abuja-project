import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/check-email"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/messages",
  "/admin",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isMissingProfilesTable(message?: string | null, code?: string | null) {
  if (code === "PGRST205" || code === "42P01") return true;
  if (!message) return false;
  return (
    /Could not find the table/i.test(message) ||
    /schema cache/i.test(message) ||
    /relation .*profiles.* does not exist/i.test(message)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = startsWithAny(pathname, AUTH_ROUTES);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isCallback = pathname.startsWith("/auth/callback");
  const isSetup = pathname.startsWith("/setup");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Load profile once when needed; detect missing schema
  let profile: { onboarding_completed?: boolean; role?: string } | null = null;
  let profilesMissing = false;

  if (user && (isAuthRoute || isProtected || isSetup) && !isCallback) {
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error && isMissingProfilesTable(error.message, error.code)) {
      profilesMissing = true;
    } else {
      profile = data;
    }
  }

  if (profilesMissing && !isSetup && !isCallback) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/setup";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isSetup && !profilesMissing) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile?.onboarding_completed
      ? "/dashboard"
      : "/onboarding";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && !isCallback && !profilesMissing) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile?.onboarding_completed
      ? "/dashboard"
      : "/onboarding";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname.startsWith("/dashboard") && profile && !profile.onboarding_completed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname.startsWith("/onboarding") && profile?.onboarding_completed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname.startsWith("/admin") && profile?.role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
