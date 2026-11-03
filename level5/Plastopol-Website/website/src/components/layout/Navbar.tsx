'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  dark?: boolean;
  mid?: boolean;
}

export function Navbar({ dark = false, mid = false }: NavbarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const bg =
    dark ? 'bg-stone-900 border-b border-stone-800'
    : mid ? 'bg-slate-900 border-b border-slate-700'
    : 'bg-white shadow-md';

  const logo =
    dark ? 'text-amber-400'
    : mid ? 'text-indigo-400'
    : 'text-blue-600';

  const link =
    dark ? 'text-stone-300 hover:text-amber-400 transition'
    : mid ? 'text-slate-300 hover:text-indigo-300 transition'
    : 'text-gray-700 hover:text-blue-600 transition';

  const btn =
    dark ? 'bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition'
    : mid ? 'border border-indigo-500 text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-950 transition'
    : 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition';

  return (
    <nav className={`${bg} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {!logoFailed && (
              <img
                src="/images/logo.png"
                alt="Plastopol logo"
                className="h-8 w-auto"
                onError={() => setLogoFailed(true)}
              />
            )}
            <span className={`text-2xl font-bold hidden sm:block ${logo}`}>
              Plastopol
            </span>
          </Link>
          <div className="flex items-center space-x-8">
            <Link href="/" className={link}>Home</Link>
            <Link href="/products" className={link}>Products</Link>
            <Link href="/about" className={link}>About</Link>
            <button className={btn}>Contact</button>
          </div>
        </div>
      </div>
    </nav>
  );
}