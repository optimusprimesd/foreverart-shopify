# `extensions/`

Optional Shopify app extensions (Functions), not theme Liquid.

## Current extension

### `additional-charge-transform`

Cart Transform Function that can read line property `_additional_charge_cents` (set by the product form wizard) and adjust line prices at checkout.

| Requirement | Detail |
|-------------|--------|
| Platform | Shopify Plus (or development stores that allow Cart Transform) |
| Deploy | Via a Shopify app (`shopify app deploy`), not `shopify theme push` |
| Admin | Settings → Checkout → Cart transform → enable the function |

## Is it required for the product form?

**No.** Forever Art’s supported approach on all plans is a real **fee product** (handle `customization-charge`, typically $1.00 × quantity = charge dollars). That amount is a normal cart line, so checkout charges it without a Function.

Use this extension only if you explicitly want Cart Transform price overrides instead of (or besides) the fee product.

## Related theme pieces

- Product form `additional_charge` fields — [product-form-config.md](./product-form-config.md)
- Hidden property `properties[_additional_charge_cents]` on add to cart
- Theme setting for customization fee product under Theme settings
