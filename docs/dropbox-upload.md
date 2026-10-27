# `dropbox-upload/`

Standalone Node proxy that uploads customer files to Dropbox for the product form. **Not part of the Shopify theme** (listed in `.shopifyignore`).

## Why it exists

- The storefront must never embed `DROPBOX_ACCESS_TOKEN`.
- Browsers on `foreverart.com.au` cannot call Dropbox APIs directly (CORS + secrets).
- Dropbox `save_url` needs a public HTTPS file URL; this proxy instead accepts the raw file and uses `/2/files/upload`.

## Main files

| File | Role |
|------|------|
| `dropbox-upload-proxy-server.mjs` | HTTP server: CORS, `/health`, `POST /upload`, JSON `save_url` |
| `Dockerfile` / `render.yaml` | Deploy to Render (or any Docker host) |
| `README.md` | Deploy steps, env vars, `expired_access_token` fix |
| `package.json` | Local run scripts |

## Env (Render or `.env` at repo root)

**Recommended (auto-renew):**

- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`

**Optional fallback:** `DROPBOX_ACCESS_TOKEN` (short-lived — causes `expired_access_token` when stale)

Also: `DROPBOX_FOLDER` (default `/custom_wedding_posters`), `PORT`.

## Theme wiring

1. Deploy this service to a public HTTPS URL (e.g. Render).
2. Theme settings → Dropbox → set **Dropbox proxy URL** (also in `config/settings_data.json` as `dropbox_proxy_url`).
3. Product upload fields in the wizard POST files to that proxy.

See the folder `README.md` for refresh-token setup and health checks.
