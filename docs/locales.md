# `locales/`

Theme translation / storefront string catalogs.

## Contents

| File | Role |
|------|------|
| `en.default.json` | Default English locale for the theme |

## How it works

Liquid uses the `t` filter:

```liquid
{{ 'general.some_key' | t }}
```

Keys live in the JSON files under this folder. Shopify can also expose locale files in the Theme editor for merchants.

## Notes

- Forever Art currently keeps a minimal English default; many UI strings are still hardcoded in Liquid/JS.
- Add keys here when introducing new merchant-editable or multi-language copy.
- This folder **is** pushed with the theme.
