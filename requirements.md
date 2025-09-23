# Runners Rotation - Project Requirements

## Project Overview
Converting HTML mockup (`homepage-sharp.html`) to React Router 7 + Hydrogen 2025 components while maintaining **exact visual appearance** and implementing reusable component architecture.

## Stack Requirements
- **React Router 7.6** - File-system routing
- **Hydrogen 2025.5.0** - Shopify commerce framework
- **Vite 6.2.4** - Build tool and development server
- **Express** - Server implementation
- **CSS-first approach** - No CSS-in-JS, route-scoped styles

## Visual Fidelity Requirements
> **CRITICAL**: React components must render **pixel-perfect** matches to the HTML mockup

### Header Component Requirements
Based on `homepage-sharp.html` mockup:

1. **Navigation Links** - Must appear as bordered buttons with hover effects
2. **Navigation Menu** - Must display as horizontal grid layout  
3. **Currency Display** - Must show `£` (British Pounds) not `$` (USD)
4. **Navigation Circle** - Must use Playfair Display font with rotation animation
5. **Page Container** - Must wrap in `.page-container` for CSS grid system
6. **Mobile Navigation** - Must match mobile menu functionality from mockup

### Layout System Requirements
- **CSS Grid System** - `.page-container` class with responsive grid
- **Full-width Elements** - `.full-width` class for elements that break grid
- **Route-scoped CSS** - Component styles imported per route
- **CSS Custom Properties** - Maintain existing design tokens from mockup

## Component Architecture Requirements

### Architecture Decision: Server/Client Component Split
**CRITICAL**: Components will be split into `.server.tsx` (SSR content) and `.client.tsx` (interactivity) following modern Hydrogen patterns.

### Layout Components (Server/Client Split)
- `Header.client.tsx` - Interactive navigation, mobile menu, cart actions
- `AnnouncementBar.server.tsx` - Static promotional content (SSR)
- `Footer.server.tsx` - Static footer content, links, policies (SSR)
- `Layout.tsx` - Page wrapper coordinating header/footer

### Product Components (Server/Client Split)
- `ProductGallery.server.tsx` - Image rendering, thumbnails (SSR)
- `ProductShowcase.server.tsx` - Product content layout coordinator (SSR)
- `PurchaseCard.client.tsx` - Cart mutations, variant selection (Client)
- `ProductDetails.server.tsx` - Product info, descriptions (SSR)
- All must work on homepage AND product pages identically

### UI Components (Server/Client Split)
- `Button.client.tsx` - Interactive buttons with click handlers
- `Badge.server.tsx` - Static labels and tags (SSR)
- `Price.server.tsx` - Money display formatting (SSR)
- `QuantitySelector.client.tsx` - Interactive quantity controls

### Reusability Requirements
- Components must be **page-agnostic** (work on homepage, product pages, collections)
- Components must accept **both Shopify API data and fallback data**
- Components must be **layout independent** (arrangeable in different layouts)
- Components must maintain **style consistency** across all usage contexts

## Development Standards

### Code Quality
- No "spaghetti code" - components must have clear, single responsibilities
- Proper TypeScript interfaces for all component props
- Consistent file naming and organization
- Clean separation between layout, content, and interactive components

### Performance
- Shared components cached and reused
- CSS imports scoped to routes that need them
- Efficient Shopify data loading patterns
- Responsive images and optimized assets

### Accessibility
- All interactive elements keyboard accessible
- Proper ARIA labels and semantic HTML
- Color contrast compliance
- Screen reader friendly navigation

