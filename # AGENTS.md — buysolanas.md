# AGENTS.md — buysolanas.com (Beginner-first Solana education)

## Product goal
Build a beginner-first Solana education site:
- Learn (7-step course + glossary)
- Prices (CoinGecko, cached)
- Community (Q&A + ask form)
- Solutions / News / Blog & Podcast
- A chat widget that always routes users to internal lessons.
- Bilingual site: English + Simplified Chinese (language switcher + localized SEO).

## Hard rules
- Do NOT copy large verbatim text from solana.com or other sites. Rewrite in original wording.
- For any “buy/sell timing” or investment advice: refuse + show risk disclaimer + link to /security.
- Keep the UI minimal, dark, mobile-first. Fast load is priority.
- i18n must be first-class:
  - Supported locales: `en` and `zh-CN` only. Default: `en`.
  - URL must include locale: `/en/...` and `/zh-CN/...`.
  - Header must include a clear language toggle: `EN | 中文`.
  - Locale choice must persist (prefer cookie for SSR; localStorage optional).
  - If no saved locale, detect from `Accept-Language`.
  - All internal links must preserve the current locale.
  - For invalid locales, return 404.

## Tech stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Deploy: Cloudflare Pages
- Data: CoinGecko API (server-side fetch + 60s cache)
- Content: MDX for Learn/Blog/Glossary
- Community: MVP DB (Supabase preferred) for posts/comments + ask form
- i18n: App Router `[locale]` route segment + messages JSON (library optional; keep minimal)

## Routes
All routes MUST live under `app/[locale]/...` (do NOT rely on `next.config.js` i18n routing).

- /[locale]/ (Home: Hero + quick prices + course entry + solutions + community + news + blog/podcast)
- /[locale]/start
- /[locale]/course, /[locale]/course/[step]
- /[locale]/learn, /[locale]/learn/[slug]
- /[locale]/glossary, /[locale]/glossary/[term]
- /[locale]/prices, /[locale]/prices/[id]
- /[locale]/ask (form -> saved + optionally auto-create a community thread)
- /[locale]/community, /[locale]/community/new, /[locale]/community/[id]
- /[locale]/news
- /[locale]/blog, /[locale]/blog/[slug]
- /[locale]/podcast, /[locale]/podcast/[slug]

## Content & i18n organization
- Messages:
  - `messages/en.json`
  - `messages/zh-CN.json`
- MDX content should be localized. Use one consistent approach:
  - Preferred: per-locale folders, same slugs:
    - `content/learn/en/*.mdx`, `content/learn/zh-CN/*.mdx`
    - `content/blog/en/*.mdx`, `content/blog/zh-CN/*.mdx`
    - `content/podcast/en/*.mdx`, `content/podcast/zh-CN/*.mdx`
    - `content/glossary/en/*.mdx`, `content/glossary/zh-CN/*.mdx`
- Every page must render correct language UI text and link to the same page in the other locale.

## SEO
- Generate `sitemap.xml` and `robots.txt`.
- Canonical must point to buysolanas.com AND include the locale path (`/en/...` or `/zh-CN/...`).
- Titles/Descriptions/OpenGraph on every page (localized).
- Add `hreflang` alternates for `en` and `zh-CN` where feasible.
- Avoid duplicate content; use 301 for other domains to the canonical page on buysolanas.com.

## Prices data rules
- Fetch CoinGecko server-side with caching (60s).
- Resilient: handle rate limits and missing API key gracefully (show cached/placeholder + error banner).
- Never fetch CoinGecko directly from the client with the API key.

## Community MVP rules
- Anonymous read is allowed.
- Posting can be allowed without login for MVP, but must include basic anti-spam (rate limit, honeypot, or captcha later).
- Ask form should save submissions and optionally auto-create a community thread.

## Chat widget rules
- The bot must prioritize routing users to internal lessons/glossary pages with links.
- For trading/investment questions: refuse + show disclaimer + link to /security (localized).

## Coding workflow
- Before changes: summarize plan + list files to touch.
- After changes: run lint + build; if tests exist, run tests.
- Keep changes small; prefer incremental commits.
- Ensure all new routes and UI components are locale-aware and do not hardcode non-localized strings.
