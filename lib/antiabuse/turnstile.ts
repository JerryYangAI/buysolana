import "server-only";

type TurnstileApiResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, ip?: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      code: "TURNSTILE_NOT_CONFIGURED",
      message: "Turnstile is not configured on the server.",
    };
  }

  if (!token) {
    return {
      ok: false,
      code: "TURNSTILE_TOKEN_REQUIRED",
      message: "Turnstile token is required.",
    };
  }

  const form = new URLSearchParams({
    secret,
    response: token,
  });

  if (ip) {
    form.set("remoteip", ip);
  }

  let response: Response;

  try {
    response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form,
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      code: "TURNSTILE_UNREACHABLE",
      message: "Turnstile verification request failed.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      code: "TURNSTILE_UNAVAILABLE",
      message: "Turnstile verification is currently unavailable.",
    };
  }

  const data = (await response.json()) as TurnstileApiResponse;

  if (!data.success) {
    const errors = data["error-codes"]?.join(", ") || "unknown";
    return {
      ok: false,
      code: "TURNSTILE_INVALID",
      message: `Turnstile verification failed: ${errors}`,
    };
  }

  return { ok: true };
}
