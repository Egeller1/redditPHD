import type { ExperienceUnit, RawRedditUnit, Scorer, TopicPipelineContext } from '../../types/internal.js';
import { extractStructured } from '../extraction/keywordExtractor.js';
import { scoreToCategory } from '../scoring/heuristicScorer.js';
import { THRESHOLDS } from '../../config/thresholds.js';
import { normalizeDisplayText } from '../text/displayText.js';

export function toRedditUrl(permalink: string): string {
  const p = permalink.startsWith('/') ? permalink : `/${permalink}`;
  return `https://www.reddit.com${p}`;
}

export function makeExcerpt(body: string, max = 280): string {
  const t = body.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

/** Prefer body when it carries the substance; avoids title+body duplication in dot-plot excerpts */
export function composeExperienceExcerpt(raw: RawRedditUnit, max = 280): string {
  const body = raw.body.trim();
  const title = (raw.title ?? '').trim();
  if (body.length >= 80) return makeExcerpt(body, max);
  if (title && body) return makeExcerpt(`${title} ${body}`, max);
  return makeExcerpt(body || title, max);
}

/** Representative cards: body-only when long enough to avoid repeating the title at the end */
export function buildRepresentativeExcerpt(raw: RawRedditUnit, max = 400): string {
  const body = raw.body.trim();
  if (body.length >= 60) return makeExcerpt(body, max);
  const title = (raw.title ?? '').trim();
  if (title && body) return makeExcerpt(`${title}. ${body}`, max);
  return makeExcerpt(body || title, max);
}

export function buildExperienceUnits(
  raw: RawRedditUnit[],
  scorer: Scorer,
  topic: TopicPipelineContext
): ExperienceUnit[] {
  const units: ExperienceUnit[] = [];
  for (const r of raw) {
    const text = `${r.title ?? ''}\n${r.body}`;
    const extraction = extractStructured(text, topic);
    const experienceScore = scorer.score(r, extraction);
    const category = scoreToCategory(experienceScore);
    const timestamp_utc = new Date(r.created_utc * 1000).toISOString();
    units.push({
      id: r.name,
      raw: r,
      excerpt: normalizeDisplayText(composeExperienceExcerpt(r)),
      experienceScore,
      category,
      url: toRedditUrl(r.permalink),
      timestamp_utc,
      username: r.author,
      subreddit: r.subreddit,
      reddit_score: r.score,
      extraction,
    });
  }
  units.sort((a, b) => b.raw.created_utc - a.raw.created_utc);
  return units.slice(0, THRESHOLDS.maxExperiencePosts);
}
