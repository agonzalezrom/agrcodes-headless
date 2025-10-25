# Headless WordPress Blog - agr.codes

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38bdf8)](https://tailwindcss.com/)

> A minimalist, SEO-optimized headless WordPress blog built with Next.js 16, TypeScript, and Tailwind CSS v4. Features Partial Prerendering (PPR) with Cache Components for optimal performance. Inspired by the clean and elegant design of world.hey.com.

## ✨ Features

### Core
- ✅ **Partial Prerendering (PPR)** - Next.js 16 Cache Components for optimal performance
- ✅ **Granular Caching** - `'use cache'` + `cacheLife()` for selective component caching
- ✅ **Hybrid Rendering** - SSG for posts + Dynamic rendering for home + Streaming
- ✅ **View Transitions API** - Smooth animations between pages
- ✅ **SEO Optimized** - Sitemap, RSS feed, JSON-LD, robots.txt, Open Graph images
- ✅ **Reading Time** - Automatic calculation per post
- ✅ **Dark/Light Mode** - Theme toggle with persistence
- ✅ **Pagination** - Navigate through posts

### Search & Security
- ✅ **Smart Search** - Scoring algorithm with keyboard navigation (↑↓ Enter Esc)
- ✅ **ReCAPTCHA v3** - Bot protection for search and newsletter
- ✅ **Server-side Validation** - API routes for security

### WordPress Integration
- ✅ **WordPress REST API** - Headless CMS integration
- ✅ **All in One SEO** - Full metadata support
- ✅ **Code Block Pro** - Syntax highlighting support
- ✅ **HTML Minification** - Automatic content optimization

### Developer Experience
- ✅ **TypeScript Strict** - Type safety throughout
- ✅ **Modular Architecture** - Clean separation of concerns
- ✅ **Path Aliases** - `@/*` imports from `src/`
- ✅ **Turbopack** - Fast development builds

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- WordPress site with REST API enabled
- Google ReCAPTCHA v3 keys

### Installation

```bash
# Clone the repository
git clone https://github.com/agonzalezrom/agrcodes-headless.git
cd agrcodes-headless

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your WordPress URL and ReCAPTCHA keys

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# ReCAPTCHA v3 (get keys at https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### WordPress Setup

1. **Enable REST API** - Usually enabled by default in WordPress
2. **Install All in One SEO** (optional but recommended) - For better SEO metadata
3. **Install Code Block Pro** (optional) - For syntax highlighting in posts

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.0.0 (App Router) |
| Rendering | Partial Prerendering (PPR) + Cache Components |
| Language | TypeScript 5.9.2 |
| Styling | Tailwind CSS v4.1.13 |
| Font | DM Sans (Google Fonts) |
| State | React 19.1.1 Server Components |
| UI Components | shadcn/ui (Skeleton) |
| Theme | next-themes |
| Security | Google ReCAPTCHA v3 |
| Performance | Turbopack, HTML minification |

### Project Structure

```
headless/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Homepage (dynamic rendering)
│   │   ├── globals.css        # Global styles + WordPress blocks
│   │   ├── robots.ts          # robots.txt generator
│   │   ├── sitemap.ts         # sitemap.xml generator
│   │   ├── api/
│   │   │   └── verify-recaptcha/
│   │   │       └── route.ts   # ReCAPTCHA validation
│   │   ├── feed.xml/
│   │   │   └── route.ts       # RSS 2.0 feed
│   │   └── posts/
│   │       └── [slug]/
│   │           └── page.tsx   # Post template (SSG + ISR)
│   │
│   ├── components/            # React components
│   │   ├── code-block.tsx    # Copy code functionality
│   │   ├── newsletter-form.tsx # Newsletter subscription
│   │   ├── recaptcha-provider.tsx # ReCAPTCHA provider
│   │   ├── search.tsx        # Smart search with scoring
│   │   └── theme-toggle.tsx  # Dark/light mode toggle
│   │
│   ├── lib/                   # Business logic
│   │   ├── utils.ts          # Utilities (cn, stripHtml, formatDate, etc.)
│   │   └── wordpress.ts      # WordPress REST API client
│   │
│   └── types/                 # Type definitions
│       └── wordpress.d.ts    # WordPress API types
│
├── public/                    # Static assets
│   ├── favicon.ico           # Favicon
│   ├── favicon.svg           # Vector favicon
│   ├── apple-touch-icon.png  # iOS icon
│   └── site.webmanifest      # PWA manifest
│
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind configuration
├── LICENSE                   # MIT License
└── package.json              # Dependencies
```

---

## 🎨 Design System

### Philosophy

The template follows a **minimalist and content-first** philosophy:

1. **Minimal Navigation** - Back link (left), theme toggle (right)
2. **Centered Layout** - Max-width 5xl for consistency
3. **Modern Typography** - DM Sans for body, bold for headings
4. **Generous Spacing** - Ample margins and padding for readability
5. **Subtle Interactions** - Simple hover states, smooth transitions
6. **Multilingual** - Spanish by default (dates, texts, metadata)

### Color System

The design uses CSS custom properties with RGB values for theme compatibility:

```css
/* Light Mode */
--background: 255 255 255;        /* Pure white */
--foreground: 17 24 39;           /* Gray-900 */
--muted-foreground: 107 114 128;  /* Gray-500 */
--border: 229 231 235;            /* Gray-200 */

/* Dark Mode (Slate) */
--background: 15 23 42;           /* Slate-900 */
--foreground: 241 245 249;        /* Slate-100 */
--muted-foreground: 148 163 184;  /* Slate-400 */
--border: 51 65 85;               /* Slate-700 */
```

### Typography

- **Font Family**: DM Sans (400, 500, 600, 700)
- **Base Size**: 1.0625rem (17px)
- **Body Size**: 1.125rem (18px) - 1.1875rem (19px) on desktop
- **Line Height**: 1.75 for optimal readability
- **Locale**: es-MX (Spanish dates and formatting)

---

## 📄 Key Features

### 1. View Transitions API

Smooth, native animations between pages using React's `unstable_ViewTransition`:

```tsx
import { unstable_ViewTransition as ViewTransition } from "react"

<ViewTransition name={`post-title-${post.slug}`}>
  <h2 className="inline-block">{post.title}</h2>
</ViewTransition>
```

**Requirements:**
- Elements must have `inline-block` or `block` display
- Matching `name` props between source and destination pages
- `experimental.viewTransition: true` in `next.config.mjs`

### 2. SEO Features

#### Sitemap.xml
Dynamic sitemap generated at build time from WordPress posts:
- Homepage (priority: 1.0, daily)
- All published posts (priority: 0.8, weekly)

#### RSS Feed
RSS 2.0 feed at `/feed.xml` with:
- Last 50 posts
- Proper RFC-822 dates
- Categories and authors
- 1-hour cache

#### JSON-LD Structured Data
Schema.org `BlogPosting` markup on every post:
- Article metadata
- Author information
- Publisher details
- Publication dates

#### robots.txt
Dynamic robots.txt with:
- Allow all crawlers
- Block `/api/` and `/admin/`
- Reference to sitemap

### 3. Smart Search

Client-side search with intelligent scoring:

**Features:**
- Multi-field search (title, excerpt, content)
- Weighted scoring (title: 3x, excerpt: 2x, content: 1x)
- Highlight matching terms
- Keyboard navigation (↑↓ to navigate, Enter to open, Esc to close)
- ReCAPTCHA protection against abuse

**Algorithm:**
```typescript
score = (titleMatches × 3) + (excerptMatches × 2) + (contentMatches × 1)
```

### 4. ReCAPTCHA v3 Integration

Invisible bot protection on:
- Search functionality
- Newsletter subscription

**Flow:**
1. Client requests token from Google
2. Token sent to server via API route
3. Server validates with Google's API
4. Score threshold: 0.5 (configurable)

### 5. Reading Time

Automatic calculation based on:
- Word count (HTML stripped)
- 200 words per minute (standard)
- Displayed on post pages

### 6. Content Processing

WordPress HTML goes through a pipeline:

1. **Sanitization** - Remove scripts and event handlers
2. **Code Block Pro** - Restructure and clean syntax highlighting
3. **Style Cleanup** - Remove inline styles and color attributes
4. **Minification** - Reduce size while preserving code blocks

### 7. Next.js 16 Cache Components (PPR)

Implements Partial Prerendering for optimal performance:

**Architecture:**
- **Server Components with `'use cache'`** - `PostsList` component caches for hours
- **Granular Caching** - `cacheLife('hours')` replaces old `revalidate` option
- **Suspense Boundaries** - Separates dynamic from static content
- **Streaming Responses** - Dynamic parts render while static shell sends immediately

**Components:**
- `PostsList` - Cacheable server component for rendering posts
- `PostsListSkeleton` - Loading state with shadcn/ui Skeleton
- `SearchContentWrapper` - Handles dynamic search params
- `NewsletterForm` - In its own Suspense boundary
- `ReCaptchaProvider` - Split into Server + Client components
- `CurrentYear` - Client component to avoid time-based blocking

**Configuration:**
```typescript
// next.config.mjs
const nextConfig = {
  cacheComponents: true,
}
```

**Benefits:**
- ⚡ Fast initial page load with skeleton placeholders
- 📊 Streaming renders dynamic content in parallel
- 💾 Selective caching reduces server load
- 🔄 No `revalidate` conflicts with PPR

---

## 🚀 Build & Deploy

### Build Strategies

The project uses **hybrid rendering** for optimal performance:

| Page | Strategy | Config |
|------|----------|--------|
| Homepage | Dynamic | `export const dynamic = 'force-dynamic'` |
| Posts | SSG + ISR | `generateStaticParams()` + `revalidate: 3600` |
| API Routes | Dynamic | Default behavior |

**Why hybrid?**
- Homepage: Always fresh, supports API routes (ReCAPTCHA)
- Posts: Ultra-fast, CDN-cached, regenerate every hour
- Best of both worlds

### Build Commands

```bash
# Development (with Turbopack)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```


## 🔧 API Reference

### WordPress API Client (`src/lib/wordpress.ts`)

```typescript
// Get paginated posts
getPosts(page?: number, perPage?: number): Promise<Post[]>

// Get single post by slug
getPostBySlug(slug: string): Promise<Post | null>

// Get all post slugs (for SSG)
getAllPostSlugs(): Promise<{ slug: string }[]>

// Get total post count
getTotalPosts(): Promise<number>
```

### Utility Functions (`src/lib/utils.ts`)

```typescript
// Tailwind class merge
cn(...inputs: ClassValue[]): string

// Remove HTML tags
stripHtml(html: string): string

// Format date to Spanish
formatDate(dateString: string): string

// Calculate reading time
calculateReadingTime(text: string, wordsPerMinute?: number): number

// Sanitize HTML
sanitizeContent(html: string): string

// Minify HTML
minifyHtml(html: string): string

// Process WordPress content
processWordPressContent(html: string): string
```

---

## 🎯 Customization

### Change Language

1. Update locale in `src/lib/utils.ts`:
```typescript
export function formatDate(dateString: string): string {
  return date.toLocaleDateString('en-US', { // Change to your locale
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

2. Update HTML lang in `src/app/layout.tsx`:
```tsx
<html lang="en"> {/* Change from "es" */}
```

3. Update metadata in `src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  openGraph: {
    locale: "en_US", // Change from "es_MX"
  },
}
```

### Change Colors

Edit CSS variables in `src/app/globals.css`:

```css
@theme {
  /* Light mode */
  --color-background: rgb(255 255 255);
  --color-foreground: rgb(17 24 39);

  /* Dark mode */
  .dark {
    --color-background: rgb(15 23 42);
    --color-foreground: rgb(241 245 249);
  }
}
```

### Change Font

Update font in `src/app/layout.tsx`:

```typescript
import { Inter } from "next/font/google" // Change from DM_Sans

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
```

### Add Pages

Create new pages in `src/app/`:

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About content</div>
}
```

