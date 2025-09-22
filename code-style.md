# VELOCITY Running - Code Style Guide

## General Principles

### Code Philosophy
- **Mobile-first responsive design**: Start with mobile styles, enhance for larger screens
- **Progressive enhancement**: Build core functionality first, add enhancements
- **Semantic HTML**: Use proper HTML5 semantic elements
- **Accessibility-first**: Consider screen readers and keyboard navigation
- **Performance-conscious**: Optimize for speed and efficiency

## HTML Guidelines

### Structure
```html
<!-- Use semantic HTML5 elements -->
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

<!-- Proper heading hierarchy -->
<h1> -> <h2> -> <h3> (no skipping levels)

<!-- Meaningful class names -->
<div class="product-card">
<button class="nav-link">
<section class="hero-section">
```

### Attributes
- Use `alt` attributes for all images
- Include `aria-label` for interactive elements
- Add `lang` attribute to HTML element
- Use proper `meta` tags for viewport and charset

### Class Naming Convention
```css
/* BEM-inspired naming */
.block-name
.block-name__element
.block-name--modifier

/* Examples from project */
.nav-menu
.nav-menu__item
.nav-menu--mobile
.footer-section
.footer-section__title
.hero-card--featured
```

## CSS Guidelines

### Organization
```css
/* 1. CSS Custom Properties (Variables) */
:root {
  --primary-color: #value;
}

/* 2. Base Reset & Typography */
*, *::before, *::after { box-sizing: border-box; }

/* 3. Layout Components */
.container, .grid-system

/* 4. UI Components */
.button, .card, .nav

/* 5. Utilities */
.full-width, .text-center

/* 6. Media Queries */
@media (max-width: 768px) {}
```

### CSS Custom Properties
```css
/* Always use custom properties for: */
:root {
  /* Colors */
  --bg: #f7efe6;
  --panel: #0b2545;
  --accent: #e94c26;
  
  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-display: 'Playfair Display', serif;
  
  /* Effects */
  --radius: 0px; /* Sharp corners mandate */
  --shadow-soft: 0 8px 30px rgba(11,37,69,0.06);
  --transition: all 0.3s ease;
}
```

### Responsive Design
```css
/* Mobile-first approach */
.component {
  /* Mobile styles (default) */
  display: block;
  padding: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    display: flex;
    padding: 24px;
  }
}

/* Desktop and up */
@media (min-width: 980px) {
  .component {
    padding: 32px;
  }
}
```

### Grid Systems
```css
/* Use CSS Grid for layouts */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

/* Full-width breakout technique */
.full-width {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

## JavaScript Guidelines

### Code Style
```javascript
// Use const for immutable values
const hamburger = document.getElementById('hamburger');

// Use let for mutable values
let isMenuOpen = false;

// Use arrow functions for callbacks
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
});

// Use destructuring where appropriate
const { classList } = hamburger;

// Use template literals
const message = `Menu is ${isMenuOpen ? 'open' : 'closed'}`;
```

### Event Handling
```javascript
// Prefer event delegation for dynamic content
document.addEventListener('click', (e) => {
  if (e.target.matches('.pill')) {
    // Handle pill selection
  }
});

// Clean up event listeners
function initializeComponents() {
  const cleanup = [];
  
  // Add listeners and store cleanup functions
  const handler = () => { /* ... */ };
  element.addEventListener('click', handler);
  cleanup.push(() => element.removeEventListener('click', handler));
  
  return cleanup;
}
```

### Component Pattern
```javascript
// Use revealing module pattern for components
const NavigationComponent = (() => {
  let isOpen = false;
  
  const toggle = () => {
    isOpen = !isOpen;
    updateUI();
  };
  
  const updateUI = () => {
    // Update DOM based on state
  };
  
  const init = () => {
    // Initialize component
  };
  
  return { init, toggle };
})();
```

## Design System Integration

### Color Usage
```css
/* Always use custom properties */
.component {
  color: var(--panel);           /* Deep indigo for text */
  background: var(--card);       /* Light peach for backgrounds */
  border-color: var(--line);     /* Light divider tone */
}

/* Avoid hardcoded colors */
.component {
  color: #0b2545; /* ❌ Don't do this */
  color: var(--panel); /* ✅ Do this */
}
```

### Typography
```css
/* Use established type scale */
.heading-1 {
  font-family: var(--font-family-display);
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  font-style: italic;
}

.body-text {
  font-family: var(--font-family-primary);
  font-size: 16px;
  line-height: 1.45;
}
```

### Sharp Corners Mandate
```css
/* ALL elements must use sharp corners */
.any-element {
  border-radius: var(--radius); /* Always 0px */
}

/* Never use rounded corners */
.element {
  border-radius: 8px; /* ❌ Forbidden */
  border-radius: 0px; /* ✅ Required */
}
```

## Performance Guidelines

### CSS Performance
```css
/* Use efficient selectors */
.nav-link { } /* ✅ Good */
div > ul > li > a { } /* ❌ Avoid deep nesting */

/* Optimize animations */
.element {
  transform: translateX(100px); /* ✅ Use transform */
  left: 100px; /* ❌ Avoid layout properties */
}

/* Use will-change sparingly */
.animated-element {
  will-change: transform;
}
```

### HTML Performance
```html
<!-- Optimize images -->
<img src="image.webp" alt="Description" loading="lazy" />

<!-- Preload critical resources -->
<link rel="preload" href="fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use appropriate image formats -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback">
</picture>
```

## Accessibility Guidelines

### Semantic HTML
```html
<!-- Use proper landmarks -->
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

<!-- Use headings properly -->
<h1>Page title</h1>
  <h2>Section title</h2>
    <h3>Subsection title</h3>

<!-- Add ARIA labels -->
<button aria-label="Open navigation menu" aria-expanded="false">
  <span class="hamburger-icon"></span>
</button>
```

### Focus Management
```css
/* Provide visible focus states */
.nav-link:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Hide decorative elements from screen readers */
.decorative-icon {
  aria-hidden="true";
}
```

## File Organization

### Directory Structure
```
/RunnersRotation/
├── homepage-sharp.html
├── product-page-sharp.html
├── design-system.md
├── done.md
├── tasks.md
├── code-style.md
└── .github/
    └── copilot-instructions.md
```

### Naming Conventions
- Use kebab-case for file names: `homepage-sharp.html`
- Use camelCase for JavaScript variables: `navContainer`
- Use kebab-case for CSS classes: `.nav-container`
- Use UPPERCASE for constants: `const API_URL`

## Comments & Documentation

### CSS Comments
```css
/* === SECTION: Navigation === */

/* Component: Navigation menu with full-width layout */
.nav-menu {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 equal columns */
  gap: 1px; /* Minimal gap for borders */
}

/* State: Active navigation item */
.nav-menu a:hover {
  background: linear-gradient(180deg, rgba(233,76,38,0.08), rgba(233,76,38,0.02));
  color: var(--accent); /* Use accent color for active state */
}
```

### HTML Comments
```html
<!-- Hero Section: Main landing area with CTA -->
<section class="hero-section section full-width">
  <!-- Hero content -->
</section>

<!-- Product Grid: 6-product responsive layout -->
<div class="home-products-grid grid-container">
  <!-- Product cards generated here -->
</div>
```

### JavaScript Comments
```javascript
/**
 * Initialize hamburger navigation
 * Handles mobile menu toggle and click-outside-to-close
 */
const initializeNavigation = () => {
  const hamburger = document.getElementById('hamburger');
  const navMain = document.getElementById('nav-main');
  
  // Toggle mobile menu visibility
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMain.classList.toggle('active');
  });
};
```