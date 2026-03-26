import { FIXED_SUBREDDITS } from '../../config/subreddits.js';
import type { RawRedditUnit } from '../../types/internal.js';
import { SAMPLING } from '../../config/sampling.js';
import { mapPostToRaw, type RedditPostData } from './mapListing.js';

const DEFAULT_UA =
  'reddit-phd-research/0.1 (local dev; contact: set REDDIT_USER_AGENT)';

function userAgent(): string {
  return process.env.REDDIT_USER_AGENT?.trim() || DEFAULT_UA;
}

interface ListingResponse {
  data?: {
    children?: { data: RedditPostData }[];
  };
}

export interface LiveSearchOptions {
  limitPerRequest?: number;
  maxTotalPosts?: number;
  maxThreads?: number;
  delayMs?: number;
}

export interface LiveSearchDiagnostics {
  query_variants: string[];
  subreddits_searched: string[];
  requests_attempted: number;
  requests_succeeded: number;
  requests_failed: number;
  candidate_posts_found: number;
  unique_threads_found: number;
  hit_capacity_limit: boolean;
}

async function fetchSubSearch(sub: string, q: string, limit: number): Promise<RawRedditUnit[]> {
  const url = new URL(`https://www.reddit.com/r/${sub}/search.json`);
  url.searchParams.set('q', q);
  url.searchParams.set('restrict_sr', '1');
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('t', 'all');
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': userAgent(),
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Reddit HTTP ${res.status} for r/${sub} q=${q}`);
  }

  const json = (await res.json()) as ListingResponse;
  const children = json.data?.children ?? [];
  const out: RawRedditUnit[] = [];
  for (const c of children) {
    try {
      out.push(mapPostToRaw(c.data));
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

function atCapacity(
  merged: RawRedditUnit[],
  seenThreads: Set<string>,
  maxTotal: number,
  maxThreads: number
): boolean {
  if (merged.length >= maxTotal) return true;
  if (seenThreads.size >= maxThreads) return true;
  return false;
}

/**
 * v1 live retrieval: subreddit search hits (posts only). Sequential requests to
 * avoid rate limits; caps prevent runaway fan-out.
 */
export async function retrieveLiveCandidates(
  queryVariants: string[],
  options?: LiveSearchOptions
): Promise<RawRedditUnit[]> {
  const { candidates } = await retrieveLiveCandidatesDetailed(queryVariants, options);
  return candidates;
}

export async function retrieveLiveCandidatesDetailed(
  queryVariants: string[],
  options?: LiveSearchOptions
): Promise<{ candidates: RawRedditUnit[]; diagnostics: LiveSearchDiagnostics }> {
  const limitPerRequest =
    options?.limitPerRequest ?? SAMPLING.redditSearchLimitPerRequest;
  const maxTotalPosts = options?.maxTotalPosts ?? SAMPLING.maxCandidatePostsPerRun;
  const maxThreads = options?.maxThreads ?? SAMPLING.maxThreadsExpandPerRun;
  const delayMs = options?.delayMs ?? SAMPLING.liveRequestDelayMs;

  const seenIds = new Set<string>();
  const seenThreads = new Set<string>();
  const merged: RawRedditUnit[] = [];
  let requestsAttempted = 0;
  let requestsSucceeded = 0;
  let requestsFailed = 0;
  let hitCapacityLimit = false;

  outer: for (const sub of FIXED_SUBREDDITS) {
    for (const q of queryVariants) {
      if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) {
        hitCapacityLimit = true;
        break outer;
      }

      await new Promise((r) => setTimeout(r, delayMs));
      let batch: RawRedditUnit[];
      requestsAttempted++;
      try {
        batch = await fetchSubSearch(sub, q, limitPerRequest);
        requestsSucceeded++;
      } catch (err) {
        requestsFailed++;
        console.warn(`[liveSearch] r/${sub} q=${q.slice(0, 40)}`, err);
        continue;
      }

      for (const u of batch) {
        if (seenIds.has(u.name)) continue;
        if (seenThreads.has(u.threadId)) continue;
        if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) {
          hitCapacityLimit = true;
          break outer;
        }

        seenIds.add(u.name);
        seenThreads.add(u.threadId);
        merged.push(u);
      }
    }
  }

  return {
    candidates: merged,
    diagnostics: {
      query_variants: [...queryVariants],
      subreddits_searched: [...FIXED_SUBREDDITS],
      requests_attempted: requestsAttempted,
      requests_succeeded: requestsSucceeded,
      requests_failed: requestsFailed,
      candidate_posts_found: merged.length,
      unique_threads_found: seenThreads.size,
      hit_capacity_limit: hitCapacityLimit,
    },
  };
}
