import type { Message, Profile, Property } from "@/types/database";

export type ConversationListItem = {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  last_message_at: string | null;
  created_at: string;
  property: Pick<Property, "id" | "title" | "district" | "images" | "price"> | null;
  other_party: Pick<Profile, "id" | "full_name" | "avatar_url" | "role"> | null;
  last_message: Pick<Message, "content" | "created_at" | "sender_id" | "is_read"> | null;
  unread_count: number;
};

export type ThreadMessage = Message & {
  sender?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};
