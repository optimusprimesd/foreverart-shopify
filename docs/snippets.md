# `snippets/`

Reusable Liquid partials included with `{% render 'snippet-name' %}`.

## Major groups

| Group | Examples |
|-------|----------|
| Header / chrome | `header-shell-desktop`, `header-shell-mobile`, `header-logo`, `header-account`, `header-mobile-drawer`, `meta-tags`, `payment-logos` |
| Product page shell | `product-page`, `product-item`, `product-tabs`, shipping / YMAL cards |
| Product form wizard | `product-form-wizard`, `product-form-field*`, step nav, upload / voice / colors / size / dates |
| Help / media UX | tooltip button/panel, voice button, video button, field audio |
| Gift cards | `gift-card-product-card`, `gift-card-send-to` |
| Account | `account-shell` |
| Contact | `contact-send-email` |
| Form config fallback | `product-form-config-sample` (Liquid-wrapped sample JSON) |

## Conventions

- One concern per snippet; pass data via render parameters.
- Product form field types map 1:1 to `product-form-field-*.liquid` and the JSON schema in [product-form-config.md](./product-form-config.md).
- Do not confuse with [`partials/`](./partials.md) — only **`snippets/`** is the live `{% render %}` target.

## Deploy

This folder **is** pushed with the theme.
