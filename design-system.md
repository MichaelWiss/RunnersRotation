# VELOCITY Running - Design System

## Brand Overview
VELOCITY is a premium running culture brand focused on serious athletes and passionate runners. The design system emphasizes performance, craftsmanship, and the pursuit of excellence in running.

## Color Palette

### Primary Colors
```css
:root {
  --bg: #f7efe6;            /* Warm cream background */
  --panel: #0b2545;         /* Deep indigo for text/UI */
  --accent: #e94c26;        /* Warm orange-red accent */
  --card: #fff3e8;          /* Light peach card background */
  --line: #f1d7c7;          /* Light divider tone */
}
```

### Secondary Colors
```css
:root {
  --accent-dark: #c83b1a;   /* Darker accent for hover states */
  --accent-light: #ff7a4a;  /* Lighter accent variation */
  --panel-light: #a33a25;   /* Secondary orange-red */
  --panel-dark: #4a140e;    /* Deepest orange-red */
  --muted: #8b3a2a;         /* Muted warm tone for secondary text */
  --cta-hover: #c83b1a;     /* Hover state for buttons */
}
```

### Effect Colors
```css
:root {
  --glass: rgba(11,37,69,0.06);        /* Glass effect overlay */
  --shadow-soft: 0 8px 30px rgba(11,37,69,0.06);
  --shadow-strong: 0 18px 50px rgba(11,37,69,0.08);
}
```

### Gradients
```css
:root {
  --warm-gradient: linear-gradient(180deg, #f7efe6, #f6e9df 60%);
  --card-gradient: linear-gradient(180deg, #fff3e8, #ffece0);
  --accent-gradient: linear-gradient(90deg, #e94c26, #ff7a4a);
}
```

## Typography

### Font Families
- **Primary**: 'Inter' - Clean, modern sans-serif for body text and UI
- **Display**: 'Playfair Display' - Elegant serif for headings and emphasis
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Typography Scale
```css
/* Headings */
.hero-title { font-size: 64px; font-weight: 800; line-height: 1.1; }
.section-title { font-size: 48px; font-weight: 700; }
.product-title { font-size: 42px; font-weight: 800; }
.card-title { font-size: 28px; font-weight: 700; }

/* Body Text */
body { font-size: 16px; line-height: 1.45; }
.hero-subtitle { font-size: 20px; font-weight: 500; }
.section-subtitle { font-size: 18px; font-weight: 500; }
.product-description { font-size: 15px; line-height: 1.5; }

/* UI Text */
.nav-link { font-size: 14px; font-weight: 600; text-transform: uppercase; }
.footer-links a { font-size: 12px; font-weight: 800; text-transform: uppercase; }
```

## Layout System

### Grid System
```css
/* Page Container */
.page-container {
  display: grid;
  grid-template-columns: 1fr min(1200px, 90%) 1fr;
}

/* Full Width Elements */
.full-width { grid-column: 1 / -1; }

/* Product Grids */
.home-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}
```

### Responsive Breakpoints
- **Desktop**: > 980px
- **Tablet**: 768px - 980px
- **Mobile**: < 768px

## Components

### Navigation
- **Desktop**: Full-width grid navigation (5 columns)
- **Mobile**: Hamburger menu with integrated sections
- **Styling**: Sharp corners, outlined buttons, deep indigo text

### Cards
```css
.card {
  background: var(--card-gradient);
  border-radius: 0px; /* Sharp corners */
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--line);
  transition: all 0.3s ease;
}
```

### Buttons
```css
.button-primary {
  background: var(--accent-gradient);
  color: var(--card);
  padding: 16px 32px;
  border-radius: 0px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.button-outlined {
  color: var(--panel);
  border: 2px solid var(--panel);
  background: transparent;
  text-transform: uppercase;
}
```

### Form Elements
```css
.form-input {
  border: 1px solid var(--line);
  border-radius: 0px;
  background: var(--card);
  color: var(--panel);
}
```

## Design Principles

### Sharp Corners
All elements use `border-radius: 0px` for a modern, architectural aesthetic.

### Color Harmony
- **Deep indigo** (`#0b2545`) for all text and UI elements
- **Warm orange-red** (`#e94c26`) for accents and CTAs
- **Warm cream** (`#f7efe6`) for backgrounds
- No pure black, white, or grey colors

### Typography Hierarchy
1. **Display fonts** (Playfair Display) for impact and brand personality
2. **Body fonts** (Inter) for readability and functionality
3. **Italic styling** for premium feel
4. **Letter spacing** for luxury aesthetic

### Layout Philosophy
- **Full-width elements** break container constraints
- **Grid-based** layouts for consistency
- **Vertical rhythm** through consistent spacing
- **Mobile-first** responsive design

## Animation & Effects

### Transitions
```css
/* Standard transition */
transition: all 0.3s ease;

/* Hover effects */
transform: translateY(-2px);
transform: scale(1.02);
```

### Animated Gradients
```css
@keyframes subtle-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Glass Effects
- **Backdrop blur**: `backdrop-filter: blur(20px)`
- **Semi-transparent backgrounds**: `rgba(247, 239, 230, 0.92)`

## Brand Voice & Tone

### Brand Personality
- **Premium**: High-quality, crafted, exclusive
- **Performance**: Technical, precise, results-driven
- **Passionate**: Enthusiastic about running culture
- **Authentic**: Genuine, honest, trustworthy

### Content Style
- **Headlines**: Bold, inspirational, action-oriented
- **Body**: Informative, technical when needed, approachable
- **CTAs**: Direct, motivating, clear value proposition

## Implementation Guidelines

### CSS Custom Properties
Always use CSS custom properties (variables) for colors, spacing, and typography to maintain consistency.

### Mobile Navigation
- Hide desktop nav-actions on mobile
- Integrate footer-links into hamburger menu
- Use sectioned mobile navigation

### Accessibility
- Maintain color contrast ratios
- Use semantic HTML structure
- Provide proper focus states
- Include ARIA labels for interactive elements

### Performance
- Use system fonts as fallbacks
- Optimize images and gradients
- Minimize layout shifts
- Progressive enhancement approach