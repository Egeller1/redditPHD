import { FIXED_SUBREDDITS } from '../../config/subreddits.js';
import type { RawRedditUnit } from '../../types/internal.js';
import { SAMPLING } from '../../config/sampling.js';
import { mapPostToRaw, mapCommentToRaw, type RedditPostData, type RedditCommentData } from './mapListing.js';

const DEFAULT_UA =
  'reddit-phd-research/0.1 (local dev; contact: set REDDIT_USER_AGENT)';

function userAgent(): string {
  return process.env.REDDIT_USER_AGENT?.trim() || DEFAULT_UA;
}

interface ListingResponse {
  data?: {
    children?: { kind: string; data: RedditPostData }[];
  };
}

// Thread JSON is [postListing, commentsListing]
type ThreadResponse = [ListingResponse, ListingResponse];

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

async function redditFetch(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent(), Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status} for ${url}`);
  return res.json();
}

/** Search within a specific subreddit */
async function fetchSubSearch(sub: string, q: string, limit: number): Promise<RawRedditUnit[]> {
  const url = new URL(`https://www.reddit.com/r/${sub}/search.json`);
  url.searchParams.set('q', q);
  url.searchParams.set('restrict_sr', '1');
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('t', 'all');
  url.searchParams.set('limit', String(limit));

  const json = (await redditFetch(url.toString())) as ListingResponse;
  const children = json.data?.children ?? [];
  const out: RawRedditUnit[] = [];
  for (const c of children) {
    try { out.push(mapPostToRaw(c.data)); } catch { /* skip malformed */ }
  }
  return out;
}

/** Global Reddit search (all subreddits) */
async function fetchGlobalSearch(q: string, limit: number): Promise<RawRedditUnit[]> {
  const url = new URL('https://www.reddit.com/search.json');
  url.searchParams.set('q', q);
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('t', 'all');
  url.searchParams.set('limit', String(limit));

  const json = (await redditFetch(url.toString())) as ListingResponse;
  const children = json.data?.children ?? [];
  const out: RawRedditUnit[] = [];
  for (const c of children) {
    try { out.push(mapPostToRaw(c.data)); } catch { /* skip malformed */ }
  }
  return out;
}

/** Fetch top comments from a thread by post permalink */
async function fetchThreadComments(permalink: string, limit = 50): Promise<RawRedditUnit[]> {
  const url = new URL(`https://www.reddit.com${permalink}.json`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('sort', 'top');
  url.searchParams.set('depth', '1');

  const json = (await redditFetch(url.toString())) as ThreadResponse;
  const commentListing = json[1];
  const children = commentListing?.data?.children ?? [];
  const out: RawRedditUnit[] = [];
  for (const c of children) {
    if (c.kind !== 't1') continue; // only real comments (not "more" stubs)
    try {
      const mapped = mapCommentToRaw(c.data as unknown as RedditCommentData);
      if (mapped) out.push(mapped);
    } catch { /* skip malformed */ }
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

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Live retrieval: global search + per-subreddit search, then fetches comments
 * for every discovered thread.
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
  // Track post permalinks so we can fetch their comments later
  const postPermalinks: { permalink: string; threadId: string }[] = [];
  const merged: RawRedditUnit[] = [];
  let requestsAttempted = 0;
  let requestsSucceeded = 0;
  let requestsFailed = 0;
  let hitCapacityLimit = false;

  function addUnit(u: RawRedditUnit) {
    if (seenIds.has(u.name)) return;
    seenIds.add(u.name);
    if (u.kind === 'post' && !seenThreads.has(u.threadId)) {
      seenThreads.add(u.threadId);
      if (u.permalink) postPermalinks.push({ permalink: u.permalink, threadId: u.threadId });
    }
    merged.push(u);
  }

  // ── Phase 1: Global search (top query variant only to avoid spam) ──
  for (const q of queryVariants.slice(0, 2)) {
    if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) { hitCapacityLimit = true; break; }
    await delay(delayMs);
    requestsAttempted++;
    try {
      const batch = await fetchGlobalSearch(q, limitPerRequest);
      requestsSucceeded++;
      for (const u of batch) {
        if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) { hitCapacityLimit = true; break; }
        addUnit(u);
      }
    } catch (err) {
      requestsFailed++;
      console.warn(`[liveSearch] global q=${q.slice(0, 40)}`, err);
    }
  }

  // ── Phase 2: Per-subreddit search ──
  outer: for (const sub of FIXED_SUBREDDITS) {
    for (const q of queryVariants) {
      if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) {
        hitCapacityLimit = true;
        break outer;
      }
      await delay(delayMs);
      requestsAttempted++;
      try {
        const batch = await fetchSubSearch(sub, q, limitPerRequest);
        requestsSucceeded++;
        for (const u of batch) {
          if (atCapacity(merged, seenThreads, maxTotalPosts, maxThreads)) { hitCapacityLimit = true; break outer; }
          addUnit(u);
        }
      } catch (err) {
        requestsFailed++;
        console.warn(`[liveSearch] r/${sub} q=${q.slice(0, 40)}`, err);
      }
    }
  }

  // ── Phase 3: Fetch comments for each discovered thread ──
  // Cap at 60 threads to avoid excessive requests
  const threadsToExpand = postPermalinks.slice(0, 60);
  for (const { permalink } of threadsToExpand) {
    if (merged.length >= maxTotalPosts) break;
    await delay(delayMs);
    requestsAttempted++;
    try {
      const comments = await fetchThreadComments(permalink, 50);
      requestsSucceeded++;
      for (const c of comments) {
        if (merged.length >= maxTotalPosts) break;
        if (seenIds.has(c.name)) continue;
        seenIds.add(c.name);
        merged.push(c);
      }
    } catch (err) {
      requestsFailed++;
      console.warn(`[liveSearch] comments ${permalink.slice(0, 60)}`, err);
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
