/**
 * Normalize strings for API output: prefer stable, UTF-8-clean punctuation
 * (avoids mojibake like â€" when mis-decoded).
 */
export function normalizeDisplayText(s: string): string {
  return s
    .replace(/\u00A0/g, ' ')
    /** Em/en dashes often become mojibake (â€", etc.) in wrong encodings — use plain hyphens in API text */
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\s+/g, (m) => (m.includes('\n') ? m : ' '))
    .trim();
}

