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
        ? "That email link is invalid or has expired. Please request a new one."
        : errorDescription?.replace(/\+/g, " ") || error;
    const dest =
      nextParam === "/auth/reset-password"
        ? `/auth/forgot-password?error=${encodeURIComponent(message)}`
        : `/auth/login?error=${encodeURIComponent(message)}`;
    return NextResponse.redirect(`${origin}${dest}`);
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

  // Password recovery / explicit next path must win (do not send to homepage)
  if (nextParam === "/auth/reset-password") {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const cookieStore = await cookies();
  const redirectFromCookie = cookieStore.get(AUTH_REDIRECT_COOKIE)?.value;

  let next = nextParam || redirectFromCookie || "/dashboard";
  if (!profile) {
    next = "/setup";
  } else if (!profile.onboarding_completed && next !== "/auth/reset-password") {
    next = "/onboarding";
  }
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete(AUTH_REDIRECT_COOKIE);
  return response;
}