## File Structure Requirements (Modern Hydrogen Architecture)
```
app/
├── routes/
│   ├── _index.tsx → index.server.tsx ⚡ (rebuild as server component)
│   ├── products.$handle.tsx → products.$handle.server.tsx ⚡ (server route)
│   └── collections.$handle.tsx → collections.$handle.server.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx → Header.client.tsx ⚡ (rebuild as client)
│   │   ├── Footer.tsx → Footer.server.tsx ⚡ (rebuild as server)
│   │   ├── AnnouncementBar.server.tsx 🆕 (extract from header)
│   │   └── Layout.tsx ⚡ (update to coordinate server/client)
│   ├── sections/
│   │   ├── HeroSection.server.tsx 🆕 (extract hero markup)
│   │   └── SectionHeader.server.tsx 🆕 (reusable section titles)
│   ├── product/
│   │   ├── ProductGallery.tsx → ProductGallery.server.tsx ⚡ (convert to server)
│   │   ├── PurchaseCard.tsx → PurchaseCard.client.tsx ⚡ (convert to client)
│   │   ├── ProductShowcase.server.tsx 🆕 (layout coordinator)
│   │   ├── ProductDetails.server.tsx 🆕 (product info)
│   │   └── ProductCard.server.tsx 🆕 (grid item component)
│   ├── ui/
│   │   ├── Button.client.tsx 🆕 (interactive buttons)
│   │   ├── Badge.server.tsx 🆕 (static labels)
│   │   ├── Price.server.tsx 🆕 (money display)
│   │   └── QuantitySelector.client.tsx 🆕 (quantity controls)
│   └── cart/
│       ├── AddToCartButton.client.tsx 🆕 (cart mutations)
│       └── CartDrawer.client.tsx 🆕 (cart overlay)
└── styles/
    ├── tokens.css 🆕 (design system variables)
    ├── components.css ⚡ (component-specific styles)
    ├── app.css ✓ (global styles)
    └── homepage.css ✓ (homepage-specific styles)
```

**Legend:**
- ✓ = Working correctly
- ⚡ = Needs conversion/rebuild
- 🆕 = New component needed

## Testing Requirements
- Visual regression testing against mockup
- Component reusability testing across different page contexts
- Shopify data integration testing
- Mobile responsiveness testing
- Cross-browser compatibility testing

## Success Criteria

### Visual Match
- [ ] Header component renders identically to mockup
- [ ] Footer component renders identically to mockup
- [ ] Navigation styling matches mockup (bordered buttons, grid layout)
- [ ] Currency symbols correct (£ not $)
- [ ] Font usage correct (Playfair Display for nav circle)

### Architecture Success  
- [x] ProductGallery/PurchaseCard components shared between homepage and product pages
- [x] Featured Runner section uses shared components
- [ ] Header/Footer components work as universal layout components
- [ ] CSS grid system functional with page-container wrapper
- [ ] Route-scoped CSS imports working

### Code Quality
- [x] Eliminated "spaghetti code" through component restructure
- [ ] TypeScript interfaces defined for all components
- [ ] Clean file organization following specified structure
- [ ] Proper separation of concerns between component types

## Component Conversion Mapping

### From Current Mixed Components → Proper Server/Client Split

**Header Conversion:**
```
Current: Header.tsx (mixed server/client logic)
    ↓
New: Header.client.tsx (nav interactions, mobile menu, cart)
   + AnnouncementBar.server.tsx (static promo content)
```

**Homepage Conversion:**
```
Current: _index.tsx (mixed route with embedded logic)
    ↓
New: index.server.tsx (server route + data loading)
   + HeroSection.server.tsx (hero content)
   + SectionHeader.server.tsx (section titles)
```

**Product Conversion:**
```
Current: ProductGallery.tsx + PurchaseCard.tsx (mixed)
    ↓
New: ProductShowcase.server.tsx (layout coordinator)
   + ProductGallery.server.tsx (images/content)
   + PurchaseCard.client.tsx (cart interactions)
   + ProductDetails.server.tsx (product info)
```

## Current Status (Architecture Migration)
- ✅ Requirements defined with server/client architecture
- ✅ Component mapping planned
- ✅ File structure blueprint created
- 🔄 **IN PROGRESS**: Server/client component rebuild
- ⏳ Homepage mockup exact matching
- ⏳ TypeScript interfaces implementation
- ⏳ Documentation updates

## Priority Order
1. **Header Visual Fix** - Make navigation match mockup exactly
2. **Footer Visual Fix** - Ensure footer matches mockup layout
3. **Page Container** - Implement CSS grid system wrapper
4. **Currency Correction** - Fix all £/$ symbol inconsistencies
5. **Documentation Update** - Update done.md with completed work

---

## Analysis of Hydrogen Server/Client Component Architecture

The reviewed architecture document provides an **excellent modern Hydrogen framework approach** that differs significantly from our current React Router 7 implementation. Here's my analysis:

### 🎯 **Architecture Quality: Production-Ready Hydrogen Pattern**

**Strengths:**
- ✅ **Proper Server/Client Split** - Clear separation of SSR content vs interactive components
- ✅ **Hydrogen Native Patterns** - Uses `useShopQuery`, cart mutations, and Shopify GraphQL properly  
- ✅ **Performance Optimized** - Server components for content, client components only for interactivity
- ✅ **Type Safety** - Comprehensive TypeScript interfaces for all components
- ✅ **Scalable File Organization** - Logical separation by functionality and rendering location

