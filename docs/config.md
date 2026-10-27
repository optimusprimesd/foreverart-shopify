# `config/`

Theme settings and reference JSON for the product customization form.

## Theme settings (Shopify)

| File | Role |
|------|------|
| `settings_schema.json` | Defines Theme editor controls (branding, Dropbox upload, customization fee product, etc.) |
| `settings_data.json` | Current saved values for those settings (published theme config) |

Important Forever Art settings groups include Dropbox proxy URL / folder and customization-charge product selection. Values are read in Liquid as `settings.*` (e.g. in `layout/theme.liquid` for Dropbox config JSON).

## Product form samples

| File | Role |
|------|------|
| `product-form-config.sample.json` | Default / copy-paste schema when a product metafield is empty |
| `product-form-config.*.json` | Example configs (vehicle, quote, street-sign, etc.) |

These samples document and seed the metafield **`custom.product_form_configuration`**. Full field schema: [product-form-config.md](./product-form-config.md).

The sample used at runtime is also mirrored into `snippets/product-form-config-sample.liquid` so Liquid can render a fallback without reading arbitrary JSON files from Admin.

## Notes

- Edit schema carefully — breaking `settings_schema.json` can break the Theme editor.
- Prefer changing live product configs in Admin metafields (or `/pages/generate-product-form`), not only these sample files.
- `settings_*` **are** pushed with the theme; treat `settings_data.json` as environment-sensitive (dev vs live may differ).
