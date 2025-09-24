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

Create a `.env` in the repo root with your Storefront credentials:

```
PUBLIC_STORE_DOMAIN=your-shop.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=shpat_xxx
SESSION_SECRET=some-long-random-string

# optional
PRIVATE_STOREFRONT_API_TOKEN=
PUBLIC_STOREFRONT_ID=

# development fallback for product page
DEV_MOCK_PRODUCTS=1
```

Notes:
- Dev uses `nodemon --require dotenv/config` so `.env` is automatically loaded.
- Restart the dev server after editing `.env`.

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
