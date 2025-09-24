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

## In Progress
- Homepage live content (safe)
  - Replace static copy with Storefront data while preserving exact HTML/CSS/classes
  - Keep strict fallbacks for missing data

## Backlog / Next
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