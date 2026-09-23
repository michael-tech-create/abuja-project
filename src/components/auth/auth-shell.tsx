import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_LOGIN_BG } from "@/lib/brand";
import { APP_NAME } from "@/lib/constants";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Full-bleed brand background (login / signup) */
  withBackground?: boolean;
};

export function AuthShell({
  title,
  description,
  children,
  withBackground = false,
}: AuthShellProps) {
  if (!withBackground) {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
          <BrandLogo className="mb-8" priority />
          <div className="mb-8 space-y-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={BRAND_LOGIN_BG}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/55 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/50 to-primary/70" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl shadow-primary/20 backdrop-blur-md sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <BrandLogo
              imgClassName="h-16 w-auto rounded-xl"
              priority
            />
            <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {APP_NAME}
            </p>
          </div>
          <div className="mb-6 space-y-2 text-center">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-white/85">
          <Link href="/" className="underline underline-offset-4 hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
