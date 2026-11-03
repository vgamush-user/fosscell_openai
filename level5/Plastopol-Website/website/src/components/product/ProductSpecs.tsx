'use client';

import { Product } from '../../types';

interface ProductSpecsProps {
  readonly product: Product;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  if (product.specifications.length === 0) {
    return null;
  }

  return (
    <div className="product-spec-bg">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'inherit' }}>Specifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.specifications.map((spec, idx) => (
          <div key={idx} className="animate-on-scroll">
            <dt className="product-spec-key">{spec.key}</dt>
            <dd className="product-spec-val mt-1">{spec.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}
