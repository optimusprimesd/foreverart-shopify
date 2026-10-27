# `assets/`

Shopify theme static files served to the storefront.

## What lives here

| Kind | Examples | Notes |
|------|----------|--------|
| Compiled CSS | `app.min.css`, `custom.min.css`, `product-wizard.min.css`, Tailwind / Flowbite / vendor CSS | Prefer editing sources under `scss/` (or JS sources) then rebuilding into `assets/` |
| JavaScript | `main.js` / `main.min.js`, `product-wizard*.js`, `product-form-pricing*.js`, Swiper, GSAP, Flatpickr, Toastify | Product scripts load only on product templates from `layout/theme.liquid` |
| Fonts | `Zolina-*.woff` / `.woff2` | Brand typeface |
| Brand / UI images | Logos, payment marks, favicon-related PNGs/SVGs | Referenced via `asset_url` |
| Collection promo video | `FA_*_Scripted_*.mp4` | Home / collection media |

## How the theme uses it

Liquid references assets with filters, e.g.:

```liquid
{{ 'app.min.css' | asset_url | stylesheet_tag }}
{{ 'main.min.js' | asset_url }}
```

Shopify hosts these files from the theme; do not put secrets or Dropbox tokens here.

## Conventions

- Ship **minified** vendor and production bundles (`*.min.css` / `*.min.js`) that the layout already loads.
- Keep large media lean where possible; videos inflate theme size and push time.
- This folder **is** part of `shopify theme push`.
