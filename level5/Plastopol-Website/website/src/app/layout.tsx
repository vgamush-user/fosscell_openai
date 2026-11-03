import type { Metadata } from "next";
import React from "react";
import "../styles/globals.css";
import { ScrollAnimator } from "../components/layout/ScrollAnimator";

export const metadata: Metadata = {
  title: "Plastopol - Premium Chair Furniture",
  description: "Explore our collection of high-quality chairs for office, dining, lounge, and outdoor spaces",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ScrollAnimator />
      </body>
    </html>
  );
}
