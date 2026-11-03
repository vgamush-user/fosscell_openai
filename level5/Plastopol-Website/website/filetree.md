# Plastopol Website — File Tree

Paths are relative to `website/src/` unless noted.

```
Plastopol-Website-main/
│
├── content/
│   └── products.json                  # Product data — single source of truth for all catalogue pages
│
├── public/
│   └── images/
│       ├── placeholder.png
│       └── products/                  # Product images served at /products/<filename>
│           └── <slug>-001.jpg
│
└── website/
    ├── next.config.mjs                # Static export config (output: 'export')
    ├── tailwind.config.ts
    ├── tsconfig.json
    │
    └── src/
        │
        ├── app/                       # Next.js App Router — one folder = one route
        │   ├── layout.tsx             # Root layout: injects ScrollAnimator, global CSS
        │   ├── page.tsx               # / — Home page
        │   │
        │   ├── about/
        │   │   └── page.tsx           # /about
        │   │
        │   └── products/
        │       ├── page.tsx           # /products — listing with search + category filter
        │       └── [slug]/
        │           └── page.tsx       # /products/<slug> — dynamic product detail page
        │                              # generateStaticParams() pre-renders all slugs at build time
        │
        ├── components/                # Pure UI — no business logic, no data fetching
        │   │
        │   ├── layout/
        │   │   ├── Container.tsx      # Max-width wrapper
        │   │   ├── Footer.tsx         # Site footer (dark prop)
        │   │   ├── Navbar.tsx         # Site navbar (dark / mid props)
        │   │   └── ScrollAnimator.tsx # IntersectionObserver + MutationObserver for .animate-on-scroll
        │   │
        │   ├── product/
        │   │   ├── ProductCard.tsx    # Single product card used in grids
        │   │   ├── ProductDetails.tsx # Full product view: main image, colours, features
        │   │   ├── ProductGrid.tsx    # Responsive grid wrapper for ProductCard[]
        │   │   ├── ProductImages.tsx  # (reserved — not yet implemented)
        │   │   └── ProductSpecs.tsx   # Specifications table, uses category CSS classes
        │   │
        │   └── ui/
        │       ├── Badge.tsx          # Pill badge (variant + size props)
        │       ├── Button.tsx         # Button (variant + size props)
        │       ├── Input.tsx          # Labelled input with error + helper text
        │       └── ProductImage.tsx   # Image with exponential-backoff retry + alt text fallback
        │
        ├── features/                  # Business logic — no JSX
        │   │
        │   ├── catalog/               # Catalogue pipeline: filter → search → sort
        │   │   ├── catalogIndex.ts    # Builds Fuse.js search index
        │   │   ├── filterProducts.ts  # Filters by category, colours, stock
        │   │   ├── getCatalog.ts      # Orchestrates the full pipeline, returns matched + others
        │   │   └── sortProducts.ts    # Sorts by name-asc / name-desc; SortOption type lives here
        │   │
        │   └── products/              # Product data access
        │       ├── getProducts.ts     # Returns all active products from products.json
        │       ├── getProductsBySlug.ts # Returns one product by slug
        │       └── productUtils.ts    # getThumbnail() helper
        │
        ├── lib/                       # Stateless pure utilities
        │   ├── constants.ts           # CATEGORIES, DEFAULT_FILTERS, IMAGE_CONFIG, APP_CONFIG
        │   ├── formatPrice.ts         # Intl.NumberFormat INR formatter (reserved for future use)
        │   └── slugify.ts             # slugify() + generateUniqueSlug() — used by CMS
        │
        ├── styles/
        │   ├── globals.css            # Tailwind base + animate-page-enter + animate-on-scroll
        │   └── categories/            # Per-category CSS, scoped via [data-category] attribute
        │       ├── dining.css
        │       ├── lounge.css
        │       ├── office.css
        │       ├── other.css
        │       └── outdoor.css
        │
        └── types/
            ├── global.d.ts            # Ambient type declarations
            └── index.ts               # All shared types: Product, Category, CatalogFilters, etc.
```

## Data flow

```
content/products.json
    └── getProducts() / getProductBySlug()
            └── getCatalog()  [filter → search → sort]
                    └── ProductGrid → ProductCard
                    └── ProductDetails + ProductSpecs
```

## Adding a product

1. Add an entry to `content/products.json` with a unique `slug` and `status: "active"`
2. Place images in `public/images/products/`
3. Run `npm run build` — `generateStaticParams()` picks up the new slug automatically
