import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl text-gray-500">Page not found.</p>
        <Link href="/" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Go Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
