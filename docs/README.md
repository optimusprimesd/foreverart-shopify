# Forever Art theme — folder docs

Short explanations of each top-level directory in this Shopify theme repo.

| Folder | Doc | Pushed to Shopify? |
|--------|-----|--------------------|
| [`assets/`](./assets.md) | Static CSS, JS, fonts, images, video | Yes |
| [`config/`](./config.md) | Theme settings + product-form JSON samples | Yes (`settings_*`); samples are theme files |
| [`dropbox-upload/`](./dropbox-upload.md) | Public HTTPS proxy for Dropbox uploads | No (excluded via `.shopifyignore`) |
| [`emails/`](./emails.md) | Custom order/shipping email Liquid drafts | No (not a theme deploy path) |
| [`extensions/`](./extensions.md) | Optional Shopify Function (cart transform) | No (deployed via Shopify app) |
| [`layout/`](./layout.md) | Root HTML shell (`theme.liquid`) | Yes |
| [`locales/`](./locales.md) | Theme translation strings | Yes |
| [`notifications/`](./notifications.md) | Shopify notification email templates | Manual copy into Admin |
| [`partials/`](./partials.md) | Legacy / design Liquid fragments | No (not used by Online Store 2.0 renders) |
| [`scss/`](./scss.md) | SCSS source for compiled CSS | No (excluded; compiled CSS lives in `assets/`) |
| [`sections/`](./sections.md) | Theme sections + section groups | Yes |
| [`snippets/`](./snippets.md) | Reusable Liquid snippets | Yes |
| [`templates/`](./templates.md) | Page / product / collection / cart templates | Yes |

## Feature docs

- [Product form config](./product-form-config.md) — JSON schema for `custom.product_form_configuration` and the customize wizard
