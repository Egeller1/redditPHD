import type { RawRedditUnit } from '../../types/internal.js';

/** Reddit listing `data` for a comment */
export interface RedditCommentData {
  id: string;
  name: string;
  subreddit: string;
  author: string;
  body?: string;
  created_utc: number;
  score: number;
  link_id: string; // t3_xxx — parent post
  permalink: string;
}

export function mapCommentToRaw(data: RedditCommentData): RawRedditUnit | null {
  const body = data.body?.trim() ?? '';
  if (!body || body === '[deleted]' || body === '[removed]') return null;
  const postId = data.link_id?.replace(/^t3_/, '') ?? data.id;
  return {
    kind: 'comment',
    id: data.id,
    name: data.name,
    threadId: `t3_${postId}`,
    subreddit: data.subreddit,
    author: data.author === '[deleted]' ? null : data.author,
    created_utc: data.created_utc,
    score: typeof data.score === 'number' ? data.score : null,
    permalink: data.permalink,
    title: '',
    body,
  };
}

/** Reddit listing `data` for a link (post) */
export interface RedditPostData {
  id: string;
  name: string;
  subreddit: string;
  author: string;
  selftext?: string;
  title: string;
  created_utc: number;
  score: number;
  permalink: string;
}

export function mapPostToRaw(data: RedditPostData): RawRedditUnit {
  const body = (data.selftext?.trim() || data.title || '').trim();
  return {
    kind: 'post',
    id: data.id,
    name: data.name,
    threadId: data.name,
    subreddit: data.subreddit,
    author: data.author === '[deleted]' ? null : data.author,
    created_utc: data.created_utc,
    score: typeof data.score === 'number' ? data.score : null,
    permalink: data.permalink,
    title: data.title,
    body,
  };
}
