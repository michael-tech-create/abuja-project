import {
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  DEMO_CONVERSATION_ID,
} from "@/lib/chat/demo-data";
import type { ConversationListItem, ThreadMessage } from "@/lib/chat/types";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Profile, Property } from "@/types/database";

type PropertySnippet = Pick<
  Property,
  "id" | "title" | "district" | "images" | "price"
>;
type ProfileSnippet = Pick<Profile, "id" | "full_name" | "avatar_url" | "role">;

export async function listConversations(
  userId: string,
): Promise<{ items: ConversationListItem[]; source: "supabase" | "demo" }> {
  if (!hasSupabaseEnv()) {
    return { items: DEMO_CONVERSATIONS, source: "demo" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("listConversations:", error.message);
    return { items: [], source: "supabase" };
  }

  const items: ConversationListItem[] = [];

  for (const row of data ?? []) {
    const otherId = row.tenant_id === userId ? row.landlord_id : row.tenant_id;

    const [
      { data: property },
      { data: other },
      { data: lastMessages },
      { count },
    ] = await Promise.all([
      supabase
        .from("properties")
        .select("id, title, district, images, price")
        .eq("id", row.property_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", otherId)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("content, created_at, sender_id, is_read")
        .eq("conversation_id", row.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", row.id)
        .eq("is_read", false)
        .neq("sender_id", userId),
    ]);

    items.push({
      id: row.id,
      tenant_id: row.tenant_id,
      landlord_id: row.landlord_id,
      property_id: row.property_id,
      last_message_at: row.last_message_at,
      created_at: row.created_at,
      property: (property as PropertySnippet | null) ?? null,
      other_party: (other as ProfileSnippet | null) ?? null,
      last_message: lastMessages?.[0] ?? null,
      unread_count: count ?? 0,
    });
  }

  return { items, source: "supabase" };
}

export async function getConversationThread(
  conversationId: string,
  userId: string,
): Promise<{
  conversation: ConversationListItem | null;
  messages: ThreadMessage[];
  source: "supabase" | "demo";
}> {
  if (!hasSupabaseEnv()) {
    if (conversationId !== DEMO_CONVERSATION_ID) {
      return { conversation: null, messages: [], source: "demo" };
    }
    return {
      conversation: DEMO_CONVERSATIONS[0],
      messages: DEMO_MESSAGES,
      source: "demo",
    };
  }

  const supabase = await createClient();
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !conversation) {
    return { conversation: null, messages: [], source: "supabase" };
  }

  if (
    conversation.tenant_id !== userId &&
    conversation.landlord_id !== userId
  ) {
    return { conversation: null, messages: [], source: "supabase" };
  }

  const otherId =
    conversation.tenant_id === userId
      ? conversation.landlord_id
      : conversation.tenant_id;

  const [{ data: property }, { data: other }, { data: messages }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("id, title, district, images, price")
        .eq("id", conversation.property_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", otherId)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
  const { data: senders } = senderIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds)
    : { data: [] as Pick<Profile, "id" | "full_name" | "avatar_url">[] };

  const senderMap = new Map((senders ?? []).map((s) => [s.id, s]));

  const thread: ThreadMessage[] = (messages ?? []).map((m) => ({
    ...m,
    sender: senderMap.get(m.sender_id) ?? null,
  }));

  return {
    conversation: {
      id: conversation.id,
      tenant_id: conversation.tenant_id,
      landlord_id: conversation.landlord_id,
      property_id: conversation.property_id,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at,
      property: (property as PropertySnippet | null) ?? null,
      other_party: (other as ProfileSnippet | null) ?? null,
      last_message: thread.length
        ? {
            content: thread[thread.length - 1].content,
            created_at: thread[thread.length - 1].created_at,
            sender_id: thread[thread.length - 1].sender_id,
            is_read: thread[thread.length - 1].is_read,
          }
        : null,
      unread_count: thread.filter(
        (m) => !m.is_read && m.sender_id !== userId,
      ).length,
    },
    messages: thread,
    source: "supabase",
  };
}
