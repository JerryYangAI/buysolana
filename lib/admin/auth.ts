import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(new Uint8Array(signature));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword()) && Boolean(getSessionSecret());
}

export async function verifyAdminPassword(input: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

async function createSessionToken(exp: number) {
  const payload = String(exp);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

async function verifySessionToken(token: string | undefined) {
  if (!token) return false;

  const [expRaw, signature] = token.split(".");
  if (!expRaw || !signature) return false;

  const expected = await sign(expRaw);
  if (!safeEqual(signature, expected)) return false;

  const exp = Number.parseInt(expRaw, 10);
  if (!Number.isFinite(exp)) return false;

  return exp > Math.floor(Date.now() / 1000);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;

  cookieStore.set(COOKIE_NAME, await createSessionToken(exp), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminSessionValid() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
