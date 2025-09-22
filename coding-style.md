# Coding Style and Standards

This document defines the conventions for this repo so contributors can ship consistent, maintainable code.

## Languages and Tooling
- TypeScript for all React and server code.
- React Router v7 / Hydrogen conventions for routing and loaders.
- Vite build with route-based code-splitting.
- ESLint (Remix config) + TypeScript `tsc --noEmit`. Keep both clean.

## Project Structure
- Routes: `app/routes/**` (file-system routing). Group related pages in route groups: `(store)`, `(info)`, `(account)`.
- Components: `app/components/**` (reusable, presentational or small stateful pieces). Co-locate tests if added later.
- Styles: `app/styles/**` with route-level CSS imported via links(). Global base in `app/styles/app.css`. Homepage exact styles live in `homepage.css`.
- Server: `server.mjs` for Express adapter. SSR in `app/entry.server.tsx`.

## React/TypeScript Conventions
- Components are function components with explicit Props types.
- Prefer composition over inheritance; keep components small.
- Hooks
  - Put React hooks at the top-level.
  - Derive state when possible; avoid duplicating props into state.
  - For DOM-only event delegation (needed to preserve exact markup), keep effects small, clean up listeners in the return.
- Data
  - Use route loaders where data is required server-side; keep components presentational when rendering static markup.
  - Use `useLoaderData` and typed loader return values.
- Exports
  - Default export for a single component per file.
  - Named exports for helpers and types.

## File Naming
- Components: `PascalCase.tsx` (e.g., `Hero.tsx`).
- Hooks: `useThing.ts`.
- Styles: `kebab-case.css`.
- Routes: `kebab-case.tsx` matching URLs.

## Styling
- Keep `homepage.css` as the single source of truth for the homepage look (per exact-code requirement).
- Do not inline styles in components; rely on existing class names and DOM structure to preserve visuals.
- When adding new CSS, prefer variables already defined in `:root` to keep palette consistent.

## Accessibility
- Ensure interactive elements have correct semantics (button vs anchor).
- Provide `aria-label` for icon-only controls.
- Preserve keyboard operability when adding event listeners.

## Routing and Links
- Use file-system routes under `app/routes/**`.
- For the homepage, we intercept clicks to preserve exact markup. New pages can use `<Link>` with actual `to` attributes.
- Keep route groups minimal; avoid deep nesting unless applicable.

## Error Handling
- Route loaders should return 404 when data missing; throw Response with status.
- Components should avoid try/catch unless handling recoverable UI states.

## Testing (Lightweight)
- Run `npm run typecheck` before committing.
- Prefer adding small unit tests when logic grows (future: Vitest).

## Performance
- Let Vite split routes automatically.
- Avoid heavy effects; debounce scroll/resize work when needed.
- Use memoization for expensive derived values.

## Git Hygiene
- Small, focused commits with succinct messages.
- Avoid committing console logs and unused files.

