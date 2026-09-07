import { DEMO_PUBLIC_PROPERTIES } from "@/lib/properties/demo-data";
import type { ConversationListItem, ThreadMessage } from "@/lib/chat/types";

export const DEMO_TENANT = {
  id: "demo-tenant",
  full_name: "Adaeze Okonkwo",
  avatar_url: null as string | null,
  role: "tenant" as const,
};

export const DEMO_LANDLORD = {
  id: "demo-owner",
  full_name: "Chinedu Properties",
  avatar_url: null as string | null,
  role: "landlord" as const,
};

const property = DEMO_PUBLIC_PROPERTIES[0];

export const DEMO_CONVERSATION_ID = "demo-conversation-1";

export const DEMO_CONVERSATIONS: ConversationListItem[] = [
  {
    id: DEMO_CONVERSATION_ID,
    tenant_id: DEMO_TENANT.id,
    landlord_id: DEMO_LANDLORD.id,
    property_id: property.id,
    last_message_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    property: {
      id: property.id,
      title: property.title,
      district: property.district,
      images: property.images,
      price: property.price,
    },
    other_party: DEMO_LANDLORD,
    last_message: {
      content: "Here’s a quick walkthrough video of the living room.",
      created_at: new Date().toISOString(),
      sender_id: DEMO_LANDLORD.id,
      is_read: false,
    },
    unread_count: 1,
  },
];

export const DEMO_MESSAGES: ThreadMessage[] = [
  {
    id: "demo-msg-1",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_TENANT.id,
    content:
      "Hi, I saw your verified listing in Gwarinpa. Is a March move-in possible?",
    media_url: null,
    media_type: "none",
    media_mime: null,
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    sender: DEMO_TENANT,
  },
  {
    id: "demo-msg-2",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_LANDLORD.id,
    content: "Hello Adaeze — yes, March works. Would you like a weekend viewing?",
    media_url: null,
    media_type: "none",
    media_mime: null,
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    sender: DEMO_LANDLORD,
  },
  {
    id: "demo-msg-3",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_TENANT.id,
    content: "Saturday afternoon would be perfect. Thank you!",
    media_url: null,
    media_type: "none",
    media_mime: null,
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    sender: DEMO_TENANT,
  },
  {
    id: "demo-msg-4",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_LANDLORD.id,
    content: "Here’s a quick walkthrough video of the living room.",
    media_url:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    media_type: "video",
    media_mime: "video/mp4",
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    sender: DEMO_LANDLORD,
  },
];
