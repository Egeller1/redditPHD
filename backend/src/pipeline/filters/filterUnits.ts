import type { RawRedditUnit } from '../../types/internal.js';
import { isBotOrDeletedAuthor } from '../extraction/keywordExtractor.js';

const REMOVED = new Set(['[removed]', '[deleted]', '']);

export function bodyIsLowValue(body: string): boolean {
  const t = body.trim();
  if (t.length < 40) return true;
  if (REMOVED.has(t.toLowerCase())) return true;
  return false;
}

export function isDeletedOrRemoved(unit: RawRedditUnit): boolean {
  const b = unit.body.trim().toLowerCase();
  return REMOVED.has(b) || unit.author === null || isBotOrDeletedAuthor(unit.author);
}

export function filterRawUnits(units: RawRedditUnit[], topicKeywords?: string[]): RawRedditUnit[] {
  return units.filter((u) => {
    if (isDeletedOrRemoved(u)) return false;
    if (bodyIsLowValue(u.body)) return false;
    if (topicKeywords?.length) {
      const haystack = `${u.title ?? ''} ${u.body}`.toLowerCase();
      if (!topicKeywords.some((kw) => haystack.includes(kw.toLowerCase()))) return false;
    }
    return true;
  });
}
