// src/lib/constants.ts

import { Category } from "@/types";

// Categories used across the app — single source of truth
export const CATEGORIES: Category[] = [
  "office",
  "dining",
  "lounge",
  "outdoor",
  "other",
];

// Default catalog filters
export const DEFAULT_FILTERS = {
  category: undefined,
  colors: [],
  inStock: undefined,
};

// Image path settings used by CMS and components
export const IMAGE_CONFIG = {
  folder: "/images/",
  extension: ".jpg",
  padLength: 3, // zero-padded: 001, 002...
};

// App-level settings
export const APP_CONFIG = {
  siteName: "Plastopol",
};
