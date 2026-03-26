# Taxonomy / extraction audit (v2)

## Where benefits and side-effect labels are assigned

1. **`src/pipeline/extraction/keywordExtractor.ts` — `extractStructured(text, ctx)`**
   - **Layer 1 (generic):** stance from `POSITIVE_SENTIMENT_TERMS` / `NEGATIVE_SENTIMENT_TERMS` (global phrase lists).
   - **Layer 2 (themes):** substring match against signals in `src/config/lexicon.ts`, then **topic gates** (`fitnessGated`, `creatineWeightSignal`, `creatineContext`), plus **`src/config/topicExtraSignals.ts`** rows keyed by slug.

2. **`src/pipeline/aggregate/aggregate.ts` — `aggregateInsights`**
   - Counts distinct units / threads per **final** label string on `ExperienceUnit.extraction`.
   - Applies **`minThemeUnitSupport`** so rare labels drop out of the API list.

3. **`src/pipeline/units/buildExperienceUnits.ts`**
   - Builds each `ExperienceUnit` by calling `extractStructured` with **`TopicPipelineContext`** (`slug`, `displayName`, `queryVariants`).

## Global vs topic-specific

| Source | Scope |
|--------|--------|
| `BENEFIT_SIGNALS`, `SIDE_EFFECT_SIGNALS`, `PROTOCOL_SIGNALS`, `STACK_SIGNALS` | **Global** patterns; several rows are **gated** (fitness, creatine weight, creatine protocol). |
| `TOPIC_EXTRA_BENEFITS`, `TOPIC_EXTRA_SIDES` | **Topic-specific** (slug key). |
| `POSITIVE_SENTIMENT_TERMS` / `NEGATIVE_SENTIMENT_TERMS` | **Global** (scoring stance only). |
| `expandQueryVariants` | Fe Reddit search + carries **query context** into the pipeline context object. |

## Why “Heavier lifts / PRs” leaked into unrelated topics

The old `BENEFIT_SIGNALS` row for that label included the substring **`performance`**. Many unrelated posts use “performance” (work performance, sleep performance, etc.), and matching was a naive **`includes()`** on normalized text, with **no topic or domain gate**. That single pattern inflated the PR label across searches.

## Fixes (v2.2)

- Removed **`performance`** from the PR / lifting bucket; tightened patterns and require **fitness gate** unless the topic is in `FITNESS_FIRST_SLUGS` or the text has a **lifting anchor** (`hasFitnessAnchor`).
- **Water retention** suppressed unless creatine topic or `creatine` appears in text.
- **Creatine dosing / loading** protocol rows require creatine context.
- **Topic extras** add cold / IF / caffeine / ashwagandha phrasing without widening the global lifting lexicon.

See `TOPIC_TAXONOMY_DIAGNOSTICS=1` for per-run hit traces.
