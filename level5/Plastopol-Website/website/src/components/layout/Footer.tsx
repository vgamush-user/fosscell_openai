'use client';

interface FooterProps {
  dark?: boolean;
}

export function Footer({ dark = false }: FooterProps) {
  const bg = dark ? 'bg-stone-900 border-t border-stone-800 text-stone-400' : 'bg-gray-900 text-gray-300';
  const heading = dark ? 'text-amber-400' : 'text-white';
  const divider = dark ? 'border-stone-700' : 'border-gray-700';

  return (
    <footer className={`${bg} mt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="animate-on-scroll">
            <h3 className={`${heading} font-bold text-lg mb-4`}>Plastopol</h3>
            <p className="text-sm">Premium furniture solutions for modern spaces.</p>
          </div>
          <div className="animate-on-scroll">
            <h4 className={`${heading} font-bold mb-4`}>Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-white transition">Products</a></li>
              <li><a href="/about" className="hover:text-white transition">About</a></li>
            </ul>
          </div>
          <div className="animate-on-scroll">
            <h4 className={`${heading} font-bold mb-4`}>Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div className="animate-on-scroll">
            <h4 className={`${heading} font-bold mb-4`}>Contact</h4>
            <p className="text-sm">Email: {" "}
              <a href="mailto:plastopoly@gmail.com" className="hover:text-[#635cdf]">
                 plastopoly@gmail.com 
              </a>
            </p>
            <p className="text-sm">
              Phone:{" "}
              <a href="tel:+91 8075767580" className="hover:text-[#635cdf]">
                +91 8075767580
              </a>
            </p>
          </div>
        </div>
        <div className={`border-t ${divider} mt-8 pt-8 animate-on-scroll`}>
          <p className="text-center text-sm">&copy; 2026 Plastopol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
