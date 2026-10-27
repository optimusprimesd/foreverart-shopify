# `sections/`

Shopify **sections** — merchant-editable building blocks and section groups.

## Roles

| Area | Examples |
|------|----------|
| Global chrome | `header.liquid`, `footer.liquid`, `announcement-bar.liquid`, `header-group.json` |
| Home | `home-intro`, `home-collections`, `home-process`, `home-top-sellers`, `home-group.json`, … |
| Product | `product-form`, `product-tabs`, `product-difference`, `product-shipping-highlights`, `product-you-may-also-like` |
| Marketing pages | `about-us`, `faq`, `how-we-work`, `contact-us`, `our-process`, `new-arrivals` |
| Gift cards | `gift-cards`, `gift-card-collection` |
| Account | `main-login`, `main-register`, `main-account`, `main-order`, `main-addresses`, … |
| Utilities | `product-form-config-builder` (powers `/pages/generate-product-form`), `policy-page`, `shop-category`, `top-sellers` |

## Section groups

JSON files like `header-group.json` and `home-group.json` define ordered section stacks. `layout/theme.liquid` loads them with `{% sections 'header-group' %}` / home group on index.

## Notes

- Each `.liquid` section usually includes a `{% schema %}` block for Theme editor settings.
- Prefer sections for anything merchants should toggle or reorder; keep dumb markup in snippets.
- This folder **is** pushed with the theme.
