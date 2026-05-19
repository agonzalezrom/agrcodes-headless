# agrcodes — headless WordPress blog

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-149eca)](https://react.dev/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

A minimalist, fast headless blog: WordPress as the CMS, Next.js 16 + React 19 on the front. Editorial typography on Geist, slate-based palette, grid post index, sticky table of contents on long-form posts, command palette, reading progress, and native View Transitions on theme toggle.

> Live: [agrcodes.com](https://agrcodes.com)

---

## Features

- **Editorial design** — Geist + Geist Mono, slate-tinted neutrals, 68ch reading width, anchor links on headings
- **Post index** — 2-column grid grouped by year, mono date metadata, deterministic mesh-gradient cover fallback when no featured image
- **Long-form reading** — left-aligned hero with category chip, sticky scroll-spy TOC at xl+, reading progress bar, prev/next navigation
- **Command palette** — ⌘K / `/` to open, scored multi-field search, full keyboard nav, reCAPTCHA-gated
- **Dark mode** — pure-slate palette, circular reveal via `document.startViewTransition`, no-flash boot script
- **SEO** — sitemap.xml, robots.ts, RSS feed at `/feed.xml`, JSON-LD `BlogPosting`, Open Graph + Twitter Cards, AIO SEO passthrough
- **Content pipeline** — HTML sanitization, Code Block Pro normalization with `\n`-preserving copy, KaTeX math, HTML minification, automatic heading-id injection
- **Performance** — ISR with per-route revalidation, `next/font` with Geist, optimized images
- **Security** — reCAPTCHA v3 on search and newsletter, server-side token validation, sandboxed dependency install (`.npmrc`)

---

## Quick start

```bash
git clone https://github.com/agonzalezrom/agrcodes-headless.git
cd agrcodes-headless

pnpm install
cp .env.local.example .env.local   # fill in WordPress URL + reCAPTCHA keys

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server (Next.js 16 with Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint + `tsc --noEmit` |
| `pnpm typecheck` | TypeScript type check only |

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WORDPRESS_URL` | yes | Root of your WordPress install (no trailing slash) |
| `NEXT_PUBLIC_BASE_URL` | yes | Public URL of the frontend, used for canonical/OG/sitemap |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | yes | reCAPTCHA v3 site key (client) |
| `RECAPTCHA_SECRET_KEY` | yes | reCAPTCHA v3 secret (server-only) |
| `NEXT_PUBLIC_NEWSLETTER_CLIENT_KEY` | optional | Newsletter plugin client key |
| `NEXT_PUBLIC_NEWSLETTER_SECRET_KEY` | optional | Newsletter plugin secret key |

### WordPress setup

The frontend talks to the standard `wp/v2` REST API. Recommended plugins:

- **All in One SEO** — populates per-post metadata (`title`, `description`, `og_*`, `twitter_*`)
- **Code Block Pro** by Kevin Batdorf — syntax highlighting source (the frontend re-styles it)
- **AGR Headless Math** — emits `.agr-math[data-formula]` markers rendered with KaTeX at runtime
- **Newsletter** by Stefano Lissa — endpoint used by the inline newsletter form

Featured images must be served from a hostname whitelisted in `next.config.mjs` (`images.remotePatterns`).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, ISR) |
| Runtime | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Fonts | Geist + Geist Mono via `next/font/google` |
| Math | KaTeX 0.16 |
| Search bot-protection | Google reCAPTCHA v3 |
| Observability | Vercel Analytics + Speed Insights |

---

## Project structure

```
src/
├── app/
│   ├── api/verify-recaptcha/      # POST: validates reCAPTCHA tokens server-side
│   ├── feed.xml/                  # RSS 2.0 feed
│   ├── posts/[slug]/              # Post detail with TOC + reading progress
│   ├── globals.css                # Tailwind v4 tokens, prose rules, code blocks, view transitions
│   ├── layout.tsx                 # Geist font wiring, no-flash theme script, metadata
│   ├── page.tsx                   # Home: header + grid + footer
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── command-palette.tsx        # ⌘K overlay with scored search
│   ├── cover.tsx                  # Featured image or deterministic mesh-gradient fallback
│   ├── code-block.tsx             # Client-side enhancements for Code Block Pro
│   ├── newsletter-form.tsx        # Card + inline variants
│   ├── post-math.tsx              # KaTeX renderer
│   ├── post-navigation.tsx        # Prev/next chronological links
│   ├── posts-list.tsx             # Grid by year with hover-reveal underline
│   ├── reading-progress.tsx       # Top-edge scroll-linked bar
│   ├── table-of-contents.tsx      # Sticky sidebar with IntersectionObserver scroll-spy
│   └── theme-toggle.tsx           # startViewTransition circular reveal
├── lib/
│   ├── utils.ts                   # slugify, decodeEntities, extractAndInjectHeadings, …
│   └── wordpress.ts               # REST client + getAdjacentPosts
└── types/wordpress.d.ts           # API + Post type definitions
```

---

## Design system

Single source of truth in `src/app/globals.css`:

```css
:root {
  --background: 255 255 255;      /* white */
  --foreground: 2 6 23;           /* slate-950 */
  --muted: 241 245 249;           /* slate-100 */
  --muted-foreground: 100 116 139; /* slate-500 */
  --border: 226 232 240;          /* slate-200 */
}

.dark {
  --background: 2 6 23;           /* slate-950 */
  --foreground: 248 250 252;      /* slate-50 */
  --muted: 15 23 42;              /* slate-900 */
  --muted-foreground: 148 163 184; /* slate-400 */
  --border: 30 41 59;             /* slate-800 */
}
```

Type scale uses Geist with negative tracking on headings (`-0.022em`), prose at `1.0625rem`/`1.125rem` with `line-height: 1.75`. Mono metadata (dates, breadcrumbs, kbd, chips) consistently uses Geist Mono with uppercase + wide tracking. Motion is `cubic-bezier(0.4, 0, 0.2, 1)` at `150–450ms`; `prefers-reduced-motion` zeroes durations.

---

## Notable implementation details

- **Heading anchors & TOC**: `lib/utils.ts:extractAndInjectHeadings` walks the rendered post HTML server-side, slugifies h2/h3 text (entity-decoded, NFD-normalized, deduped), and injects matching `id` attributes. The client `<TableOfContents>` uses `IntersectionObserver` with a `-80px / -60%` rootMargin to highlight the active section.
- **Cover fallback**: `lib/utils.ts:hashToUnit` maps the slug to a deterministic float in `[0,1)`; `cover.tsx` derives four HSL hues from that and composes a 4-corner radial-gradient mesh — no images, but every post gets a unique, stable look.
- **Code block copy fidelity**: `processWordPressContent` encodes newlines in the `data-code` attribute as `&#10;` so they survive `minifyHtml`'s `\s{2,}` collapse. The browser re-decodes when `getAttribute` is called, so the clipboard receives properly line-broken code.
- **No-flash theme**: A tiny synchronous script runs in `<head>` before paint, applying `.dark` to `html` based on `localStorage` (or `prefers-color-scheme` as fallback), so dark-mode users never see a white frame.
- **View Transitions API**: Theme toggle wraps the className swap in `document.startViewTransition` and animates a circular clip-path from the click coordinates, falling back gracefully on unsupported browsers.

---

## Customization

- **Palette** — edit the CSS variables in `:root` and `.dark` in `src/app/globals.css`
- **Fonts** — swap `Geist`/`Geist_Mono` imports in `src/app/layout.tsx` for any `next/font/google` font
- **Locale** — `formatDate` uses `es-MX`; change to your locale and update `<html lang>` + `openGraph.locale` in `layout.tsx`
- **Reading width** — `--reading-width` (and the `.prose` max-width) in `globals.css`
- **Posts per page** — `postsPerPage` in `src/app/page.tsx`

---

## License

MIT. See [LICENSE](LICENSE).

---

## Author

**Alejandro González Romero**

- Site — [agrcodes.com](https://agrcodes.com)
- X — [@agonzalezrom](https://x.com/agonzalezrom)
- GitHub — [@agonzalezrom](https://github.com/agonzalezrom)

> Computers are fast and precise; humans are brilliant together.
