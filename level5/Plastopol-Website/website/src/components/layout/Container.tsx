'use client';

import React from 'react';

interface ContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Container({
  children,
  className = '',
  maxWidth = 'lg',
}: ContainerProps) {
  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthStyles[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}