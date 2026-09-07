type UploadProgressBarProps = {
  percent: number;
  label?: string;
};

export function UploadProgressBar({
  percent,
  label = "Uploading…",
}: UploadProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="space-y-1.5 rounded-2xl border border-border/70 bg-sand/50 px-3 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground tabular-nums">
          {clamped}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
