import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/ui/Button';
import { getProducts } from '../features/products/getProducts';

export default function HomePage() {
  const allProducts = getProducts();
  const featuredProducts = allProducts.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar mid />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white py-24 border-b border-slate-700">
          <Container maxWidth="2xl">
            <div className="text-center space-y-6 animate-page-enter">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
                Plastopol Furniture
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-100">
                Premium Chair Furniture
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Ergonomic, stylish, and durable chairs crafted from recycled and virgin plastics — for any space
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/about">
                  <Button variant="outline" size="lg" className="border-indigo-400 text-indigo-300 hover:bg-indigo-950">
                    About Us
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-slate-800">
          <Container maxWidth="2xl">
            <div className="mb-12 animate-on-scroll">
              <h2 className="text-4xl font-bold text-slate-100 mb-2">Featured Products</h2>
              <p className="text-slate-400">Check out our most popular items</p>
            </div>

            <ProductGrid
              products={featuredProducts}
              itemsPerRow={3}
              dark
            />

            <div className="text-center mt-12 animate-on-scroll">
              <Link href="/products">
                <Button variant="primary" size="lg">
                  View All Products
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Categories */}
        <section className="py-16 bg-slate-900 border-t border-slate-700">
          <Container maxWidth="2xl">
            <h2 className="text-4xl font-bold text-slate-100 mb-12 text-center animate-on-scroll">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'office',  label: 'Office',  sub: 'Ergonomic workday seating' },
                { name: 'dining',  label: 'Dining',  sub: 'Warm, inviting table chairs' },
                { name: 'lounge',  label: 'Lounge',  sub: 'Relaxed and plush styles' },
                { name: 'outdoor', label: 'Outdoor', sub: 'Weather-ready outdoor chairs' },
              ].map(({ name, label, sub }) => (
                <Link key={name} href={`/products?category=${name}`} className="animate-on-scroll">
                  <div className="bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-6 hover:shadow-lg hover:shadow-indigo-900/20 transition-all cursor-pointer text-center">
                    <h3 className="text-xl font-semibold text-slate-100">{label}</h3>
                    <p className="text-slate-400 text-sm mt-2">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
