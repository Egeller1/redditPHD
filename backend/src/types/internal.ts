import type { ExperienceCategory, SexValue } from './topicBundle.js';

/** Raw retrieved row before scoring (post or comment) */
export interface RawRedditUnit {
  kind: 'post' | 'comment';
  id: string;
  /** Fullname e.g. t3_xxx or t1_xxx */
  name: string;
  threadId: string;
  subreddit: string;
  author: string | null;
  created_utc: number;
  score: number | null;
  permalink: string;
  title: string | null;
  body: string;
  /** Parent post id for comments; same as id for posts */
  link_id?: string;
}

export interface StructuredExtraction {
  stance: 'positive' | 'negative' | 'mixed' | 'unclear';
  benefitMentions: string[];
  sideEffectMentions: string[];
  protocolMentions: string[];
  stackMentions: string[];
  timeToEffectMentions: string[];
  repeatIntent: 'yes' | 'no' | 'unclear';
  firstHand: boolean;
  /** Heuristic: third-party / anecdote about others */
  hearsay: boolean;
  /** Only when explicitly self-reported in text */
  age: number | null;
  sex: SexValue | null;
}

export interface ExperienceUnit {
  id: string;
  raw: RawRedditUnit;
  excerpt: string;
  /** 0–10 experience score */
  experienceScore: number;
  category: ExperienceCategory;
  url: string;
  timestamp_utc: string;
  username: string | null;
  subreddit: string;
  /** Reddit API `score` (votes) for this post/comment, if present */
  reddit_score: number | null;
  extraction: StructuredExtraction;
}

export interface Scorer {
  score(unit: RawRedditUnit, extraction: StructuredExtraction): number;
}

export interface TopicPipelineContext {
  slug: string;
  displayName: string;
  queryVariants: string[];
}

export type RedditMode = 'live' | 'replay' | 'fixture' | 'cache';
