# Additional charge cart transform

This Shopify Function reads the hidden line item property `_additional_charge_cents` (set by the product form wizard) and can adjust line prices at checkout on **Shopify Plus** (or development stores) via `lineUpdate`.

## Recommended approach (all plans): fee product

Cart Transform price overrides require Plus. For every store, configure a real fee product instead:

1. In Shopify Admin, use (or create) product handle **`customization-charge`** priced at **$1.00**, inventory policy **Continue selling when out of stock**.
2. Optional: Theme editor → **Theme settings** → **Customization charges** → select that product (handle fallback works without this).
3. When a customer fills a paid custom field (e.g. $20), add-to-cart also adds the fee product with quantity = charge dollars (`20 × $1.00 = $20.00`).
4. That amount is a real cart line, so **checkout and payment include it**.

## Optional: deploy this Cart Transform (Plus)

1. From the theme repo root, create or link a Shopify app with Functions support (`shopify app init` if needed).
2. Install dependencies:

```bash
cd extensions/additional-charge-transform
npm install
```

3. Build and deploy the function with your app:

```bash
shopify app deploy
```

4. In Shopify admin → **Settings** → **Checkout** → **Cart transform**, enable **Additional charge transform**.

Without either the fee product setting or this function, the theme can still update the product page and cart page display, but Shopify checkout will use the base variant price only.

## How charges are calculated

- Merchants set `additional_charge` (dollars, e.g. `20`) on each field in the product form JSON or the `/pages/generate-product-form` builder.
- When a customer enters or selects a value in that field, the product page price updates live.
- On add to cart, the theme stores the total extra cents in `properties[_additional_charge_cents]` and (when configured) adds the fee product line for checkout.
