/**
 * Common misspellings → correct slug. Applied before any processing.
 * Handles phonetic errors, autocorrect variants, and abbreviated forms.
 */
const SLUG_CORRECTIONS: Record<string, string> = {
  // Ginkgo Biloba
  'ginko-balboa': 'ginkgo-biloba',
  'ginko-biloba': 'ginkgo-biloba',
  'gingko-balboa': 'ginkgo-biloba',
  'ginkgo-balboa': 'ginkgo-biloba',
  'ginko': 'ginkgo-biloba',
  'gingko': 'ginkgo-biloba',
  // Ashwagandha
  'ashwaganda': 'ashwagandha',
  'ashwaganha': 'ashwagandha',
  'aswagandha': 'ashwagandha',
  // Berberine
  'berbrine': 'berberine',
  'beberine': 'berberine',
  // Turmeric / Curcumin
  'tumeric': 'turmeric',
  'curcimin': 'curcumin',
  // Melatonin
  'melotonin': 'melatonin',
  'melantonin': 'melatonin',
  // Rhodiola
  'rodiola': 'rhodiola',
  'rhodiola-rosea': 'rhodiola',
  // NAC
  'n-acetyl-cysteine': 'nac',
  // Lion's Mane
  'lions-mane': "lion's-mane",
  'lions-mane-mushroom': "lion's-mane",
  // Magnesium Glycinate
  'magnesium-glysinate': 'magnesium-glycinate',
  // Intermittent Fasting
  'intermittent-fasting': 'intermittent-fasting',
  'if-diet': 'intermittent-fasting',
  // Creatine
  'createine': 'creatine',
  'cretine': 'creatine',
};

export function correctSlug(slug: string): string {
  return SLUG_CORRECTIONS[slug.toLowerCase()] ?? slug;
}

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
  const hyphenated = slug.trim().toLowerCase();
  // Always include both space-separated and hyphen-separated forms for multi-word slugs
  const variants = base === hyphenated ? [base] : [base, hyphenated];
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
  if (base === 'l theanine') {
    variants.push('theanine');
  }
  if (base === 'lion s mane') {
    variants.push("lion's mane", 'lions mane', 'hericium');
  }
  if (base === 'ginkgo biloba') {
    variants.push('ginkgo', 'gingko');
  }
  if (base === 'rhodiola') {
    variants.push('rhodiola rosea');
  }
  if (base === 'nac') {
    variants.push('n-acetyl cysteine', 'n acetyl cysteine');
  }
  if (base === 'magnesium glycinate') {
    variants.push('magnesium bisglycinate', 'mag glycinate');
  }
  if (base === 'vitamin d') {
    variants.push('vitamin d3', 'cholecalciferol');
  }
  if (base === 'vitamin c') {
    variants.push('ascorbic acid');
  }
  if (base === 'omega 3') {
    variants.push('omega-3', 'fish oil', 'dha', 'epa');
  }
  return [...new Set(variants.map((v) => v.trim()).filter(Boolean))];
}
