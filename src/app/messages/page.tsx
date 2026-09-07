import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ConversationList } from "@/components/chat/conversation-list";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEMO_TENANT } from "@/lib/chat/demo-data";
import { listConversations } from "@/lib/chat/queries";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const demoMode = !hasSupabaseEnv();
  const user = await getSessionUser();
  const profile = await getCurrentProfile();

  if (!demoMode) {
    if (!user) redirect("/auth/login?next=/messages");
    if (!profile?.onboarding_completed) redirect("/onboarding");
  }

  const userId = user?.id ?? DEMO_TENANT.id;
  const { items, source } = await listConversations(userId);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time chats with verified landlords and agents about Abuja
            listings.
          </p>
        </div>

        {source === "demo" && (
          <Alert className="rounded-3xl border-border/70 bg-card">
            <AlertTitle>Demo inbox</AlertTitle>
            <AlertDescription>
              Supabase is not connected, so this is a sample conversation. Open
              it to try typing, read receipts styling, and a simulated reply.{" "}
              <Link href="/browse" className="underline underline-offset-2">
                Browse demo homes
              </Link>{" "}
              and use Message landlord to jump in.
            </AlertDescription>
          </Alert>
        )}

        <ConversationList items={items} />
      </main>
    </div>
  );
}
