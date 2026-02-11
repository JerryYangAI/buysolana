import "server-only";

type KvLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type StoredValue = {
  value: string;
  expiresAt: number;
};

const memoryStore = new Map<string, StoredValue>();

function nowMs() {
  return Date.now();
}

function cleanupExpired() {
  const now = nowMs();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

function getKvBinding(): KvLike | null {
  const globalAny = globalThis as Record<string, unknown>;

  for (const name of ["ABUSE_KV", "RATE_LIMIT_KV"]) {
    const candidate = globalAny[name] as KvLike | undefined;
    if (candidate && typeof candidate.get === "function" && typeof candidate.put === "function") {
      return candidate;
    }
  }

  return null;
}

export async function readAbuseKey(key: string): Promise<string | null> {
  const kv = getKvBinding();

  if (kv) {
    return kv.get(key);
  }

  cleanupExpired();
  const hit = memoryStore.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs()) {
    memoryStore.delete(key);
    return null;
  }
  return hit.value;
}

export async function writeAbuseKey(key: string, value: string, ttlSeconds: number) {
  const kv = getKvBinding();

  if (kv) {
    await kv.put(key, value, { expirationTtl: ttlSeconds });
    return;
  }

  memoryStore.set(key, {
    value,
    expiresAt: nowMs() + ttlSeconds * 1000,
  });
}

export function extractClientIp(headers: Headers) {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";

  return "unknown";
}

export async function enforceRateLimit(input: {
  path: string;
  ip: string;
  limit: number;
  ttlSeconds: number;
}) {
  const key = `rl:${input.path}:${input.ip}`;
  const currentRaw = await readAbuseKey(key);
  const current = Number.parseInt(currentRaw || "0", 10);

  if (Number.isFinite(current) && current >= input.limit) {
    return {
      ok: false as const,
      key,
    };
  }

  const nextValue = Number.isFinite(current) ? current + 1 : 1;
  await writeAbuseKey(key, String(nextValue), input.ttlSeconds);

  return {
    ok: true as const,
    key,
  };
}
