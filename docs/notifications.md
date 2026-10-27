# `notifications/`

Shopify **Admin notification** email templates kept in git for versioning.

## Contents

| File | Role |
|------|------|
| `gift-card-created.liquid` | Gift card created customer notification markup |

## How to use

Shopify does not auto-deploy this folder from the theme. To publish:

1. Open **Admin → Settings → Notifications**
2. Open the matching notification (e.g. Gift card created)
3. Paste / sync from the Liquid file in this folder

## Related

- Draft order/shipping emails: [`emails/`](./emails.md)
- Gift card **storefront** UI: `templates/gift_card.liquid`, `templates/product.gift-card-product.liquid`, gift-card sections/snippets
