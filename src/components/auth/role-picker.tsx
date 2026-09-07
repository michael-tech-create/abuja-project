"use client";

import { ROLE_OPTIONS } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

type RolePickerProps = {
  name?: string;
  value: RoleValue;
  onChange: (value: RoleValue) => void;
};

export function RolePicker({ name = "role", value, onChange }: RolePickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">I am a…</legend>
      <input type="hidden" name={name} value={value} />
      <div className="grid gap-2">
        {ROLE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:bg-muted/60",
              )}
            >
              <div className="text-sm font-medium text-foreground">
                {option.title}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
