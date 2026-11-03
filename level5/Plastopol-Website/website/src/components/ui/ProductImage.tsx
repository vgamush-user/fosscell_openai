'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface ProductImageProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
}

const PLACEHOLDER = '/images/placeholder.jpg';

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const isFallback = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When src prop changes (e.g. thumbnail clicked), reset and load new image
  useEffect(() => {
    isFallback.current = false;
    setImgSrc(src);
  }, [src]);

  // Catch images that already failed before React hydration attached onError
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth === 0 && !isFallback.current) {
      isFallback.current = true;
      setImgSrc(PLACEHOLDER);
    }
  }, [imgSrc]);

  function handleError() {
    if (isFallback.current) return;
    isFallback.current = true;
    setImgSrc(PLACEHOLDER);
  }

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}