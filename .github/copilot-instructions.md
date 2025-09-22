# Copilot Instructions for RunnersRotation

This document provides guidance for AI coding agents to quickly understand and work with the RunnersRotation codebase.

## 1. Project Overview
- A Remix-inspired React Router app served by an Express server (`server.mjs`).
- Shopify Hydrogen integration for storefront API calls.
- Vite used in middleware mode for development and asset building.

## 2. Architecture & Data Flow
- **Entry point**: `server.mjs` initializes Express, Vite dev middleware, and static serving.
- **getContext(req)**: Builds `{ session, storefront, env }`:
  - `AppSession` wraps `createCookieSessionStorage` for session management.
  - `createStorefrontClient` from Hydrogen sets up cache, tokens, and headers.
- **Request handling**: `createRequestHandler` from `@react-router/express` uses server-build or Vite SSR module.
- **React Router loaders**:
  - Defined in `app/root.tsx` and route files under `app/routes/`.
  - Use `context.storefront.query(...)` for GraphQL queries.

## 3. Key Files & Patterns
- **server.mjs**: ESM module with `nodemon` in dev mode, `cross-env` for `NODE_ENV`.
- **app/root.tsx**:
  - Uses `loader` to fetch `cart` and `shop` layout data.
  - Implements `Layout` with CSP-friendly `<Links>` and `<Scripts>` using `useNonce`.
- **app/routes/**/*.tsx**: Route-specific loaders and components. Inline GraphQL tagged queries (`#graphql`).
- **vite.config.ts**: Plugins: `@shopify/hydrogen`, `@react-router/dev`, `vite-tsconfig-paths`.
- **env.d.ts**: Augmented types for `LoaderFunctionArgs.context` and global `process.env`.

## 4. Development Workflows
- **Install**: `npm install`
- **Dev mode**: `npm run dev` (starts Vite middleware + Express via `nodemon`).
- **Type-check**: `npm run typecheck` runs `tsc --noEmit`.
- **Build & Prod**:
  - `npm run build` (React Router build + Vite assets)
  - `npm start` (Express serves `build/client`)

## 5. Conventions & Notes
- `.mjs` extension for server entry to enable top-level `await`.
- Use `context.storefront.CacheNone()` or `InMemoryCache` for caching strategies.
- Session secrets configured via `SESSION_SECRET` in `.env`.
- Inline comments in code reference upstream issues (e.g., HMR CSS bug in `root.tsx`).

## 6. Extending the App
- **Adding routes**: follow `app/routes/products.$handle.tsx` pattern; use `npx shopify hydrogen generate route` for H2 templates.
- **Cache**: replace `InMemoryCache` with Redis/Memcached by implementing the standard Cache interface.

---

*Let me know if any section needs more detail or examples.*