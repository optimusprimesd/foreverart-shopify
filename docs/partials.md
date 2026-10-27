# `partials/`

Legacy design-time Liquid fragments. **Not** the Online Store 2.0 snippet system.

## What’s here

Roughly mirrors early header/footer/home/product UI pieces, e.g.:

- `header.liquid`, `footer.liquid`
- `home-block-*.liquid`, `home-block-collections.liquid`
- Product field helpers (`product-help-tooltip-*`, `product-voice-button`, etc.)

Many names overlap with files under [`snippets/`](./snippets.md), which is what the live theme actually `{% render %}`s.

## Important

- Shopify theme Liquid `{% render 'name' %}` only resolves files in **`snippets/`**, not `partials/`.
- Internal references like `{% render 'partials/product-item' %}` inside this folder are for older prototyping paths; they are not the production include path.
- Prefer editing **`snippets/`**, **`sections/`**, and **`templates/`** for storefront changes.
- Safe to treat as historical reference unless you intentionally revive a design workflow that uses these files.

## Deploy

Not relied on by the published theme architecture; do not assume changes here appear on foreverart.com.au.
