import type { RawRedditUnit } from '../../types/internal.js';

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
