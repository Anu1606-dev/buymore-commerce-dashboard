# BuyMore Commerce Dashboard

BuyMore is a custom-coded WordPress plugin that recreates the supplied commerce dashboard reference image. It is built with PHP, semantic HTML, CSS, and vanilla JavaScript only: no Elementor or other page builder is required.

## What is included

- `buymore-dashboard/` - installable WordPress plugin.
- `index.html` - static GitHub Pages demo using the same visual language and interactions.
- `assets/` - shared responsive CSS and vanilla JavaScript for the static demo.
- `.github/workflows/pages.yml` - deploys the static demo to GitHub Pages.

## WordPress installation

1. Copy `buymore-dashboard` into `wp-content/plugins/` (or upload the folder as a ZIP).
2. Activate **BuyMore Commerce Dashboard** in WordPress admin.
3. Add the shortcode `[buymore_dashboard]` to any page and make that page the site homepage if desired.
4. Add products under **BuyMore Products**. Each product supports a title, featured image, category (`men` or `women`), price, label, and image URL.

The shortcode queries the `bm_product` custom post type. If no products exist yet, it renders a curated fallback catalogue so the page is usable immediately. This keeps content editable in the CMS while preserving a polished first-run experience.

## Dynamic content and interactions

- Product cards are generated from WordPress content and post meta rather than hard-coded page-builder blocks.
- The sidebar is a real section switcher: Popular Products, Explore Now, Clothing and Shoes, Gifts and Living, and Inspiration update the active state, URL hash, heading, and product grid.
- Every promotional/product tile is keyboard-focusable and clickable, with hover lift and selected-card feedback.
- The All / Men / Women controls filter products client-side.
- Search, filter, favourite, tab, and cart controls are keyboard-accessible and provide visible feedback.
- The plugin registers a REST endpoint at `/wp-json/buymore/v1/products` for integrations and headless previews.
- Responsive CSS changes the shell from two columns to a stacked mobile layout at tablet and phone breakpoints.

## Static demo and GitHub Pages

The root `index.html` is intentionally dependency-free so GitHub Pages can serve it directly. Enable **Settings → Pages → GitHub Actions** after pushing, or let the included workflow publish it automatically from the `main` branch.

GitHub Pages cannot execute PHP, so the live Pages URL is the visual/static demo. The full WordPress implementation remains in the repository and is the source to install in WordPress.

## Evaluation checklist

- Design accuracy: pale green canvas, rounded white dashboard shell, sidebar, pill controls, product cards, and promotional banners mirror the reference composition.
- Responsive design: tested CSS layouts for desktop, tablet, and mobile widths.
- Dynamic content handling: WordPress custom post type, post meta, shortcode query, REST route, and fallback catalogue.
- CMS usability: products can be created and edited through the WordPress admin.
- Code structure: plugin bootstrap, view rendering, admin fields, styles, and script behaviour are separated and documented.
- Technical explanation: this README documents installation, content handling, and the static deployment trade-off.
