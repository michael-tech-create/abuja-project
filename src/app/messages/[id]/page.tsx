import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationList } from "@/components/chat/conversation-list";
import { SiteHeader } from "@/components/layout/site-header";
import { DEMO_TENANT } from "@/lib/chat/demo-data";
import { getConversationThread, listConversations } from "@/lib/chat/queries";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const demoMode = !hasSupabaseEnv();
  const user = await getSessionUser();
  const profile = await getCurrentProfile();

  if (!demoMode) {
    if (!user) redirect(`/auth/login?next=/messages/${id}`);
    if (!profile?.onboarding_completed) redirect("/onboarding");
  }

  const userId = user?.id ?? DEMO_TENANT.id;
  const [{ conversation, messages, source }, { items }] = await Promise.all([
    getConversationThread(id, userId),
    listConversations(userId),
  ]);

  if (!conversation) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader profile={profile} />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-heading text-xl font-semibold">Messages</h1>
            <Link
              href="/messages"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All
            </Link>
          </div>
          <ConversationList items={items} activeId={id} />
        </aside>

        <div className="space-y-3">
          <Link
            href="/messages"
            className="text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            ← All messages
          </Link>
          <ChatThread
            conversation={conversation}
            initialMessages={messages}
            currentUserId={userId}
            source={source}
          />
        </div>
      </main>
    </div>
  );
}
