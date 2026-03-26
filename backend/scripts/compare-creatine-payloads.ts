/**
 * Compare TopicBundle for creatine: direct backend vs Vite proxy.
 * Requires: backend on 8787; for proxy leg, Vite dev on 5173.
 *
 *   npx tsx scripts/compare-creatine-payloads.ts
 */
const DIRECT = process.env.DIRECT_URL || 'http://127.0.0.1:8787/topics/by-slug/creatine';
const PROXIED = process.env.PROXIED_URL || 'http://127.0.0.1:5173/api/topics/by-slug/creatine';

function collectHeaders(h: Headers): Record<string, string> {
  const o: Record<string, string> = {};
  h.forEach((v, k) => {
    o[k.toLowerCase()] = v;
  });
  return o;
}

function deepDiff(a: unknown, b: unknown, path = ''): string[] {
  if (a === b) return [];
  if (typeof a !== typeof b) {
    return [`${path || '$'}: types ${typeof a} vs ${typeof b}`];
  }
  if (a === null || b === null) {
    return a === b ? [] : [`${path || '$'}: null mismatch`];
  }
  if (typeof a !== 'object') {
    return a === b ? [] : [`${path || '$'}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`];
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  const out: string[] = [];
  for (const k of keys) {
    const p = path ? `${path}.${k}` : k;
    if (!(k in ao)) out.push(`${p}: missing in first object`);
    else if (!(k in bo)) out.push(`${p}: missing in second object`);
    else out.push(...deepDiff(ao[k], bo[k], p));
  }
  return out;
}

async function main() {
  const opt = { cache: 'no-store' as RequestCache };

  let directBody: string;
  let proxiedBody: string;
  const directH: Record<string, string> = {};
  const proxiedH: Record<string, string> = {};

  try {
    const r1 = await fetch(DIRECT, opt);
    directBody = await r1.text();
    Object.assign(directH, collectHeaders(r1.headers));
    console.log('DIRECT', DIRECT, 'status', r1.status);
  } catch (e) {
    console.error('Direct fetch failed:', e);
    process.exit(1);
  }

  try {
    const r2 = await fetch(PROXIED, opt);
    proxiedBody = await r2.text();
    Object.assign(proxiedH, collectHeaders(r2.headers));
    console.log('PROXIED', PROXIED, 'status', r2.status);
  } catch (e) {
    console.error('Proxied fetch failed (is Vite running on 5173?):', e);
    console.log('\n--- Direct body only (first 500 chars) ---\n', directBody.slice(0, 500));
    process.exit(2);
  }

  const identical = directBody === proxiedBody;
  console.log('\n=== JSON body identical? ===', identical);

  if (!identical) {
    let j1: unknown;
    let j2: unknown;
    try {
      j1 = JSON.parse(directBody);
      j2 = JSON.parse(proxiedBody);
    } catch {
      console.log('One response is not JSON — raw lengths', directBody.length, proxiedBody.length);
      process.exit(1);
    }
    const diffs = deepDiff(j1, j2);
    console.log('Field diffs (sample up to 40):');
    console.log(diffs.slice(0, 40).join('\n') || '(deep diff empty — whitespace?)');
  }

  console.log('\n=== Diagnostic headers (direct vs proxied) ===');
  const keys = new Set([...Object.keys(directH), ...Object.keys(proxiedH)]);
  for (const k of [...keys].filter((x) => x.startsWith('x-reddit-phd')).sort()) {
    console.log(k, '|', directH[k] ?? '—', '|', proxiedH[k] ?? '—');
  }

  if (directH['x-reddit-phd-corpus-disabled'] !== proxiedH['x-reddit-phd-corpus-disabled']) {
    console.warn('\nWARNING: corpus disabled flag differs — you may have two different backend processes or env.');
  }
  if (directH['x-reddit-phd-reddit-mode'] !== proxiedH['x-reddit-phd-reddit-mode']) {
    console.warn('\nWARNING: REDDIT_MODE header differs between calls.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
