# RunnersRotation — Hydrogen + Express

Modern Hydrogen app running on Express with Vite dev server and React Router 7. This repo adapts the Express starter and adds layout consistency, live product data, and development fallbacks.

## Quick start

Dev server:

```sh
npm run dev
```

Build and start:

```sh
npm run build
npm start
```

## Environment

Create a `.env.local` (ignored by git). This app intentionally keeps the surface minimal.

### Required
```
PUBLIC_STORE_DOMAIN=your-shop.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=shpat_storefront_api_token
SESSION_SECRET=some-long-random-string
```

### Optional (off by default)
```
# Mock product fallback (development only)
# DEV_MOCK_PRODUCTS=1

# Verbose diagnostics (request timing, preflight, /__health)
# DEBUG_INSTRUMENTATION=1

# Header/footer navigation (comma-separated collection handles)
# HEADER_COLLECTION_HANDLES=trail-running,road-running,ultralight
# FOOTER_COLLECTION_HANDLES=faq,campaigns,sustainability
```

### Shopify Metafields (Featured Product)

The product showcased on the homepage reads metafields from the `homepage` namespace:

| Key              | Purpose                                   | Format                              |
|------------------|-------------------------------------------|-------------------------------------|
| `hero_cta_text`  | Hero CTA button label                      | Plain text                          |
| `hero_cta_link`  | Hero CTA destination                       | URL or path                         |
| `hero_subtitle`  | Hero subtitle copy                         | Plain text                          |
| `hero_background`| Hero background image URL                  | URL                                 |
| `size_options`   | Size pill overrides                        | JSON array or comma/newline list    |
| `width_options`  | Width pill overrides                       | JSON array or comma/newline list    |
| `color_options`  | Colour pill overrides                      | JSON array or comma/newline list    |
| `shipping_note`  | Shipping note beneath CTA                  | Plain text                          |
| `benefit_list`   | Benefit bullets at card footer             | JSON array or comma/newline list    |

All fields are optional; defaults kick in when a metafield is absent.

### Advanced (add later only if you truly need them)
These are NOT required for current functionality and are purposely omitted to avoid confusion:
```
# PUBLIC_STOREFRONT_ID=gid://shopify/Storefront/<id>    # Multi-storefront / channel contexts
# PUBLIC_CHECKOUT_DOMAIN=checkout.shopify.com           # Custom CSP tweaks
```

Do NOT paste Admin API tokens here. Only the single Storefront API access token is required.

Notes:
- Dev uses `nodemon --require dotenv/config` so `.env.local` is auto-loaded.
- Restart the dev server after editing environment values.
- Minimal surface reduces misconfiguration (403 ACCESS_DENIED) during deploy.

## Routes
- `/` homepage (styled per `app/styles/homepage.css`)
- `/products/:handle` product route with Storefront data and dev mock fallback
- `/demo` store connectivity test (returns shop name)

## Layout and styles
- Announcement bar fixed at the very top; header fixed directly below it.
- Body is padded to start content below both bars for correct stacking.
- Nav band is full-bleed, hero is centered, CTA constrained.

Key files:
- `app/components/layout/Layout.tsx`
- `app/styles/homepage.css`
- `app/routes/_index.tsx`
- `app/routes/products.$handle.tsx`

## Docs
- Tasks tracker: `tasks.md`
- What’s done: `done.md`

## Debug / Instrumentation

Verbose diagnostics (request timing, storefront query timing, watchdog, /__health) are gated by the env flag:

```
DEBUG_INSTRUMENTATION=1
```

When set:
- Adds per-request timing logs `[req] ...`
- Wraps `storefront.query` with timing & error logs
- Enables long-request watchdog (>8s warning)
- Exposes `GET /__health` (no secrets, only presence booleans)

When unset or `0`: production stays quiet and those hooks are skipped.

### Structure
- `env.mjs` centralizes required/optional env loading & summary logging.
- `instrumentation.mjs` provides attachable diagnostics (pure side-effects only when enabled).
- `server.mjs` remains thin: loads env, conditionally enables instrumentation, sets up SSR handler.

### Recommended Practice
1. Use `DEBUG_INSTRUMENTATION=1` in Preview / development only.
2. Keep Production quiet unless chasing an issue.
3. Remove instrumentation modules later if not needed—they are fully isolated.
