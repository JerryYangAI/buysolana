import "server-only";

import { createHash } from "node:crypto";
import { readAbuseKey, writeAbuseKey } from "@/lib/antiabuse/rateLimit";

const URL_REGEX = /https?:\/\/[^\s)]+/gi;

export function countHttpUrls(input: string) {
  const matches = input.match(URL_REGEX);
  return matches ? matches.length : 0;
}

export function countUrlsInFields(values: string[]) {
  return values.reduce((total, value) => total + countHttpUrls(value), 0);
}

export function isLengthBetween(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}

export function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function enforceDuplicateCheck(input: {
  path: string;
  ip: string;
  content: string;
  ttlSeconds: number;
}) {
  const hash = sha256Hex(input.content);
  const key = `dup:${input.path}:${input.ip}:${hash}`;
  const seen = await readAbuseKey(key);

  if (seen) {
    return {
      ok: false as const,
      key,
      hash,
    };
  }

  await writeAbuseKey(key, "1", input.ttlSeconds);

  return {
    ok: true as const,
    key,
    hash,
  };
}