### 🔄 **Comparison with Current Project State**

**Current Project (React Router 7):**
```
app/
├── routes/
│   ├── _index.tsx              // SSR with loader pattern
│   └── products.$handle.tsx    // SSR with loader pattern
├── components/
│   ├── layout/
│   │   ├── Header.tsx          // Mixed SSR/CSR (needs client interactivity)
│   │   └── Footer.tsx          // Pure SSR
│   └── product/
│       ├── ProductGallery.tsx  // Pure SSR
│       └── PurchaseCard.tsx    // Mixed SSR/CSR (needs client mutations)
```

**Proposed Architecture (Modern Hydrogen):**
```
app/
├── routes/
│   ├── index.server.tsx        // Pure server component
│   └── products.$handle.server.tsx
├── components/
│   ├── layout/
│   │   ├── Header.client.tsx   // Client for nav interactions
│   │   └── Footer.server.tsx   // Server for static content
│   └── product/
│       ├── ProductGallery.server.tsx  // Server for images/content
│       └── PurchaseCard.client.tsx    // Client for cart mutations
```

### 📊 **Key Architectural Differences**

| Aspect | Current (RR7) | Proposed (Hydrogen) | Assessment |
|--------|---------------|-------------------|------------|
| **Route Files** | `.tsx` files | `.server.tsx/.client.tsx` | Hydrogen approach clearer |
| **Data Loading** | `loader()` function | `useShopQuery()` hooks | Both valid, Hydrogen more Shopify-native |
| **Component Split** | Mixed components | Explicit server/client | Proposed approach superior |
| **Cart Mutations** | Form actions | Client-side hooks | Proposed approach more interactive |
| **File Naming** | Generic `.tsx` | `.server.tsx/.client.tsx` | Proposed naming clearer intent |

### 🚨 **Critical Insights for Our Project**

**1. Current Architecture is Valid but Not Optimal**
- Your React Router 7 + Hydrogen 2025 approach works
- But mixing server/client concerns in single components creates complexity
- The proposed split would solve your Header interactivity issues

**2. Server/Client Split Would Fix Current Problems**
- `Header.client.tsx` would handle nav interactions properly
- `PurchaseCard.client.tsx` would handle cart mutations without SSR conflicts
- Clear separation would prevent the "spaghetti code" issues

**3. Migration Path Available**
- Could refactor current components to explicit server/client split
- TypeScript interfaces from proposed architecture directly applicable
- File structure reorganization would improve maintainability

### 🎯 **Recommendations**

**Immediate (Current Sprint):**
- ✅ **Continue current Header/Footer visual fixes** - Don't switch architecture mid-sprint
- ✅ **Use current React Router 7 approach** - You're close to completion

**Future Consideration (Next Sprint):**
- 🔄 **Evaluate server/client component split** - Would solve interactivity issues
- 🔄 **Adopt proposed TypeScript interfaces** - Excellent type safety patterns
- 🔄 **Consider file naming convention** - `.server.tsx/.client.tsx` improves clarity

### 💡 **Hybrid Approach Recommendation**

**Best of Both Worlds:**
1. Keep current React Router 7 foundation (working well)
2. Adopt server/client mental model for component design
3. Use proposed TypeScript interfaces immediately
4. Consider gradual migration to explicit server/client file split

**Example Immediate Adoption:**
```typescript
// Current: Header.tsx (mixed)
export default function Header({ cartCount, collections }: HeaderProps) {
  // Mix of server content + client interactivity
}

// Improved: Apply server/client thinking
// Header.tsx - wrapper that coordinates
// HeaderContent.server.tsx - static nav content  
// HeaderActions.client.tsx - interactive cart/search
```

### 🏆 **Final Assessment**

The proposed architecture is **excellent and modern** but represents a **significant refactor** from your current working implementation. 

**My recommendation:** 
- **Complete current sprint** using React Router 7 approach (you're 90% there)
- **Plan next sprint** to gradually adopt the server/client component patterns
- **Immediately adopt** the TypeScript interfaces and mental models from the proposed architecture

The analysis provides a **roadmap for architectural evolution** rather than immediate replacement of your working system.

---

*This requirements document serves as the single source of truth for the Runners Rotation project conversion from HTML mockup to React components.*