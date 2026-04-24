# ET Website

A **Next.js 16 headless WordPress website** built with the App Router. WordPress serves as the CMS via REST API with Advanced Custom Fields (ACF) Flexible Content blocks.

## Tech Stack

- **Next.js 16** — App Router, React Server Components (RSC), ISR
- **Tailwind CSS v4** — via PostCSS plugin
- **Framer Motion** — animations
- **Lenis** — smooth scrolling
- **Swiper** — carousels
- **WordPress REST API** — headless CMS with ACF Flexible Content
- **Yoast SEO** — metadata, OG, JSON-LD schema

## Getting Started

### Prerequisites

- Node.js 18+
- A running WordPress instance with ACF and Yoast SEO plugins

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=          # WordPress REST API base URL
NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME=   # Image CDN hostname (for Next.js image domains)
NEXT_PUBLIC_SITE_DOMAIN=                # Canonical domain for SEO
```

### Development

```bash
npm install
npm run dev     # Start dev server at http://localhost:3000
```

### Build & Production

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Architecture

### Routing

| Route                               | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `src/app/[...slug]/page.js`         | Catch-all dynamic pages powered by WordPress |
| `src/app/blog/[...slug]/page.js`    | Blog posts                                   |
| `src/app/case-study/[slug]/page.js` | Case studies                                 |

All pages use `generateStaticParams()` for ISR with `revalidate: 60`.

### Content Rendering Pipeline

1. Pages fetch data from WordPress via service functions in `src/services/`
2. WordPress ACF Flexible Content block names are mapped to React components in `src/components/acflayout/pageRenderer.jsx`
3. `html-react-parser` converts WordPress HTML to React elements

### Data Fetching

- All fetching is **server-side** (RSC) — no client-side data fetching
- `src/lib/api.js` — core `fetchAPI()` with exponential backoff and `Retry-After` support for WordPress 429 rate limits
- `src/services/*.js` — one file per content type (pages, posts, case studies, menus, etc.)

### Location-Aware Pages

Pages support location suffixes via `LOCATION_DELIMITER` (`'-in-'`) defined in `src/config/constants.js`.

A slug like `/services-in-bangalore` renders the home/services content with Bangalore injected into SEO metadata and headings. The `replaceLocation()` helper in `src/utils/helpers/` handles this substitution.

### Path Alias

`@/*` maps to `./src/*` (configured in `jsconfig.json`).

## Performance Notes

- Build workers limited to 2 CPUs (`next.config.mjs`) to avoid WordPress API rate limits
- `SplashCursor` (WebGL) is dynamically imported and only loaded on desktop (`innerWidth > 768`)
- Fonts (DM Sans, Aeonik) are served locally from `public/assets/fonts/` with `font-display: swap`
