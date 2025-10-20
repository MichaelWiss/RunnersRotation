# Tasks — RunnersRotation

Date: 2025-09-23

This document tracks current work, what's done, and what's next.

## Completed
- Product route wired to live Storefront data (`app/routes/products.$handle.tsx`)
- DEV mock fallback for product route (`DEV_MOCK_PRODUCTS=1`)
- Shared Layout applied across routes (`app/components/layout/Layout.tsx`)
- Header fixed to top; announcement bar fixed above header; proper offsets and z-index (`app/styles/homepage.css`)
- Full-bleed nav band without horizontal scroll (`.nav-main`)
- Hero card centered; CTA respects right gutter (`app/styles/homepage.css`)
- Removed nested `.page-container` wrapper from `Layout` to avoid width inconsistencies

## Completed (Latest)
- **CSS/Assets Fixed on Vercel Deployment** ✅
  - Created proper Vercel Build Output structure with `.vercel/output/config.json`
  - Assets now serving correctly at `/assets/*` paths with HTTP 200 responses
  - Updated postbuild script to copy assets to `.vercel/output/static/assets/`
  - Simplified `vercel.json` to minimal working configuration with filesystem handler
  - Verified CSS and JS bundles loading properly on production deployment
- Homepage data layer consolidated into shared helper (`app/data/homepage.server.ts`)
- Homepage hero CTA/background/options now driven via Shopify metafields
- **Navigation & Footer Collections Wired** ✅
  - Added `loadCollectionsByHandles` helper (`app/data/collections.server.ts`)
  - Root loader feeds header/footer links via env-controlled handles
  - Footer quick links now derive from live Shopify collections
- **Homepage hero styling cleanup** ✅
  - Hero background/CTA driven by metafields with safe fallbacks
  - PurchaseCard option lists + shipping note sourced from metafields

## In Progress
- Making the site "live" and building working cart functionality
- Homepage component reuse & showcase alignment (ProductGallery/PurchaseCard/ProductCard) ✅ Step 1 underway

## Next: Live Site & Working Cart Plan

### Phase 1: Make Site "Live" (Production Ready)
1. **Domain & SSL Setup**
   - Purchase/configure custom domain
   - Set up Vercel custom domain with SSL
   - Update Shopify storefront settings for new domain

2. **Environment Configuration**
   - Set production environment variables in Vercel dashboard
   - Configure Shopify Storefront API for production domain
   - Set up proper CORS and security headers

3. **Content & SEO**

## User Account Implementation Plan (Revised - Granular Steps)

### Diagnosis Summary
The server already populates `customerAccessToken` in the root loader and exposes `isLoggedIn`, yet there is no customer-facing authentication flow—no login/register/recover routes, no Storefront API mutations, no session helpers, and the `/account` page is just a placeholder. Navigation always shows an "Account" link without reflecting actual auth state.

### Revised Implementation Plan (Granular Steps)

**Phase 1: Session & API Foundation***
1. Create a new file `app/lib/session.server.ts` that wraps the existing `AppSession` class. Add helper functions: `getCustomerToken()` to retrieve the token, `setCustomerToken(token)` to store it, `clearCustomerToken()` to remove it, and `commitWithHeaders()` to save changes and return response headers.
2. Create a new file `app/lib/shopifyCustomer.server.ts` with functions to call Shopify's Storefront API for customer actions: `createCustomerAccessToken(email, password)` for login, `deleteCustomerAccessToken(token)` for logout, `renewCustomerAccessToken(token)` to refresh expiring tokens, `createCustomer(email, password, firstName, lastName)` for registration, `recoverCustomer(email)` for password reset, `updateCustomer(token, updates)` for profile changes, and `getCustomer(token)` to fetch user details.
3. Create a new file `app/lib/validation.server.ts` with utility functions: `validateEmail(email)` to check email format, `validatePassword(password)` to enforce strength rules (e.g., minimum length), and `normalizeStorefrontErrors(errors)` to convert Shopify API errors into user-friendly messages.
4. Update `context.mjs` to import and expose the session helpers in the loader context, so routes can easily access customer session functions.

