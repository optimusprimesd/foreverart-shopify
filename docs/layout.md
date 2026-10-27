# `layout/`

Root HTML document for the Online Store theme.

## Contents

| File | Role |
|------|------|
| `theme.liquid` | Single layout: `<head>`, header group, `{{ content_for_layout }}`, footer, global scripts |

## What `theme.liquid` owns

- Meta / fonts / CSS stack (`tailwind`, `app`, `custom`, product-wizard CSS on product pages)
- `{{ content_for_header }}` (Shopify-required)
- Header via `{% sections 'header-group' %}`
- Main content + home section group on index
- Footer section
- Deferred JS (Flowbite, GSAP, Swiper, Flatpickr, Toastify, `main.min.js`)
- Product-only: Dropbox config JSON (`#forever-art-dropbox-config`) + wizard / pricing scripts
- Contact page: `contact-send-email` script when template suffix is `contact-us`

## Notes

- Almost every storefront URL wraps through this file.
- Prefer adding page-specific assets with `{%- if template.name == '…' -%}` rather than loading everything globally.
- This folder **is** pushed with the theme.
