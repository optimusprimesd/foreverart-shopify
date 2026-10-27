# Product form config (`custom.product_form_configuration`)

The product customization wizard reads JSON from the product metafield **`custom.product_form_configuration`**. When that metafield is empty, the theme loads the default from [`config/product-form-config.sample.json`](../config/product-form-config.sample.json) (synced to `snippets/product-form-config-sample.liquid` for Liquid rendering).

A copy-paste sample lives at [`config/product-form-config.sample.json`](../config/product-form-config.sample.json).

## Where to set it

1. Shopify admin → **Settings** → **Custom data** → **Products** → ensure **Product Form Configuration** (`custom.product_form_configuration`, type JSON) exists (defined in `.shopify/metafields.json`).
2. Open a product → **Metafields** → **Product Form Configuration** → paste JSON.

### Visual builder (optional)

Create a page in Shopify admin with handle **`generate-product-form`** and assign theme template **`generate-product-form`**. Visit `/pages/generate-product-form` to add steps and fields in the UI, then **Copy JSON** and paste into the product metafield above.

## Root schema

```json
{
  "heading": "Customize Your Sign",
  "steps": [ Step, ... ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `heading` | string | no | Main wizard title above the step nav (default: `"Customize Your Sign"`). |
| `steps` | Step[] | yes | Wizard steps and fields. |

### Step object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `number` | integer | yes | Wizard step index. Used for `data-wizard-step`, scroll spy, and step nav clicks. Keep unique per step. |
| `title` | string | no | Step heading shown above fields (e.g. `"2. The People"`). |
| `nav_label` | string | no | Short label under the step number in the sticky nav (often left empty). |
| `fields` | Field[] | yes | Fields rendered in this step. Steps with no enabled fields are hidden from the nav. |

---

## Shared field properties

All field types support these unless noted otherwise.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | string | — | Unique field identifier. Used for HTML `id`, tooltip ids, and repeatable list keys. |
| `type` | string | `"text"` | Field renderer type (see below). |
| `enabled` | boolean | `true` | `false` hides the field entirely. |
| `property_name` | string | `key` | Cart line-item property key. Rendered as `properties[property_name]` (except `text_color` / `background_color`, which use fixed property names). |
| `show_help` | boolean | `false` | Show help (?) icon with hover tooltip (tap on touch devices). |
| `help_title` | string | — | Tooltip title. |
| `help_body` | string | — | Tooltip body text. |
| `show_voice` | boolean | `false` | Show audio play icon. Requires `voice_src` (theme asset filename) or product metafield data. |
| `voice_src` | string | — | Theme asset filename, e.g. `"wedding-poster.m4a"`. |
| `show_video` | boolean | `false` | Show video play icon. |
| `media_url` | string | — | Product gallery slide index (1-based, e.g. `"6"`). Clicking the video icon jumps to that slide. |
| `aria_label` | string | — | Accessible label for help/media buttons. |
| `wrap_class` | string | — | Extra CSS classes on the input wrapper. |
| `info_label` | string | — | Optional note shown below the input (light blue info strip). Auto-generated from `additional_charge` when blank. |
| `additional_charge` | number | — | Extra price in store currency (e.g. `20` for $20). Applied when the customer enters or selects a value in this field. Stored on the line item as `_additional_charge_cents` and reflected on the product page, cart, and checkout (requires the cart transform extension). |
| `validation` | object | — | Optional format rules (see below). |

### `validation` object

Applies to `text`, `textarea`, `repeatable`, and per-input `validation` on `input_group` fields. Enforced on Add to cart (optional fields are only checked when the customer enters a value).

| Property | Type | Description |
|----------|------|-------------|
| `max_length` | integer | Maximum character count (e.g. `12`) |
| `alphanumeric_only` | boolean | When `true`, only letters and numbers are allowed — no spaces or special characters |

**Example (signature / story inscription)**

```json
{
  "key": "signature",
  "type": "text",
  "property_name": "signature",
  "placeholder": "Story Inscription",
  "required": true,
  "validation": {
    "max_length": 12,
    "alphanumeric_only": true
  }
}
```


| Config | Result |
|--------|--------|
| `show_help: true` | Help icon only |
| `show_video: true` + `media_url` | Video icon; click jumps to gallery slide |
| `show_help` + `show_video` | Both icons |
| `show_voice: true` + `voice_src` | Audio icon only |
| All three enabled | Help + audio + video icons |

---

## Field types

### `text`

Single-line text input.

| Property | Type | Description |
|----------|------|-------------|
| `placeholder` | string | Input placeholder |
| `required` | boolean | Sets `aria-required` |
| `autocomplete` | string | HTML autocomplete, e.g. `"given-name"` |
| `input_class` | string | Extra classes on the input |
| `description_key` | string | Optional product metafield key for dynamic help copy |
| `validation` | object | Optional `max_length` and `alphanumeric_only` rules (see shared properties) |

**Example**

```json
{
  "key": "bride_name",
  "type": "text",
  "enabled": true,
  "property_name": "bride_name",
  "placeholder": "Bride's Name",
  "required": true,
  "autocomplete": "given-name",
  "show_help": true,
  "help_title": "Bride's Name",
  "help_body": "Bride — recommended first name only."
}
```

---

### `textarea`

Multi-line text input.

| Property | Type | Description |
|----------|------|-------------|
| `placeholder` | string | Placeholder text |
| `rows` | integer | Textarea rows (e.g. `3`) |
| `required` | boolean | Optional required flag |

**Example**

```json
{
  "key": "party_names",
  "type": "textarea",
  "property_name": "party_names",
  "placeholder": "Custom message (optional)",
  "rows": 3,
  "show_help": true,
  "help_title": "Custom Message",
  "help_body": "Keep it concise so it reads clearly on the finished poster."
}
```

---

### `select`

Dropdown select.

| Property | Type | Description |
|----------|------|-------------|
| `placeholder` | string | First disabled option label |
| `options` | string | Comma-separated values, e.g. `"Maid of Honor,Matron of Honor"` |
| `required` | boolean | HTML `required` on select |

---

### `time`

Time input with optional label above the field.

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Label shown above the input |
| `placeholder` | string | Input placeholder |
| `required` | boolean | Required flag |

---

### `date`

Date input with Flatpickr (`data-flatpickr-date`) and calendar icon. Displays as **Date Month Year** (e.g. `25 June 2026`); cart line item stores ISO `Y-m-d`.

| Property | Type | Description |
|----------|------|-------------|
| `placeholder` | string | e.g. `"Wedding date"` |
| `required` | boolean | Required flag |
| `wrap_class` | string | Wrapper classes |

Cart property: `properties[event_date]` when `property_name` is `"event_date"`.

---

### `text_color`

Variant-driven text colour dropdown. Options are built from product option **Text Colour** / **Text Color**.

| Property | Type | Description |
|----------|------|-------------|
| `show_help` | boolean | Help icon in the label row |
| `help_title`, `help_body` | string | Tooltip content |
| `show_voice`, `show_video`, `media_url`, `voice_src` | — | Optional header actions |

Cart property: `properties[Text color]` (fixed).

---

### `background_color`

Background colour dropdown with preset swatches (Charcoal, Sage, Navy, etc.).

Cart property: `properties[Background color]` (fixed).

---

### `size`

Labelled size `<select>` with optional help on the trailing edge.

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | e.g. `"Select Size (inches)"` |
| `property_name` | string | Default `"Size"` |
| `options` | string | Comma-separated values, e.g. `"18x24,24x36,30x40"` |
| `required` | boolean | HTML `required` |

---

### `radio`

Radio button group (e.g. orientation).

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Group heading |
| `property_name` | string | Radio `name` → `properties[property_name]` |
| `options` | string | Comma-separated labels, e.g. `"Portrait,Landscape"` |
| `required` | boolean | `required` on first option |

---

### `repeatable`

Text input with **+ Add** to clone more rows (e.g. bridesmaids).

| Property | Type | Description |
|----------|------|-------------|
| `placeholder` | string | Base label; first row becomes `"Bridesmaid 1"` |
| `add_label` | string | Button text, default `"+ Add"` |
| `input_class` | string | Extra input classes |
| `required` | boolean | Required on each row |

All cloned inputs share the same `property_name` (multiple line-item properties with the same key).

---

### `input_group`

Multiple text inputs in one group with a **minimum filled** count. For example, 10 inputs with `min_filled: 5` means the customer must complete at least 5; the rest are optional unless marked required on the individual input.

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Group heading shown above the inputs |
| `min_filled` | number | Minimum number of non-empty inputs required (group-level) |
| `wrap_class` | string | Extra CSS classes on the group wrapper |
| `inputs` | array | List of text input definitions (see below) |

Each item in `inputs`:

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique id within the group |
| `property_name` | string | Line item property key → `properties[property_name]` |
| `placeholder` | string | Input placeholder |
| `required` | boolean | This specific input must always be filled |
| `additional_charge` | number | Extra price when this input has a value (same rules as field-level `additional_charge`) |
| `validation` | object | Optional `max_length`, `alphanumeric_only` (same rules as `text`) |

Example — 4 party names, at least 2 required:

```json
{
  "key": "party_names",
  "type": "input_group",
  "enabled": true,
  "label": "Wedding party names",
  "min_filled": 2,
  "inputs": [
    {
      "key": "name_1",
      "property_name": "Party Name 1",
      "placeholder": "Name 1",
      "required": false,
      "validation": { "max_length": 12, "alphanumeric_only": true }
    },
    {
      "key": "name_2",
      "property_name": "Party Name 2",
      "placeholder": "Name 2"
    }
  ]
}
```

---

### `voice_block`

Embedded audio player block (no form input). Used for step-level audio guides.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `audio_asset` | string | `"wedding-poster.m4a"` | Theme asset filename |
| `audio_id` | string | — | HTML `id` on `<audio>` |
| `canvas_id` | string | — | Optional waveform canvas `id` |
| `audio_src` | string | — | Full URL override (instead of `audio_asset`) |

---

## Minimal per-product override

Hide one field on a single product — paste only the steps/fields you need to change, or copy the full sample and set `"enabled": false`:

```json
{
  "steps": [
    {
      "number": 2,
      "title": "2. The People",
      "nav_label": "",
      "fields": [
        {
          "key": "bridesmaid",
          "type": "repeatable",
          "enabled": false
        }
      ]
    }
  ]
}
```

**Note:** A partial config replaces the entire default when the metafield is set. For most products, copy the full [`config/product-form-config.sample.json`](../config/product-form-config.sample.json) and edit from there.

---

## Video-only field example

```json
{
  "key": "size_guide",
  "type": "text",
  "property_name": "size_notes",
  "placeholder": "Optional notes",
  "show_help": false,
  "show_video": true,
  "media_url": "6"
}
```

---

## Theme files

| File | Purpose |
|------|---------|
| `snippets/product-form-wizard.liquid` | Loads config, renders wizard |
| `config/product-form-config.sample.json` | Default form JSON (source of truth) |
| `snippets/product-form-config-sample.liquid` | Runtime copy of default JSON for `parse_json` |
| `snippets/product-form-field.liquid` | Type dispatcher |
| `assets/product-wizard.js` | Scroll, tooltips, repeatable, voice/video |
| `assets/product-form-pricing.js` | Live product-page price updates from field charges |
| `extensions/additional-charge-transform/` | Shopify Cart Transform for checkout pricing |

### Syncing default config

Shopify Liquid cannot read `config/` files at runtime. After editing `config/product-form-config.sample.json`, sync to the snippet:

```bash
cp config/product-form-config.sample.json snippets/product-form-config-sample.liquid
```
