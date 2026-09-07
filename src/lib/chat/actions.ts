"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DEMO_CONVERSATION_ID } from "@/lib/chat/demo-data";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import type { MessageMediaType } from "@/types/database";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type ChatActionState = {
  error?: string;
  success?: string;
};

export async function startConversationAction(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) {
    redirect("/browse");
  }

  if (!hasSupabaseEnv()) {
    redirect(`/messages/${DEMO_CONVERSATION_ID}`);
  }

  const user = await getSessionUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) {
    redirect(`/auth/login?next=/properties/${propertyId}`);
  }

  if (profile.role !== "tenant" && profile.role !== "admin") {
    redirect(`/properties/${propertyId}?error=tenants_only`);
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, owner_id, verification_status, is_published")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError || !property) {
    redirect("/browse");
  }

  if (
    property.verification_status !== "verified" ||
    !property.is_published
  ) {
    redirect(`/properties/${propertyId}?error=not_available`);
  }

  if (property.owner_id === user.id) {
    redirect(`/properties/${propertyId}?error=own_listing`);
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("tenant_id", user.id)
    .eq("landlord_id", property.owner_id)
    .eq("property_id", property.id)
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      tenant_id: user.id,
      landlord_id: property.owner_id,
      property_id: property.id,
    })
    .select("id")
    .single();

  if (error || !created) {
    redirect(
      `/properties/${propertyId}?error=${encodeURIComponent(error?.message ?? "chat_failed")}`,
    );
  }

  revalidatePath("/messages");
  redirect(`/messages/${created.id}`);
}

export async function sendMessageAction(
  _prev: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim() || null;
  const mediaTypeRaw = String(formData.get("mediaType") ?? "none");
  const mediaMime = String(formData.get("mediaMime") ?? "").trim() || null;

  const mediaType = (
    ["none", "image", "video"].includes(mediaTypeRaw)
      ? mediaTypeRaw
      : "none"
  ) as MessageMediaType;

  if (!conversationId) return { error: "Missing conversation." };
  if (!content && !mediaUrl) {
    return { error: "Type a message or attach a photo/video." };
  }
  if (content.length > 4000) return { error: "Message is too long." };
  if (mediaUrl && mediaType === "none") {
    return { error: "Invalid media attachment." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "demo" };
  }

  const user = await getSessionUser();
  if (!user) return { error: "You must be signed in." };

  const supabase = await createClient();
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, tenant_id, landlord_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError || !conversation) {
    return { error: "Conversation not found." };
  }

  if (
    conversation.tenant_id !== user.id &&
    conversation.landlord_id !== user.id
  ) {
    return { error: "You are not part of this conversation." };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content || (mediaType === "video" ? "Sent a video" : "Sent a photo"),
    media_url: mediaUrl,
    media_type: mediaUrl ? mediaType : "none",
    media_mime: mediaUrl ? mediaMime : null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: "sent" };
}

export async function markConversationReadAction(conversationId: string) {
  if (!hasSupabaseEnv()) return;

  const user = await getSessionUser();
  if (!user) return;

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, tenant_id, landlord_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.tenant_id !== user.id && conversation.landlord_id !== user.id)
  ) {
    return;
  }

  await supabase
    .from("messages")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
