import { HeartIcon } from "lucide-react";

import { toggleFavoriteAction } from "@/lib/favorites/actions";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  propertyId: string;
  liked: boolean;
  path?: string;
  className?: string;
};

export function LikeButton({
  propertyId,
  liked,
  path = "/browse",
  className,
}: LikeButtonProps) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        aria-label={liked ? "Unlike listing" : "Like listing"}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-card/95 shadow-sm backdrop-blur transition hover:bg-sand",
          liked && "border-destructive/30 text-destructive",
          className,
        )}
      >
        <HeartIcon
          className={cn("size-4", liked && "fill-current")}
        />
      </button>
    </form>
  );
}
