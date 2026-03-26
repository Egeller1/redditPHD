export function slugToDisplayName(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Search strings used against Reddit search (within fixed subs) */
export function expandQueryVariants(slug: string): string[] {
  const base = slug.replace(/-/g, ' ').trim().toLowerCase();
  const variants = [base];
  if (base === 'creatine') {
    variants.push('creatine monohydrate');
  }
  if (base === 'ashwagandha') {
    variants.push('ashwagandha ksm-66', 'withania');
  }
  if (base === 'caffeine') {
    variants.push('coffee', 'espresso');
  }
  if (base === 'intermittent fasting') {
    variants.push('16:8', 'omad', 'eating window');
  }
  if (base === 'cold showers') {
    variants.push('cold shower', 'cold exposure', 'ice bath');
  }
  return [...new Set(variants.map((v) => v.trim()).filter(Boolean))];
}
