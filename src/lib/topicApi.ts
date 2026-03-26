import type { PersonalizeRequest, PersonalizeResponse, TopicBundle } from '@/types/topicBundle';

function apiBase(): string {
  const v = import.meta.env.VITE_API_URL as string | undefined;
  if (v?.trim()) return v.replace(/\/$/, '');
  return '';
}

export type TopicBundleFetchMeta = {
  requestUrl: string;
  fetchMode: 'same-origin-proxy' | 'absolute-api';
  viteApiUrl: string | undefined;
  status: number;
  /** Normalized header names (lowercase keys) for stable logging */
  responseHeaders: Record<string, string>;
};

/**
 * Same-origin `/api` when using Vite proxy; else full URL from `VITE_API_URL`.
 * Uses `cache: 'no-store'` so the browser does not serve a cached TopicBundle.
 */
export async function fetchTopicBundle(
  slug: string
): Promise<{ bundle: TopicBundle; meta: TopicBundleFetchMeta }> {
  const path = `/topics/by-slug/${encodeURIComponent(slug)}`;
  const base = apiBase();
  const url = base ? `${base}${path}` : `/api${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key.toLowerCase()] = value;
  });
  if (res.status === 404) {
    throw new Error('Topic not found or no data in current mode');
  }
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  const bundle = (await res.json()) as TopicBundle;
  return {
    bundle,
    meta: {
      requestUrl: url,
      fetchMode: base ? 'absolute-api' : 'same-origin-proxy',
      viteApiUrl: import.meta.env.VITE_API_URL as string | undefined,
      status: res.status,
      responseHeaders,
    },
  };
}

export async function personalizeTopicBundle(
  slug: string,
  body: PersonalizeRequest
): Promise<PersonalizeResponse> {
  const path = `/topics/${encodeURIComponent(slug)}/personalize`;
  const base = apiBase();
  const url = base ? `${base}${path}` : `/api${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Personalize API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  return (await res.json()) as PersonalizeResponse;
}
