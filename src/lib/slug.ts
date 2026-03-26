/** URL/query → API slug (matches backend `getTopicBySlug` normalization-friendly file keys). */
export function queryParamToSlug(raw: string): string {
  return decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
