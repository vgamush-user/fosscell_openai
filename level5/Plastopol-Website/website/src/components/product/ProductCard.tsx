'use client';

import Link from 'next/link';
import { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { ProductImage } from '../ui/ProductImage';

interface ProductCardProps {
  readonly product: Product;
  readonly dark?: boolean;
}

export function ProductCard({ product, dark = false }: ProductCardProps) {
  const imageUrl = `/images/products/${product.thumbnail}`;
  const isSoldOut = !product.inStock;

  const card = dark
    ? 'bg-stone-800 border border-stone-700 hover:border-amber-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/30'
    : 'bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300';

  const title = dark
    ? 'text-stone-100 group-hover:text-amber-400 transition'
    : 'text-gray-900 group-hover:text-blue-600 transition';

  const desc = dark ? 'text-stone-400' : 'text-gray-600';
  const meta = dark ? 'text-stone-500' : 'text-gray-500';

  return (
    <Link href={`/products/${product.slug}`} className="animate-on-scroll"> 
      <div className={`group cursor-pointer h-full ${card}`}>
        {/* Image — no animate-on-scroll here; opacity:0 would hide the image */}
        <div className="relative overflow-hidden h-56">
          <ProductImage
            src={imageUrl}
            alt={product.modelName}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="danger" size="md">Out of Stock</Badge>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="info" size="sm">{product.category}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 animate-on-scroll">
          <h3 className={`text-lg font-semibold ${title}`}>
            {product.modelName}
          </h3>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="default" size="sm">{tag}</Badge>
              ))}
            </div>
          )}

          <p className={`text-sm line-clamp-2 ${desc}`}>
            {product.description}
          </p>

          <p className={`text-xs ${meta}`}>
            Lead time: {product.leadTime}
          </p>
        </div>
      </div>
    </Link>
  );
}