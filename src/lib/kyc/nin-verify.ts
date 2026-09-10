export type NinVerifyResult =
  | {
      ok: true;
      provider: "dojah" | "mock";
      firstName?: string;
      lastName?: string;
      middleName?: string;
      raw?: unknown;
    }
  | {
      ok: false;
      provider: "dojah" | "mock";
      message: string;
    };

const NIN_REGEX = /^\d{11}$/;

export function normalizeNin(input: string) {
  return input.replace(/\D/g, "");
}

export function isValidNinFormat(nin: string) {
  return NIN_REGEX.test(normalizeNin(nin));
}

/**
 * Verify NIN via Dojah when DOJAH_APP_ID + DOJAH_SECRET_KEY are set.
 * Without keys, uses mock mode (valid 11-digit NIN passes) for development.
 */
export async function verifyNinWithDojah(ninRaw: string): Promise<NinVerifyResult> {
  const nin = normalizeNin(ninRaw);
  if (!isValidNinFormat(nin)) {
    return {
      ok: false,
      provider: "mock",
      message: "NIN must be exactly 11 digits.",
    };
  }

  const appId = process.env.DOJAH_APP_ID?.trim();
  const secret = process.env.DOJAH_SECRET_KEY?.trim();
  const base =
    process.env.DOJAH_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://api.dojah.io";

  if (!appId || !secret) {
    // Dev / until keys are added on Vercel
    return {
      ok: true,
      provider: "mock",
      firstName: "Verified",
      lastName: "User",
    };
  }

  try {
    const url = `${base}/api/v1/kyc/nin?nin=${encodeURIComponent(nin)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        AppId: appId,
        Authorization: secret,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const body = (await res.json().catch(() => ({}))) as {
      entity?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
      };
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        provider: "dojah",
        message:
          body.message ||
          body.error ||
          `Dojah verification failed (${res.status}).`,
      };
    }

    const entity = body.entity;
    if (!entity) {
      return {
        ok: false,
        provider: "dojah",
        message: "NIN not found or could not be verified.",
      };
    }

    return {
      ok: true,
      provider: "dojah",
      firstName: entity.first_name,
      lastName: entity.last_name,
      middleName: entity.middle_name,
      raw: body,
    };
  } catch (err) {
    return {
      ok: false,
      provider: "dojah",
      message:
        err instanceof Error
          ? err.message
          : "Could not reach Dojah NIN service.",
    };
  }
}
