'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Container } from '../../components/layout/Container';
import { ProductGrid } from '../../components/product/ProductGrid';
import { getCatalog } from '../../features/catalog/getCatalog';
import { CATEGORIES } from '../../lib/constants';
import { Category } from '../../types';

const ALL = '' as const;

// Build button list from the single source of truth in constants.ts
const CATEGORY_BUTTONS = [
  { value: ALL, label: 'All' },
  ...CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | ''>('');

  const { matched } = useMemo(() => getCatalog({
    query: search,
    filters: activeCategory ? { category: activeCategory as Category } : {},
  }), [search, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar dark />

      <main className="flex-1">
        {/* Page header */}
        <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950 py-16 border-b border-stone-800">
          <Container maxWidth="2xl">
            <div className="space-y-3 animate-page-enter">
              <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest">
                Collection
              </p>
              <h1 className="text-5xl font-bold text-stone-100">All Products</h1>
              <p className="text-stone-400 text-lg">
                Browse our complete range of premium plastic chairs
              </p>
            </div>
          </Container>
        </section>

        {/* Search + Filter */}
        <section className="py-8 border-b border-stone-800 bg-stone-900 sticky top-16 z-40">
          <Container maxWidth="2xl">
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none"
                  fill="none" stroke="currentColor" strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-amber-500 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category buttons — driven by CATEGORIES from constants.ts */}
              <div className="flex flex-wrap gap-2">
                {CATEGORY_BUTTONS.map(({ value, label }) => (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition
                      ${activeCategory === value
                        ? 'bg-amber-600 text-white border border-amber-500'
                        : 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-600 hover:text-amber-400'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Grid */}
        <section className="py-16">
          <Container maxWidth="2xl">
            {matched.length === 0 ? (
              <div className="py-20 text-center animate-on-scroll">
                <p className="text-stone-500 text-lg">No products match your search.</p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory(''); }}
                  className="mt-4 text-amber-500 hover:text-amber-400 text-sm underline transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ProductGrid products={matched} itemsPerRow={3} dark />
            )}
          </Container>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
