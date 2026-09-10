"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  CheckCheckIcon,
  ImageIcon,
  PaperclipIcon,
  SendIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";

import { UploadProgressBar } from "@/components/media/upload-progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  markConversationReadAction,
  sendMessageAction,
} from "@/lib/chat/actions";
import type { ConversationListItem, ThreadMessage } from "@/lib/chat/types";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  ACCEPTED_CHAT_MEDIA_TYPES,
  MAX_CHAT_MEDIA_BYTES,
  mediaKindFromMime,
} from "@/lib/media/constants";
import {
  buildStorageObjectPath,
  simulateUploadWithProgress,
  uploadFileWithProgress,
} from "@/lib/media/upload-with-progress";
import { districtLabel, formatRentLabel } from "@/lib/properties/format";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import type { MessageMediaType } from "@/types/database";

type ChatThreadProps = {
  conversation: ConversationListItem;
  initialMessages: ThreadMessage[];
  currentUserId: string;
  source: "supabase" | "demo";
};

type PendingMedia = {
  file: File;
  previewUrl: string;
  kind: Exclude<MessageMediaType, "none">;
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function ChatThread({
  conversation,
  initialMessages,
  currentUserId,
  source,
}: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingChannelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const otherName = conversation.other_party?.full_name ?? "Chat partner";
  const uploading = uploadPercent != null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping, pendingMedia, uploadPercent]);

  useEffect(() => {
    void markConversationReadAction(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    return () => {
      if (pendingMedia?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pendingMedia.previewUrl);
      }
      abortRef.current?.abort();
    };
  }, [pendingMedia]);

  useEffect(() => {
    if (source !== "supabase" || !hasSupabaseEnv()) return;

    let cancelled = false;
    const supabase = createClient();

    const messagesChannel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = payload.new as ThreadMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
          if (row.sender_id !== currentUserId) {
            void markConversationReadAction(conversation.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = payload.new as ThreadMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)),
          );
        },
      )
      .subscribe();

    const presenceChannel = supabase.channel(`typing:${conversation.id}`, {
      config: { presence: { key: currentUserId } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<{
          typing?: boolean;
          user_id?: string;
        }>();
        const othersTyping = Object.values(state)
          .flat()
          .some(
            (meta) => meta.user_id !== currentUserId && Boolean(meta.typing),
          );
        if (!cancelled) setPeerTyping(othersTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: currentUserId,
            typing: false,
          });
        }
      });

    typingChannelRef.current = presenceChannel;

    return () => {
      cancelled = true;
      void supabase.removeChannel(messagesChannel);
      void supabase.removeChannel(presenceChannel);
    };
  }, [conversation.id, currentUserId, source]);

  const broadcastTyping = useCallback(
    async (typing: boolean) => {
      const channel = typingChannelRef.current;
      if (!channel) return;
      await channel.track({ user_id: currentUserId, typing });
    },
    [currentUserId],
  );

  function onContentChange(value: string) {
    setContent(value);
    if (source !== "supabase") return;
    void broadcastTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      void broadcastTyping(false);
    }, 1200);
  }

  function clearPendingMedia() {
    if (pendingMedia?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pendingMedia.previewUrl);
    }
    setPendingMedia(null);
  }

  function onPickMedia(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);

    if (
      !ACCEPTED_CHAT_MEDIA_TYPES.includes(
        file.type as (typeof ACCEPTED_CHAT_MEDIA_TYPES)[number],
      )
    ) {
      setError("Use MP4/WebM/MOV video or JPEG/PNG/WebP/GIF image.");
      return;
    }
    if (file.size > MAX_CHAT_MEDIA_BYTES) {
      setError("Media must be under 100MB.");
      return;
    }

    clearPendingMedia();
    setPendingMedia({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: mediaKindFromMime(file.type),
    });
  }

  async function uploadSelectedMedia(): Promise<{
    url: string;
    type: Exclude<MessageMediaType, "none">;
    mime: string;
  } | null> {
    if (!pendingMedia) return null;

    const controller = new AbortController();
    abortRef.current = controller;
    setUploadPercent(0);

    try {
      if (source === "demo" || !hasSupabaseEnv()) {
        const url = await simulateUploadWithProgress(
          pendingMedia.file,
          (p) => setUploadPercent(p.percent),
          controller.signal,
        );
        return {
          url,
          type: pendingMedia.kind,
          mime: pendingMedia.file.type,
        };
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sign in again to upload media.");
      }

      const path = buildStorageObjectPath(
        currentUserId,
        conversation.id,
        `${Date.now()}-${pendingMedia.file.name}`,
      );

      const result = await uploadFileWithProgress({
        bucket: STORAGE_BUCKETS.chatMedia,
        path,
        file: pendingMedia.file,
        accessToken: session.access_token,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
          /\/rest\/v1\/?$/i,
          "",
        ).replace(/\/$/, ""),
        onProgress: (p) => setUploadPercent(p.percent),
        signal: controller.signal,
      });

      return {
        url: result.publicUrl,
        type: pendingMedia.kind,
        mime: pendingMedia.file.type,
      };
    } finally {
      setUploadPercent(null);
      abortRef.current = null;
    }
  }

  async function submitMessage() {
    const trimmed = content.trim();
    if (!trimmed && !pendingMedia) return;
    if (uploading || pending) return;
    setError(null);

    try {
      const uploaded = await uploadSelectedMedia();

      if (source === "demo") {
        const optimistic: ThreadMessage = {
          id: `demo-local-${Date.now()}`,
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content:
            trimmed ||
            (uploaded?.type === "video" ? "Sent a video" : uploaded ? "Sent a photo" : ""),
          media_url: uploaded?.url ?? null,
          media_type: uploaded?.type ?? "none",
          media_mime: uploaded?.mime ?? null,
          is_read: false,
          read_at: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        setContent("");
        clearPendingMedia();

        setTimeout(() => {
          setPeerTyping(true);
          setTimeout(() => {
            setPeerTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `demo-reply-${Date.now()}`,
                conversation_id: conversation.id,
                sender_id: conversation.landlord_id,
                content:
                  uploaded?.type === "video"
                    ? "Thanks for the video — I received it in real time."
                    : "Thanks for your message — happy to schedule a viewing this weekend.",
                media_url: null,
                media_type: "none",
                media_mime: null,
                is_read: false,
                read_at: null,
                created_at: new Date().toISOString(),
              },
            ]);
          }, 900);
        }, 500);
        return;
      }

      const fd = new FormData();
      fd.set("conversationId", conversation.id);
      fd.set("content", trimmed);
      if (uploaded) {
        fd.set("mediaUrl", uploaded.url);
        fd.set("mediaType", uploaded.type);
        fd.set("mediaMime", uploaded.mime);
      }

      setContent("");
      clearPendingMedia();
      void broadcastTyping(false);

      startTransition(async () => {
        const result = await sendMessageAction({}, fd);
        if (result.error) {
          setError(result.error);
          setContent(trimmed);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  const cover = conversation.property?.images?.[0];
  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [messages],
  );

  return (
    <div className="soft-card flex min-h-[70vh] flex-col overflow-hidden lg:min-h-[75vh]">
      <div className="flex items-center gap-3 border-b border-border/70 bg-card/80 px-4 py-3 sm:px-5">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="size-12 rounded-2xl object-cover"
          />
        ) : (
          <div className="size-12 rounded-2xl bg-sand" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold">
            {otherName}
          </p>
          {conversation.property && (
            <Link
              href={`/properties/${conversation.property.id}`}
              className="truncate text-xs text-muted-foreground hover:text-foreground"
            >
              {conversation.property.title} ·{" "}
              {districtLabel(conversation.property.district)} ·{" "}
              {formatRentLabel(conversation.property.price)}
            </Link>
          )}
        </div>
        {source === "demo" && <span className="sage-pill">Demo chat</span>}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-sand/40 px-4 py-5 sm:px-5">
        {sorted.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] space-y-2 rounded-3xl px-3 py-2.5 text-sm shadow-sm sm:max-w-[70%]",
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/60 bg-card text-foreground",
                )}
              >
                {message.media_type === "video" && message.media_url && (
                  <video
                    src={message.media_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-64 w-full rounded-2xl bg-black/80"
                  />
                )}
                {message.media_type === "image" && message.media_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.media_url}
                    alt=""
                    className="max-h-64 w-full rounded-2xl object-cover"
                  />
                )}
                {message.content &&
                  !(
                    message.media_url &&
                    (message.content === "Sent a video" ||
                      message.content === "Sent a photo")
                  ) && (
                    <p className="whitespace-pre-wrap px-1 leading-relaxed">
                      {message.content}
                    </p>
                  )}
                <div
                  className={cn(
                    "flex items-center gap-1 px-1 text-[10px]",
                    mine
                      ? "justify-end text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {message.media_type === "video" && (
                    <VideoIcon className="size-3 opacity-70" />
                  )}
                  {message.media_type === "image" && (
                    <ImageIcon className="size-3 opacity-70" />
                  )}
                  <span>{formatTime(message.created_at)}</span>
                  {mine && (
                    <CheckCheckIcon
                      className={cn(
                        "size-3.5",
                        message.is_read ? "opacity-100" : "opacity-50",
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {peerTyping && (
          <div className="flex justify-start">
            <div className="rounded-3xl rounded-bl-md border border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground">
              {otherName.split(" ")[0]} is typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-3 border-t border-border/70 bg-card p-3 sm:p-4">
        {error && <p className="text-xs text-destructive">{error}</p>}

        {pendingMedia && (
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-sand/40">
            {pendingMedia.kind === "video" ? (
              <video
                src={pendingMedia.previewUrl}
                className="max-h-40 w-full object-cover"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pendingMedia.previewUrl}
                alt=""
                className="max-h-40 w-full object-cover"
              />
            )}
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              className="absolute top-2 right-2 rounded-full"
              onClick={clearPendingMedia}
              disabled={uploading}
              aria-label="Remove attachment"
            >
              <XIcon />
            </Button>
            <div className="absolute bottom-2 left-2">
              <span className="sage-pill capitalize">{pendingMedia.kind} ready</span>
            </div>
          </div>
        )}

        {uploadPercent != null && (
          <UploadProgressBar
            percent={uploadPercent}
            label={
              pendingMedia?.kind === "video"
                ? "Uploading video in real time…"
                : "Uploading photo…"
            }
          />
        )}

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitMessage();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_CHAT_MEDIA_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              onPickMedia(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-2xl"
            disabled={uploading || pending}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach photo or video"
          >
            <PaperclipIcon />
          </Button>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write a message or attach a video…"
            rows={2}
            className="min-h-[44px] flex-1 resize-none rounded-2xl bg-background"
            disabled={uploading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submitMessage();
              }
            }}
          />
          <Button
            type="submit"
            size="icon-lg"
            className="rounded-2xl"
            disabled={uploading || pending || (!content.trim() && !pendingMedia)}
            aria-label="Send message"
          >
            <SendIcon />
          </Button>
        </form>
        <p className="text-[11px] text-muted-foreground">
          Photos & videos upload with live progress, then appear instantly in
          this chat (MP4/WebM/MOV up to 100MB).
        </p>
      </div>
    </div>
  );
}