---

## 📊 Performance

### Optimizations

- ✅ Static site generation for posts
- ✅ Incremental Static Regeneration
- ✅ HTML minification
- ✅ Image optimization ready (configure domains in `next.config.mjs`)
- ✅ Font optimization with `next/font`
- ✅ CSS optimization with Tailwind v4
- ✅ Turbopack for fast builds

---

## 🔐 Security

### ReCAPTCHA v3

- **Site Key**: Public, client-side
- **Secret Key**: Private, server-side only (never committed)
- **Score Threshold**: 0.5 (adjustable in `src/app/api/verify-recaptcha/route.ts`)
- **Actions**: "search", "newsletter"

### Content Sanitization

All WordPress HTML is sanitized:
- Scripts removed
- Event handlers removed
- Inline styles cleaned
- HTML minified

### Environment Variables

Never commit sensitive keys:
- Use `.env.local` for local development
- Configure in Vercel/Netlify dashboard for production
- Add to `.gitignore`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use

---

## 👤 Author

**Alejandro González Romero**

- Website: [agr.codes](https://agr.codes)
- Email: [alejandro@poply.org](mailto:alejandro@poply.org)
- Twitter/X: [@agonzalezrom](https://x.com/agonzalezrom)
- Instagram: [@agonzalezrom](https://www.instagram.com/agonzalezrom/)
- GitHub: [@agonzalezrom](https://github.com/agonzalezrom/)

> Computers are fast and precise; humans are brilliant together.

---

## 🙏 Acknowledgments

- Design inspired by [world.hey.com](https://world.hey.com) by DHH
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [ReCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

---

## 🔮 Roadmap

### Planned 🚧
- [ ] Category/tag filtering
- [ ] Related posts
- [ ] Table of contents for long posts
- [ ] Comments integration (Giscus/Utterances)
- [ ] Share buttons
- [ ] Reading progress bar
- [ ] Popular posts widget
- [ ] Search analytics
- [ ] Open Graph image generation

---

**Built with ❤️ by Alejandro González Romero**

**Last updated**: October 25, 2025
**Version**: 1.1.0 - Next.js 16 with Partial Prerendering (PPR) and Cache Components
