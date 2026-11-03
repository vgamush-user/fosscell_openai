// src/lib/slugify.ts

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateUniqueSlug(
  name: string,
  existingSlugs: string[]
): string {
  const baseSlug = slugify(name);

  // If no conflict → return immediately
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  // Keep incrementing until unique
  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}
