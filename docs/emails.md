# `emails/`

Working copies of transactional email Liquid templates (order / shipping style).

## Contents

| File | Intent |
|------|--------|
| `order_confirmaton.liquid` | Order confirmation email body (filename spelling is historical) |
| `shipping_confirmation.liquid` | Shipping confirmation email body |

## How Shopify uses email templates

Shopify does **not** load this folder from the theme on `theme push`. Notification emails are edited in:

**Admin → Settings → Notifications → [email] → Edit code**

These files are a repo backup / staging area so Forever Art can version customizations before pasting into Admin.

## Related

- Live gift-card style notification draft: [`notifications/`](./notifications.md)
- Theme UI for gift cards / cart is under `sections/`, `snippets/`, and `templates/` — separate from these Admin emails.
