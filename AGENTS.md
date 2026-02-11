# AGENTS.md — buysolanas.com (Beginner-first Solana education)

## Product goal
Build a beginner-first Solana education site:
- Learn (7-step course + glossary)
- Prices (CoinGecko, cached)
- Community (Q&A + ask form)
- Solutions / News / Blog & Podcast
- A chat widget that always routes users to internal lessons.

## Hard rules
- Do NOT copy large verbatim text from solana.com or other sites. Rewrite in original wording.
- For any “buy/sell timing” or investment advice: refuse + show risk disclaimer + link to /security.
- Keep the UI minimal, dark, mobile-first. Fast load is priority.

## Tech stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Deploy: Cloudflare Pages
- Data: CoinGecko API (server-side fetch + 60s cache)
- Content: MDX for Learn/Blog/Glossary
- Community: MVP DB (Supabase preferred) for posts/comments + ask form

## Routes
- / (Home: Hero + quick prices + course entry + solutions + community + news + blog/podcast)
- /start
- /course, /course/[step]
- /learn, /learn/[slug]
- /glossary, /glossary/[term]
- /prices, /prices/[id]
- /ask (form -> saved + optionally auto-create a community thread)
- /community, /community/new, /community/[id]
- /news
- /blog, /blog/[slug]
- /podcast, /podcast/[slug]

## SEO
- Generate sitemap.xml, robots.txt
- Canonical must point to buysolanas.com
- Titles/Descriptions/OpenGraph on every page
- Avoid duplicate content; use 301 for other domains.

## Coding workflow
- Before changes: summarize plan + list files to touch.
- After changes: run lint + build; if tests exist, run tests.
- Keep changes small; prefer incremental commits.
