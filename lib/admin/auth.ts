import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  const secret = getSessionSecret();
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword()) && Boolean(getSessionSecret());
}

export function verifyAdminPassword(input: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

function createSessionToken(exp: number) {
  const payload = String(exp);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string | undefined) {
  if (!token) return false;

  const [expRaw, signature] = token.split(".");
  if (!expRaw || !signature) return false;

  const expected = sign(expRaw);
  if (!safeEqual(signature, expected)) return false;

  const exp = Number.parseInt(expRaw, 10);
  if (!Number.isFinite(exp)) return false;

  return exp > Math.floor(Date.now() / 1000);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;

  cookieStore.set(COOKIE_NAME, createSessionToken(exp), {
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
