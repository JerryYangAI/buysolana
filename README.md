# buysolanas.com

Beginner-first Solana education site built with Next.js App Router + TypeScript + Tailwind.

## Features

- Locale-first routing with App Router segment: `/en/...` and `/zh-CN/...`
- Language switcher in header (`EN | 中文`) with cookie persistence
- First-visit locale detection using `Accept-Language` (if no locale cookie)
- Required site routes: home, prices, learn, solutions, community, news, blog, podcast, course, glossary, ask
- Server-side CoinGecko fetch with 60-second cache and graceful fallback
- MDX content pipeline for learn/blog/podcast/glossary in both locales
- Community MVP with local JSON mock store: posts, thread details, comments, ask form
- SEO basics: localized metadata, canonical URLs, `hreflang`, `sitemap.xml`, `robots.txt`

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- MDX (`next-mdx-remote`, `gray-matter`)
- Cloudflare Pages target deployment

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy env:

```bash
cp .env.example .env.local
```

3. Run dev server:

```bash
pnpm dev
```

4. Open `http://localhost:3000`.

## Validation Commands

```bash
pnpm lint
pnpm build
```

## Environment Variables

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: public anonymous key (can be used for client-side public reads when needed).
- `SUPABASE_SERVICE_ROLE_KEY`: server-only admin key. Never expose to browser.
- `COINGECKO_API_KEY`: CoinGecko key used on server-side fetch.
- `TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key for client-side widgets.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key for server-side verification.
- `ENFORCE_CANONICAL_REDIRECT`: set `1` in production to force redirect to `buysolanas.com`.

Local setup reminder:

1. Copy `.env.example` to `.env.local`.
2. Replace every `__FILL_ME__` with real values.
3. Do not commit real secrets.

## Cloudflare Pages Configuration

Recommended baseline:

- Framework preset: `Next.js`
- Build command: `pnpm install --frozen-lockfile && pnpm build && pnpm pages:build`
- Build output directory: `.vercel/output/static`
- Node.js version: `20+`
- `ENFORCE_CANONICAL_REDIRECT=1` (on canonical production domain setup)

Compatibility note:

- `@cloudflare/next-on-pages` is currently deprecated and has a peer range up to Next `15.5.x`.
- This project is on Next `16.x`, so `pnpm exec next-on-pages` may fail with edge-runtime/prerender validation errors unless you downgrade Next or migrate to the OpenNext Cloudflare adapter.
- `pages:build` removes `nop-build-log.json` after build so the `_worker.js` directory is not bloated by diagnostic logs.

Compatibility suggestions:

- Keep locale routing in `app/[locale]` (no `next.config` i18n routing).
- Ensure your primary domain is `buysolanas.com` and map alternates to redirect at Cloudflare edge.
- For previews, keep `ENFORCE_CANONICAL_REDIRECT=0`.

## Cloudflare Pages Environment Variables（Production）

Add the following variables in Cloudflare Pages:

- `SUPABASE_URL`
  - Can be used by server/client technically, but recommend server-first usage.
- `SUPABASE_ANON_KEY`
  - Can be used in client for public read scenarios if required.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Strictly server-only. Only use inside Next.js Route Handlers / Server Actions / other server code.
- `COINGECKO_API_KEY`
  - Server-side only for CoinGecko requests.

Cloudflare operation path:

1. `Cloudflare Dashboard -> Pages -> <your-project> -> Settings -> Environment variables`
2. In `Production`, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `COINGECKO_API_KEY`
3. Save changes.
4. Trigger a redeploy (or push a new commit) so new env vars take effect.

Security rules:

- Any key containing `SERVICE_ROLE` must NOT use the `NEXT_PUBLIC_` prefix.
- Do NOT read `SUPABASE_SERVICE_ROLE_KEY` in client components.
- Keep `COINGECKO_API_KEY` as server-side env only (no `NEXT_PUBLIC_` prefix).

## Deployment Checklist (Cloudflare Pages)

Before promoting to production, ensure these env vars are configured in Pages:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `COINGECKO_API_KEY`
- `ADMIN_PASSWORD` (required if using `/[locale]/admin/moderation`)
- `ADMIN_SESSION_SECRET` (optional but recommended for admin session signing)

Security reminder:

- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to client bundle.
- Never create `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
- Keep all service-role usage inside server-only modules/route handlers.

Local build artifact check:

```bash
pnpm build
grep -R "sb_secret_" .next
```

The `grep` command should return no hits from your application code.

## Anti-abuse (Turnstile + Rate Limit + Spam Filter)

This project protects write APIs (`/api/community/posts`, `/api/community/posts/[id]/comments`, `/api/ask`) with:

- Cloudflare Turnstile verification (`turnstileToken`)
- IP rate limit (same IP + same path: 1 request / 30 seconds)
- Spam filter:
  - max 2 `http(s)` URLs
  - length checks (`title/subject`: 3-120, `body`: 10-20000, `comment`: 1-5000)
  - duplicate content guard (same IP + same content hash: blocked for 10 minutes)

Required env vars:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Rate limit storage:

- Preferred: Cloudflare KV binding named `ABUSE_KV` (or `RATE_LIMIT_KV`)
- Fallback: in-memory store (works locally, not shared across instances)

Cloudflare Pages KV binding path:

1. `Cloudflare Dashboard -> Pages -> <your-project> -> Settings -> Bindings`
2. Add `KV Namespace Binding`
3. Variable name: `ABUSE_KV`
4. Select/create a namespace, save, then redeploy

Notes:

- Turnstile and anti-abuse checks run before any Supabase insert.
- If Turnstile validation fails, server returns `400/403` and does not write data.

## Content Structure

```txt
content/
  learn/{en,zh-CN}/*.mdx
  blog/{en,zh-CN}/*.mdx
  podcast/{en,zh-CN}/*.mdx
  glossary/{en,zh-CN}/*.mdx
```

## Notes

- This project intentionally refuses buy/sell timing or investment-advice requests and points users to `/security`.
- Do not paste large verbatim third-party educational content; keep lessons in original wording.
