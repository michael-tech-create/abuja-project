import Link from "next/link";

import type { ConversationListItem } from "@/lib/chat/types";
import { districtLabel, formatRentLabel } from "@/lib/properties/format";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  items: ConversationListItem[];
  activeId?: string;
};

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ConversationList({ items, activeId }: ConversationListProps) {
  if (items.length === 0) {
    return (
      <div className="soft-card px-5 py-12 text-center">
        <h2 className="font-heading text-lg font-semibold">No conversations yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a verified listing and tap Message landlord to start chatting.
        </p>
        <Link
          href="/browse"
          className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Browse homes
        </Link>
      </div>
    );
  }

  return (
    <ul className="soft-card divide-y divide-border/60 overflow-hidden">
      {items.map((item) => {
        const active = item.id === activeId;
        const cover = item.property?.images?.[0];
        return (
          <li key={item.id}>
            <Link
              href={`/messages/${item.id}`}
              className={cn(
                "flex gap-3 px-4 py-3 transition-colors hover:bg-sand/70 sm:px-5",
                active && "bg-sand/80",
              )}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="size-14 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="size-14 shrink-0 rounded-2xl bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium">
                    {item.other_party?.full_name ?? "Conversation"}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {relativeTime(item.last_message_at ?? item.created_at)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.property
                    ? `${item.property.title} · ${districtLabel(item.property.district)}`
                    : "Property chat"}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted-foreground">
                    {item.last_message?.content ?? "No messages yet"}
                  </p>
                  {item.unread_count > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sage-foreground px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {item.unread_count}
                    </span>
                  )}
                </div>
                {item.property && (
                  <p className="mt-0.5 text-[11px] font-medium text-foreground/80">
                    {formatRentLabel(item.property.price)}
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
