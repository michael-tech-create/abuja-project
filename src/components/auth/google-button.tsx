import { startGoogleOAuth } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type GoogleButtonProps = {
  mode: "login" | "signup";
  role?: string;
  label?: string;
};

export function GoogleButton({
  mode,
  role = "tenant",
  label = "Continue with Google",
}: GoogleButtonProps) {
  return (
    <form action={startGoogleOAuth}>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="role" value={role} />
      <Button type="submit" variant="outline" className="w-full gap-2">
        <GoogleIcon />
        {label}
      </Button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.8 14.5 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.7H12z"
      />
    </svg>
  );
}
