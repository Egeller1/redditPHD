import type { ExperienceUnit, TopicPipelineContext } from '../../types/internal.js';
import {
  extractStructured,
  normText,
  type ThemeDiagnostics,
} from './keywordExtractor.js';
import { aggregateInsights } from '../aggregate/aggregate.js';

function excerptAround(text: string, needle: string, radius = 110): string {
  const t = text.replace(/\s+/g, ' ').trim();
  const i = normText(t).indexOf(normText(needle));
  if (i < 0) return t.slice(0, Math.min(radius * 2, t.length));
  const start = Math.max(0, i - radius);
  return t.slice(start, i + needle.length + radius).trim();
}

/**
 * Per-topic taxonomy diagnostics (stdout). Enable with TOPIC_TAXONOMY_DIAGNOSTICS=1.
 */
export function printTaxonomyDiagnostics(units: ExperienceUnit[], ctx: TopicPipelineContext): void {
  const rawPhraseSummary = new Map<string, { count: number; exampleUnitId: string; excerpt: string }>();
  const droppedByReason: Record<string, number> = {};

  for (const u of units) {
    const text = `${u.raw.title ?? ''}\n${u.raw.body}`;
    const diag: ThemeDiagnostics = { hits: [] };
    extractStructured(text, ctx, diag);
    for (const h of diag.hits) {
      if (h.dropped) {
        droppedByReason[h.dropped] = (droppedByReason[h.dropped] ?? 0) + 1;
        continue;
      }
      const key = `${h.layer}:${h.label}←${h.patternMatched}`;
      const cur = rawPhraseSummary.get(key);
      if (!cur) {
        rawPhraseSummary.set(key, {
          count: 1,
          exampleUnitId: u.id,
          excerpt: excerptAround(text, h.patternMatched),
        });
      } else {
        cur.count++;
      }
    }
  }

  const insights = aggregateInsights(units);
  const normalizedBenefits = insights.benefits.map((b) => ({ label: b.name, count: b.count }));
  const normalizedSides = insights.side_effects.map((s) => ({ label: s.name, count: s.count }));

  console.info(
    '[taxonomy-diagnostics]',
    JSON.stringify(
      {
        slug: ctx.slug,
        query_variants: ctx.queryVariants,
        raw_hits_aggregated: [...rawPhraseSummary.entries()]
          .map(([k, v]) => ({ key: k, unit_hits: v.count, example_id: v.exampleUnitId, excerpt: v.excerpt }))
          .sort((a, b) => b.unit_hits - a.unit_hits),
        dropped_hits: droppedByReason,
        normalized_benefits: normalizedBenefits,
        normalized_side_effects: normalizedSides,
      },
      null,
      2
    )
  );
}
