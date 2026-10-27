# `scss/`

SCSS source for Forever Art custom styles. Compiled CSS is what the storefront loads from [`assets/`](./assets.md).

## Contents

| File | Role |
|------|------|
| `app.scss` | Entry — imports partials |
| `_variables.scss` | Tokens / variables |
| `_font.scss` | Font-face / typography hooks |
| `_base.scss` | Base element styles |
| `_main.scss` | Main layout / component styles |

## Deploy rules

- Listed in `.shopifyignore` — **not** uploaded by `shopify theme push`.
- After editing SCSS, compile into `assets/` (e.g. `app.css` / `app.min.css` or the pipeline your team uses) and push those assets.
- Other CSS in `assets/` (Tailwind build, product-wizard, vendor) may have separate sources; don’t assume everything comes from this folder.

## Notes

Keep brand tokens in `_variables.scss` when extending styles so sections stay consistent.
