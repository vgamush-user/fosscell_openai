import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { getProductBySlug } from '@/features/products/getProductsBySlug';
import { getProducts } from '@/features/products/getProducts';

import '@/styles/categories/office.css';
import '@/styles/categories/dining.css';
import '@/styles/categories/lounge.css';
import '@/styles/categories/outdoor.css';
import '@/styles/categories/other.css';

// Tells Next.js which slugs to pre-render at build time (required for static export)
export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

interface Props {
  readonly params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div data-category={product.category}>
      <Navbar dark />

      <main className="product-page min-h-screen">
        {/* Page header */}
        <section className="product-page-header py-12">
          <Container maxWidth="2xl">
            <div className="space-y-2 animate-page-enter">
              <p className="category-label text-sm font-semibold uppercase tracking-widest">
                {product.category}
              </p>
              <nav className="text-sm product-desc">
                <a href="/products" className="hover:underline">Products</a>
                {' › '}
                <span>{product.modelName}</span>
              </nav>
            </div>
          </Container>
        </section>

        {/* Product Details */}
        <section className="py-12 animate-on-scroll">
          <Container maxWidth="2xl">
            <ProductDetails product={product} />
          </Container>
        </section>

        {/* Specifications — uses ProductSpecs component */}
        <section className="py-12 animate-on-scroll">
          <Container maxWidth="2xl">
            <ProductSpecs product={product} />
          </Container>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