**Phase 2: Auth Routes & Forms**
5. Create a new route file `(account)/login.tsx` with a loader that checks for a `redirectTo` query parameter (where to go after login) and an action that calls `createCustomerAccessToken`, sets the session token on success, and redirects; on failure, shows error messages.
6. Create a new route file `(account)/register.tsx` with an action that calls `createCustomer`, then automatically logs them in by calling `createCustomerAccessToken`, and redirects to the account page; handle validation errors from Shopify.
7. Create a new route file `(account)/recover.tsx` with an action that calls `recoverCustomer` to send a reset email, then shows a confirmation message; include a form for entering the email.
8. Create a new route file `(account)/logout.tsx` with an action that calls `clearCustomerToken`, destroys the session, and redirects to the homepage.
9. Create reusable React components in `app/components/auth/`: `LoginForm.tsx` for email/password input, `RegisterForm.tsx` for signup fields, `RecoverForm.tsx` for email input, and `AuthError.tsx` for displaying errors. Each form should use HTML form validation and show Shopify errors nicely.

**Phase 3: Protected Account Area**
10. Update the existing `(account)/account.tsx` to be an overview page that shows customer info (name, email) and links to sub-pages; add a loader that calls `getCustomer` using the session token, or redirects to `/account/login` if no token.
11. Create a new route file `(account)/orders.tsx` with a loader that fetches customer orders (using a new `getCustomerOrders` function in `shopifyCustomer.server.ts`), displays order history, and requires login.
12. Create a new route file `(account)/details.tsx` with a loader that fetches customer details and an action to update them via `updateCustomer`; include a form for editing name, email, etc.
13. Create a new route file `(account)/addresses.tsx` with loaders/actions for viewing and managing shipping/billing addresses (extend `shopifyCustomer.server.ts` with address functions).
14. Create a React context `CustomerContext.tsx` that provides the current customer data, orders, and addresses to all account sub-pages, fetched once in the parent loader.

**Phase 4: UI & UX Updates**
15. Update `NavigationActions.tsx` to conditionally show "Sign In" link when not logged in, and "Account" + "Sign Out" when logged in; optionally add user initials next to "Account".
16. Update the footer in `Footer.tsx` to include account-related links like "My Orders" and "Account Settings" when logged in.
17. Add a "Sign In for Faster Checkout" prompt in the cart drawer (`CartDrawer.tsx`) if the user is not logged in.
18. Ensure checkout-related routes check login status and redirect to login with a return URL if needed.

**Phase 5: Security & Reliability Enhancements**
19. Add token renewal logic: In critical loaders (like account pages), check if the token is near expiry (e.g., within 1 hour), call `renewCustomerAccessToken`, and update the session.
20. Update session cookie settings in `context.mjs` to be HTTP-only, secure (in production), sameSite=lax, and add a timestamp to enforce a 24-hour idle timeout.
21. Add error logging in `shopifyCustomer.server.ts` for Storefront API failures, anonymizing sensitive data; consider adding alerts for high failure rates.
22. Implement CSRF protection by adding a hidden token to forms and validating it in actions.

**Phase 6: Testing & Docs**
23. Write unit tests for `session.server.ts` functions (e.g., setting/getting tokens), `validation.server.ts` rules, and `shopifyCustomer.server.ts` wrappers using Vitest.
24. Write component tests for auth forms (e.g., submit success/failure states) using React Testing Library.
25. Set up end-to-end tests with Playwright covering the full flow: register → login → view account → update details → logout.
26. Update the README.md with a new section on user accounts: required environment variables (e.g., Shopify Storefront token), app permissions needed, deployment steps, and troubleshooting auth issues.

## Completed
- Product route wired to live Storefront data (`app/routes/products.$handle.tsx`)
- DEV mock fallback for product route (`DEV_MOCK_PRODUCTS=1`)
- Shared Layout applied across routes (`app/components/layout/Layout.tsx`)
- Header fixed to top; announcement bar fixed above header; proper offsets and z-index (`app/styles/homepage.css`)
- Full-bleed nav band without horizontal scroll (`.nav-main`)
- Hero card centered; CTA respects right gutter (`app/styles/homepage.css`)
- Removed nested `.page-container` wrapper from `Layout` to avoid width inconsistencies

## Completed (Latest)
- **CSS/Assets Fixed on Vercel Deployment** ✅
  - Created proper Vercel Build Output structure with `.vercel/output/config.json`
  - Assets now serving correctly at `/assets/*` paths with HTTP 200 responses
  - Updated postbuild script to copy assets to `.vercel/output/static/assets/`
  - Simplified `vercel.json` to minimal working configuration with filesystem handler
  - Verified CSS and JS bundles loading properly on production deployment
- Homepage data layer consolidated into shared helper (`app/data/homepage.server.ts`)
- Homepage hero CTA/background/options now driven via Shopify metafields
- **Navigation & Footer Collections Wired** ✅
  - Added `loadCollectionsByHandles` helper (`app/data/collections.server.ts`)
  - Root loader feeds header/footer links via env-controlled handles
  - Footer quick links now derive from live Shopify collections
