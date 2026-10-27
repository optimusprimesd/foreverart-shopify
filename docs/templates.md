# `templates/`

Shopify **templates** — which sections/markup render for each URL type.

## Template types in this theme

| Pattern | Examples | Role |
|---------|----------|------|
| `index.liquid` | Home | Landing; layout also mounts `home-group` |
| `product.liquid` | Default PDP | Customization wizard product page |
| `product.gift-card-product.liquid` | Gift card PDP | Alternate product template |
| `collection*.liquid` / `.json` | Collections + shop-* JSON templates | Category / occasion collections |
| `cart.liquid` | Cart | Line items, customization fee display, checkout |
| `page*.json` / `.liquid` | Static & builder pages | About, FAQ, policies, contact, generate-product-form, etc. |
| `customers/*` | Account flows | Login, register, order, addresses (with matching `main-*` sections) |
| `gift_card.liquid` | Gift card landing | Customer gift card view |
| `search.liquid`, `list-collections.liquid` | Search / collection list | Discovery |
| `robots.txt.liquid` | Robots | Crawler rules |

## JSON vs Liquid templates

- **JSON templates** compose sections via the Theme editor (OS 2.0).
- **Liquid templates** render markup directly (cart, classic product, some pages).

Assign alternate templates in Admin (e.g. page → `generate-product-form`, product → `gift-card-product`).

## Notes

- Product uploads / Dropbox config only load when `template.name == 'product'` (see `layout/theme.liquid`).
- Cart fee chart and `_additional_charge_cents` display live in `cart.liquid`.
- This folder **is** pushed with the theme.
