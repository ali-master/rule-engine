# @usex/rule-engine Brand Assets

> **Official brand assets and usage guidelines for the @usex/rule-engine project**

## 📦 Available Assets

### Package Logos

#### @packages/core
- **Purpose**: Rule evaluation and processing engine
- **Design Concept**: IF-THEN-ELSE decision flow diagram
- **Files**:
  - `core-logo.svg` (vector, recommended)
  - `core-logo.png` (raster, 200×200px)

#### @packages/builder
- **Purpose**: Visual rule construction interface
- **Design Concept**: Drag & drop interface with component palette
- **Files**:
  - `builder-logo.svg` (vector, recommended)
  - `builder-logo.png` (raster, 200×200px)

### Social Media Preview
- **Purpose**: Social sharing, GitHub repository preview
- **Dimensions**: 1280×640px (optimized for social platforms)
- **Files**:
  - `social-preview.svg` (vector, recommended)
  - `social-preview.png` (raster, 1280×640px)

## 🎨 Design System

### Color Palette

#### Core Package Colors
```css
/* Primary Gradient: Electric Blue to Purple */
--core-primary: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);

/* Success Path: Green */
--core-success: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Error Path: Orange to Red */
--core-error: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
```

#### Builder Package Colors
```css
/* Primary Gradient: Orange to Pink */
--builder-primary: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%);

/* Creation Accent: Emerald to Cyan */
--builder-accent: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);

/* Active Element: Golden */
--builder-active: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
```

### Typography
- **Primary**: `system-ui, -apple-system, sans-serif`
- **Monospace**: `monospace` (for code elements)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 900 (black)

### Visual Effects
- **Glow**: `filter: drop-shadow(0 0 8px rgba(color, 0.4))`
- **Shadow**: `filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))`
- **Border Radius**: `8px` (small), `12px` (medium), `16px` (large)

## 📐 Logo Specifications

### Core Logo Elements
- **Central Diamond**: IF decision node with white "IF" text
- **Input Box**: Data input with `{data}` placeholder text
- **Flow Paths**: TRUE (green) and FALSE (orange/red) branches
- **Output Circles**: Success (✓) and error (✗) indicators
- **Animated Flow**: Data processing visualization

### Builder Logo Elements
- **Canvas Area**: Workspace with dotted border
- **Draggable Components**: AND, >, $.user.age blocks with trails
- **Drop Zones**: Dashed outline target areas
- **Component Palette**: Available building blocks
- **Hand Cursor**: Interaction indicator with motion trail

### Sizing Guidelines
| Usage | Minimum Size | Recommended Size | Maximum Size |
|-------|-------------|------------------|-------------|
| Favicon | 16×16px | 32×32px | 64×64px |
| Navigation | 24×24px | 32×32px | 48×48px |
| Cards/Lists | 48×48px | 64×64px | 96×96px |
| Headers | 96×96px | 120×120px | 200×200px |
| Hero Sections | 120×120px | 200×200px | 400×400px |

## ✅ Usage Guidelines

### ✅ DO
- Use the SVG versions for all digital applications
- Maintain the original aspect ratio (1:1 square)
- Ensure adequate clear space around logos (minimum 20% of logo width)
- Use logos on contrasting backgrounds for optimal visibility
- Respect the functional design concept when explaining the packages

### ❌ DON'T
- Stretch, skew, or distort the logos
- Change the colors or gradients
- Add additional elements or text to the logos
- Use low-resolution PNG files when SVG is available
- Place logos on busy backgrounds without sufficient contrast
- Remove or modify the animated elements in digital contexts

## 📱 Platform-Specific Usage

### GitHub Repository
- **README Header**: Use `core-logo.svg` at 120×120px
- **Social Preview**: Use `social-preview.svg` (1280×640px)
- **Issue Templates**: Small logo usage at 32×32px

### NPM Package
- **Package Icon**: Use `core-logo.png` (200×200px)
- **Documentation**: Use `core-logo.svg` with flexible sizing

### Social Media
- **Twitter/X Cards**: Use `social-preview.svg`
- **LinkedIn Posts**: Use `social-preview.svg`
- **Avatar/Profile**: Use individual package logos at 400×400px

### Documentation Sites
- **Header Logo**: 120×120px recommended
- **Navigation**: 32×32px recommended
- **Footer**: 48×48px recommended

## 🔗 Logo Meaning & Messaging

### Core Package
**Visual Message**: "I process your data through decision logic"
- The diamond shape represents decision points (standard flowchart symbol)
- The branching paths show TRUE/FALSE evaluation
- The animated flow demonstrates active processing
- Colors indicate different outcomes (green=success, red=error)

### Builder Package
**Visual Message**: "I help you build rules visually"
- The canvas represents the workspace
- Draggable blocks show the construction process
- Drop zones indicate where components can be placed
- The hand cursor shows user interaction

## 📄 File Formats & Technical Specs

### SVG Files (Recommended)
- **Viewbox**: 200×200 (logos), 1280×640 (social preview)
- **Optimization**: Minified and compressed
- **Animations**: CSS animations for web compatibility
- **Compatibility**: All modern browsers, design tools

### PNG Files (Fallback)
- **Resolution**: 200×200px (logos), 1280×640px (social preview)
- **Format**: PNG-24 with transparency
- **Compression**: Optimized for web delivery
- **Background**: Transparent

## 📞 Brand Contact

For questions about brand usage, asset requests, or licensing:

- **Repository**: [github.com/ali-master/rule-engine](https://github.com/ali-master/rule-engine)
- **Issues**: [Brand Asset Issues](https://github.com/ali-master/rule-engine/issues/new?labels=brand,assets)
- **Maintainer**: [@ali-master](https://github.com/ali-master)

---

**Last Updated**: June 02, 2025
**Version**: 2.1.0
**License**: MIT License (same as project)

**Made with ❤️ by [Ali Torki](https://github.com/ali-master)**