- **Homepage hero styling cleanup** ✅
  - Hero background/CTA driven by metafields with safe fallbacks
  - PurchaseCard option lists + shipping note sourced from metafields

## In Progress
- Making the site "live" and building working cart functionality
- Homepage component reuse & showcase alignment (ProductGallery/PurchaseCard/ProductCard) ✅ Step 1 underway

## Next: Live Site & Working Cart Plan

### Phase 1: Make Site "Live" (Production Ready)
1. **Domain & SSL Setup**
   - Purchase/configure custom domain
   - Set up Vercel custom domain with SSL
   - Update Shopify storefront settings for new domain

2. **Environment Configuration**
   - Set production environment variables in Vercel dashboard
   - Configure Shopify Storefront API for production domain
   - Set up proper CORS and security headers

3. **Content & SEO**
   - Add real product data and images
   - Configure meta tags and OpenGraph
   - Set up Google Analytics/tracking
   - Add sitemap and robots.txt

### Phase 2: Working Cart Implementation
1. **Cart State Management**
   - Implement cart context/state provider
   - Add cart persistence (localStorage + server sync)
   - Create cart badge in header with item count

2. **Add to Cart Functionality**
   - Wire up "Add to Cart" buttons to Shopify Cart API
   - Add quantity selectors and variant selection
   - Implement cart line item management (add/remove/update)

3. **Cart UI Components**
   - Build cart drawer/modal component
   - Add cart summary and totals
   - Implement checkout redirect to Shopify

4. **Product Variants & Options**
   - Add size/color selection for products
   - Implement variant pricing and availability
   - Add product option validation

## Backlog / Later
- Thread cart count and collection links from route loaders into `Header`
- Tighten responsive metrics for `--header-h` across breakpoints if needed
- Add lightweight tests (type-level and minimal snapshots) for route loaders
- Documentation refinements as architecture evolves (server/client split if adopted)

## Notes
- Environment
  - Set up `.env` with Storefront credentials and optional `DEV_MOCK_PRODUCTS=1`
- Run
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Start: `npm start`# VELOCITY Running - Modern Hydrogen Architecture Migration

## 🔧 Current Sprint: Server/Client Component Rebuild

### Architecture Migration (IN PROGRESS)
- [x] ~~Identified mixed server/client component issues~~
- [x] ~~Defined proper server/client component architecture~~
- [x] ~~Created component conversion mapping and file structure plan~~
- [x] Homepage showcase reuses shared ProductGallery + PurchaseCard
- [x] Reusable ProductCard component extracted for grids
- [ ] **Rebuild Header as Header.client.tsx + AnnouncementBar.server.tsx**
- [ ] **Convert homepage to index.server.tsx with proper component split**
- [ ] **Split ProductGallery/PurchaseCard into server/client components**
- [ ] **Implement TypeScript interfaces for all components**
- [ ] **Test exact mockup visual matching with new architecture**

### Component Conversion Progress
```
Header System:
  Header.tsx (mixed) → Header.client.tsx + AnnouncementBar.server.tsx
  Status: Planning → Implementation

Homepage System:
  _index.tsx (mixed) → index.server.tsx + HeroSection.server.tsx + SectionHeader.server.tsx
  Status: Planning → Implementation

Product System:
  ProductGallery.tsx → ProductGallery.server.tsx
  PurchaseCard.tsx → PurchaseCard.client.tsx
  Homepage showcase reuse → integrate shared components
  Grid cards → extract shared ProductCard component
  Status: Planning → Implementation
```

### New Components to Create
- [ ] `AnnouncementBar.server.tsx` - Static promo content
- [ ] `HeroSection.server.tsx` - Hero content from mockup
- [ ] `SectionHeader.server.tsx` - Reusable section titles
- [ ] `ProductShowcase.server.tsx` - Layout coordinator
- [ ] `ProductDetails.server.tsx` - Product information
- [ ] `Button.client.tsx` - Interactive buttons
- [ ] `Badge.server.tsx` - Static labels
- [ ] `Price.server.tsx` - Money formatting
- [ ] `QuantitySelector.client.tsx` - Quantity controls
- [ ] `AddToCartButton.client.tsx` - Cart mutations

## 📋 Architecture Requirements Completed
- [x] ~~Requirements.md updated with server/client architecture plan~~
- [x] ~~Component mapping defined (mixed → server/client split)~~
- [x] ~~File structure blueprint created with conversion targets~~
- [x] ~~TypeScript interface requirements documented~~
- [x] ~~Visual fidelity requirements defined (exact mockup matching)~~

