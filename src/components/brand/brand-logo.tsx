import Image from "next/image";
import Link from "next/link";

import { BRAND_LOGO } from "@/lib/brand";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  showWordmark?: boolean;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  showWordmark = false,
  className,
  imgClassName,
  priority = false,
}: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={BRAND_LOGO}
        alt={`${APP_NAME} logo`}
        width={200}
        height={100}
        priority={priority}
        className={cn(
          "h-10 w-auto rounded-lg object-contain shadow-sm ring-1 ring-primary/15",
          imgClassName,
        )}
      />
      {showWordmark && (
        <span className="font-heading text-base font-semibold tracking-tight text-primary">
          {APP_NAME}
        </span>
      )}
    </span>
  );

  // Pass href="" to render logo without a link
  if (!href) return content;
  return (
    <Link href={href} className="inline-flex shrink-0">
      {content}
    </Link>
  );
}
