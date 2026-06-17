# Anastasia Panagopoulou English School — Website

A modern, bilingual (Greek / English) marketing website for an English language
school founded in 1988 in Koropi, Attica. Built with **vanilla HTML, CSS and
JavaScript** — no frameworks, no build step.

## Project structure

```
.
├── index.html              # Home page
├── css/
│   └── style.css           # Single design-system stylesheet (tokens, components)
├── js/
│   ├── components.js        # Shared header + footer, injected on every page
│   └── main.js              # Behaviour: language, nav, reveal, accordion, etc.
├── pages/
│   ├── about.html
│   ├── courses.html
│   ├── certificates.html
│   ├── blog.html
│   ├── blog-details.html
│   └── contact.html
├── Images/
│   └── LOGO.png
└── README.md
```

## How to run

It's a static site — just open `index.html` in a browser, or serve the folder
with any static server (e.g. the Live Server VS Code extension, or
`python3 -m http.server` from a non-restricted location).

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
