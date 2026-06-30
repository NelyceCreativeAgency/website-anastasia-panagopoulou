# Anastasia Panagopoulou English School — Website

A modern, bilingual (Greek / English) marketing website for an English language
school founded in 1988 in Koropi, Attica. Built with **vanilla HTML, CSS and
JavaScript** — no frontend framework. The only generated part is the blog,
built from markdown so it can be edited through a CMS (see below).

## Project structure

```
.
├── index.html               # Home page
├── 404.html
├── css/
│   └── style.css            # Single design-system stylesheet (tokens, components)
├── js/
│   ├── components.js        # Shared header + footer, injected on every page
│   └── main.js               # Behaviour: language, nav, reveal, accordion, etc.
├── pages/
│   ├── about.html, courses.html, certificates.html, contact.html, privacy.html
│   ├── blog.html             # GENERATED — see content/blog below, don't hand-edit
│   └── <post-slug>.html      # GENERATED — one per article
├── content/
│   └── blog/*.md             # Blog post source (frontmatter + markdown), CMS-managed
├── scripts/
│   └── build-blog.js         # Reads content/blog → writes pages/blog.html + pages/<slug>.html
├── admin/                    # Decap CMS admin panel (visit /admin)
│   ├── index.html
│   └── config.yml
├── api/
│   ├── auth.js                # GitHub OAuth proxy, step 1 (used by /admin login)
│   └── callback.js            # GitHub OAuth proxy, step 2
├── Images/
└── README.md
```

## How to run

```bash
npm install      # first time only
npm run dev      # builds the blog, then starts the live-reload server on :3000
```

`npm run dev` runs `scripts/build-blog.js` first (so `pages/blog.html` and the
post pages reflect whatever's in `content/blog/`), then starts
[browser-sync](https://browsersync.io). CSS edits are injected **instantly**;
HTML/JS edits trigger a fast auto-refresh.

If you edit a file in `content/blog/` while the dev server is running, re-run
`npm run build:blog` (or restart `npm run dev`) to regenerate the pages —
browser-sync doesn't watch `content/` automatically.

Configuration lives in [`bs-config.js`](bs-config.js) (port, watched files, etc.).

> Tip: if `npm install` ever fails with an `EACCES` cache error, run it once with
> a local cache: `npm install --cache .npmcache` (already git-ignored).

## Blog CMS (Decap CMS)

Blog posts live as markdown files in `content/blog/`, each with bilingual
frontmatter (`title_el`/`title_en`, `body_el`/`body_en`, etc.). `scripts/build-blog.js`
turns them into `pages/blog.html` (listing) and `pages/<slug>.html` (one per
post) — this runs automatically on every Vercel deploy (`vercel.json`
`buildCommand`).

To edit content without touching code, visit **`/admin`** on the live site.
It's [Decap CMS](https://decapcms.org) (free, open-source), backed by GitHub —
every save there is a real commit to this repo, which Vercel then redeploys
automatically.

**One-time setup required** (not yet done — needed before `/admin` works):

1. Create a GitHub OAuth App: GitHub → Settings → Developer settings → OAuth
   Apps → New OAuth App.
   - Homepage URL: the site's production URL
   - Authorization callback URL: `https://<your-domain>/api/callback`
2. In the Vercel project settings, add two environment variables from the
   OAuth App you just created:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
3. Update `base_url` in `admin/config.yml` to match the real production domain
   (it currently points at the default `*.vercel.app` URL).
4. Redeploy. Visit `/admin`, log in with GitHub, and you'll see the "Άρθρα"
   collection ready to edit.

The 5 existing posts are sample content (seeded from the placeholder articles
the site launched with) — edit or delete them freely once there's real content
to replace them with.

## Bilingual content (GR / EN)

Every piece of visible text is written **inline in both languages**, side by side,
so translations are easy to find and keep in sync:

```html
<h2 class="h2">
  <span data-lang-el>Γιατί εμάς</span>
  <span data-lang-en>Why Choose Us</span>
</h2>
```

- CSS (`style.css`, section 20) shows only the spans matching the current
  `<html lang>` attribute.
- The **GR / EN switcher** in the header sets `<html lang>`, saves the choice to
  `localStorage`, and updates each page's `<title>` from the `data-title-el` /
  `data-title-en` attributes on `<body>`.
- Default language is Greek (`el`).

To translate a new element, just add the two `data-lang-el` / `data-lang-en`
spans — no JavaScript dictionary to maintain.

## Shared header & footer

The navigation and footer are defined **once** in `js/components.js` and injected
into the `#site-header` / `#site-footer` placeholders on every page. The script
auto-detects whether the page is in the root or in `/pages/` and adjusts asset
paths accordingly. Add or rename a nav item in the `NAV` array there and it
updates everywhere.

## Features

- Responsive, mobile-first layout with an accessible slide-in mobile menu
- Sticky navigation that condenses on scroll
- Smooth scrolling and scroll-reveal animations via `IntersectionObserver`
- Native lazy-loaded images (`loading="lazy"`)
- Animated statistics counters
- Modern FAQ accordion and a scroll-snap testimonials slider
- Accessible: skip link, ARIA labels, focus styles, `prefers-reduced-motion`
- SEO-friendly: per-page titles, meta descriptions, Open Graph tags, semantic HTML

## Branding

| Token         | Value     |
| ------------- | --------- |
| Primary color | `#0B3048` |
| Accent color  | `#E53914` |
| Fonts         | Plus Jakarta Sans (headings), Inter (body) |

All design tokens live at the top of `css/style.css` under `:root`.

## Images

Photographic placeholders are loaded from `picsum.photos` and avatar placeholders
from `pravatar.cc`. Replace these URLs with real, optimized photos in `Images/`
before going live. The Google Maps embed points to Koropi — update the `q=`
query in the iframe `src` to the exact address when ready.
