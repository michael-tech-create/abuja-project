import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSchemaStatus } from "@/lib/supabase/schema";

export const metadata: Metadata = {
  title: "Database setup",
};

export default async function SetupPage() {
  const status = await getSchemaStatus();

  if (status.ok) {
    redirect("/dashboard");
  }

  const projectRef = "bcuigulfzawjkymdwujl";
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Setup required
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Database schema not applied
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Your Supabase project is connected, but the AbujaRentals tables (like{" "}
          <code className="text-foreground">public.profiles</code>) are missing.
          Apply the schema once, then continue signup/onboarding.
        </p>
      </div>

      <Alert className="rounded-3xl border-border/70 bg-card">
        <AlertTitle>Error from Supabase</AlertTitle>
        <AlertDescription className="break-words">
          {status.message}
        </AlertDescription>
      </Alert>

      <Alert className="rounded-3xl border-amber-500/30 bg-amber-50">
        <AlertTitle>If you saw: query too small / &gt;=1 characters</AlertTitle>
        <AlertDescription>
          That means the SQL Editor ran an <strong>empty</strong> query. Paste
          the file contents into the editor first, then click{" "}
          <strong>Run</strong> (not “Run selected” unless text is highlighted).
        </AlertDescription>
      </Alert>

      <ol className="soft-card list-decimal space-y-3 px-6 py-5 pl-10 text-sm leading-relaxed">
        <li>
          Open the{" "}
          <a
            href={sqlEditorUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Supabase SQL Editor
          </a>
          .
        </li>
        <li>
          Open <code className="text-foreground">scripts/INSTALL.sql</code> in
          this project (one file, safe to re-run).
        </li>
        <li>
          Select all (<kbd>Ctrl+A</kbd>) → Copy (<kbd>Ctrl+C</kbd>).
        </li>
        <li>
          Click inside the Supabase SQL box → Paste (<kbd>Ctrl+V</kbd>). You
          must see SQL text (starts with{" "}
          <code>AbujaRentals ONE-SHOT INSTALL</code>), not an empty box.
        </li>
        <li>
          Click <strong>Run</strong> once. Ignore older STEP1/STEP2 files —
          they caused the out-of-order errors.
        </li>
        <li>
          Success should show{" "}
          <code className="text-foreground">AbujaRentals schema installed</code>
          .
        </li>
        <li>
          Refresh this page, then{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            log in
          </Link>
          .
        </li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <a
          href={sqlEditorUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Open SQL Editor
        </a>
        <Link
          href="/auth/login"
          className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium hover:bg-sand"
        >
          Back to login
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Use only <code>scripts/INSTALL.sql</code>. Do not run the old STEP1–STEP5
        files separately (that caused &quot;profiles does not exist&quot;).
      </p>
    </main>
  );
}
