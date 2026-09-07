import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-8 text-sm font-semibold tracking-tight text-foreground"
        >
          {APP_NAME}
        </Link>
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