## 🔄 Previous Sprint Completed Work
- [x] ~~Restructured component architecture to eliminate spaghetti code~~
- [x] ~~Created proper Header/Footer layout components with props~~
- [x] ~~Fixed Featured Runner section to use shared ProductGallery/PurchaseCard components~~
- [x] ~~Added product.css styles to homepage for proper component rendering~~
- [x] ~~Created demo product route for testing without Shopify dependency~~
- [x] ~~Updated velocity-hydrogen-scaffold.md for React Router 7 + Hydrogen 2025 stack~~

## �🔄 Immediate Tasks

### Content & Assets
- [ ] Replace placeholder product images with real running shoe photography
- [ ] Add actual product descriptions and specifications
- [ ] Update contact information and business addresses
- [ ] Create real social media links and profiles
- [ ] Add authentic customer reviews and testimonials
- [ ] Add "New Arrivals" collection section on homepage
- [ ] Create placeholder landing pages for pending links (`/blog`, `/sustainability`, etc.)
- [ ] Implement `/run-club` copy or repoint to placeholder until content ready
- [ ] Add `/faq`, `/careers` content or hook to CMS

### Functionality
- [ ] Implement working cart functionality
- [ ] Add product search capability
- [ ] Create user account system
- [ ] Build product filtering and sorting
- [ ] Add wishlist/favorites feature

### Additional Pages
- [ ] Create individual product detail pages for each shoe
- [ ] Build category pages (Trail Running, Road Running, etc.)
- [ ] Add About Us page with brand story
- [ ] Create contact/support pages
- [ ] Build FAQ page

## 🚀 Feature Enhancements

### E-commerce Integration
- [ ] Integrate with Shopify or similar platform
- [ ] Add payment processing
- [ ] Implement inventory management
- [ ] Create order tracking system
- [ ] Build customer service portal

### Performance Optimization
- [ ] Optimize images for web (WebP format)
- [ ] Implement lazy loading for products
- [ ] Add service worker for offline capability
- [ ] Optimize CSS for critical path rendering
- [ ] Implement image compression and CDN

### Advanced Features
- [ ] Add size guide with measurements
- [ ] Implement product recommendations
- [ ] Create comparison tool for shoes
- [ ] Add advanced search with filters
- [ ] Integrate sticky collection filter toolbar and sidebar
- [ ] Build customer review system

## 📱 Mobile Experience
- [ ] Add pull-to-refresh on mobile
- [ ] Implement swipe gestures for product gallery
- [ ] Create app-like navigation animations
- [ ] Add mobile-specific micro-interactions
- [ ] Optimize for PWA capabilities

## 🎨 Design Refinements
- [ ] Add loading states and skeleton screens
- [ ] Create error states and empty states
- [ ] Implement advanced animations with Framer Motion
- [ ] Add dark mode toggle
- [ ] Create seasonal theme variations

## 📊 Analytics & Tracking
- [ ] Implement Google Analytics
- [ ] Add conversion tracking
- [ ] Set up heat mapping
- [ ] Track user journey analytics
- [ ] Monitor performance metrics

## 🔧 Technical Improvements
- [ ] Convert to React/Next.js architecture
- [ ] Implement TypeScript for type safety
- [ ] Add comprehensive unit testing
- [ ] Set up automated deployment pipeline
- [ ] Implement error logging and monitoring

## 🌐 SEO & Marketing
- [ ] Optimize meta tags and structured data
- [ ] Create XML sitemap
- [ ] Implement Open Graph tags
- [ ] Add blog/content marketing section
- [ ] Build email newsletter signup

## ♿ Accessibility
- [ ] Full WCAG 2.1 AA compliance audit
- [ ] Add keyboard navigation improvements
- [ ] Implement screen reader optimizations
- [ ] Add high contrast mode
- [ ] Create accessibility statement page

## 🔒 Security & Privacy
- [ ] Implement HTTPS and security headers
- [ ] Add GDPR compliance features
- [ ] Create privacy policy and terms
- [ ] Implement secure payment processing
- [ ] Add data protection measures

## 🌍 Internationalization
- [ ] Add multi-language support
- [ ] Implement currency conversion
- [ ] Create region-specific content
- [ ] Add international shipping options
- [ ] Localize payment methods

## 📈 Growth Features
- [ ] Build referral program
- [ ] Create loyalty points system
- [ ] Add social sharing capabilities
- [ ] Implement affiliate program
- [ ] Build brand ambassador portal
_____
