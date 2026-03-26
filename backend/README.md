# Reddit PhD — topic research API (v1)

Evidence-first backend: aggregates are computed only from retrieved Reddit JSON (posts for live v1) plus explicit pipeline steps. See `docs/FIELD_SOURCING.md` for the **top 10 weakest fields** vs Reddit JSON and safer alternatives.

## Run locally

```bash
cd backend
npm install
# Optional: CORPUS_DISABLED=1 for deterministic replay-only responses (no disk corpus merge)
REDDIT_MODE=replay npm run dev
```

- **Health:** `GET http://localhost:8787/health`
- **Topic bundle:** `GET http://localhost:8787/topics/by-slug/creatine`
- **Personalize (v1 no-op):** `POST http://localhost:8787/topics/creatine/personalize` with JSON `{ "age": 28, "sex": "male" }`
- **After changing code** — restart the dev server so HTTP responses match the latest pipeline (otherwise you may see stale JSON).

### Quality checks

```bash
# In-process bundle (no HTTP)
npm run verify:quality

# With server running on port 8787
npm run test:http
# optional: BASE_URL=http://127.0.0.1:8787 npm run test:http
```

### Environment

| Variable | Values | Default |
|----------|--------|---------|
| `REDDIT_MODE` | `fixture` \| `replay` \| `live` \| `cache` | `replay` |
| `CORPUS_DISABLED` | `1` skips `data/corpus/*.json` read/write | off |
| `CORPUS_DIAGNOSTICS` | `1` logs merge + counts per request (noisy) | off |
| `CORPUS_DIAGNOSTICS_SLUGS` | e.g. `creatine` enables logs for those slugs only | empty |
| `TARGET_ANALYZED_UNITS` | design target (informational in diagnostics) | `60` |
| `MAX_CANDIDATE_POSTS_PER_RUN` | live: stop after this many distinct posts | `200` |
| `MAX_THREADS_EXPAND_PER_RUN` | live: cap distinct `threadId` collected | `120` |
| `MAX_USABLE_UNITS_PER_RUN` | max raw units after filter/dedupe into scorer | `350` |
| `MAX_CORPUS_ENTRIES` | trim oldest posts when corpus exceeds this | `6000` |
| `REDDIT_SEARCH_LIMIT` | live `limit` per subreddit search request (≤100) | `55` |
| `LIVE_REQUEST_DELAY_MS` | pause between Reddit requests | `1100` |
| `LIVE_FALLBACK_ON_MISS` | `1`/`true` => unresolved replay/cache slugs attempt live before 404 | `true` |
| `MIN_LIVE_USABLE_UNITS` | minimum post-filter units required to return live bundle (else 404) | `1` |
| `SAMPLE_STRENGTH_LOW_BELOW` | `sample_strength=low` if analyzed count `<` this | `15` |
| `SAMPLE_STRENGTH_MEDIUM_BELOW` | `medium` if below this ( else `high`) | `45` |
| `REDDIT_USER_AGENT` | Unique string Reddit asks for | bundled placeholder (set in prod) |
| `PORT` | HTTP port | `8787` |

### Modes

- **`fixture`** — Serves precomputed `src/fixtures/:slug.bundle.json` (offline, deterministic).
- **`replay`** — Runs the full pipeline on `src/fixtures/:slug.replay.json` (replayable “live” data without calling Reddit). Unless `CORPUS_DISABLED=1`, merges into `data/corpus/:slug.json` so samples grow across runs.
- **`live`** — Same fixed subreddit universe; sequential search with caps (`MAX_CANDIDATE_POSTS_PER_RUN`, `REDDIT_SEARCH_LIMIT`, etc.). Merges into the topic corpus when enabled. Failed sub-queries log a warning and continue. If zero posts are fetched, falls back to the stored corpus (if any) with `data_quality.retrieval_mode` `cache`.
- **`cache`** — Serves from `data/corpus/:slug.json` only (no Reddit, no replay fixture read).

Regenerate deterministic `*.bundle.json` without touching disk corpus:

```bash
npm run emit:bundle -- creatine
```

Sample growth smoke (synthetic posts + corpus; prints before/after counters):

```bash
npm run demo:sample-growth
```

## Folder structure

```
backend/
  docs/
    FIELD_SOURCING.md       # Weak fields + Reddit vs pipeline
  scripts/
    emit-bundle.ts          # Writes fixtures/*.bundle.json from replay
  src/
    api/
      routes.ts               # GET /topics/by-slug/:slug, POST /topics/:slug/personalize
    config/
      lexicon.ts              # v1 keyword lists for extraction
      sampling.ts             # Retrieval caps + corpus toggles (env-driven)
      subreddits.ts           # Fixed universe
      thresholds.ts           # Min sample sizes for eligibility
    corpus/
      topicCorpus.ts          # Persisted raw units + provenance
    fixtures/
      creatine.replay.json    # Raw units for replay pipeline
      creatine.bundle.json    # Example API output (also used in fixture mode)
    pipeline/
      aggregate/aggregate.ts
      bundle/buildTopicBundle.ts
      consensus/buildConsensus.ts
      eligibility/metricEligibility.ts
      extraction/keywordExtractor.ts
      filters/                  # dedupe, low-value removal
      query/resolveTopic.ts
      reddit/                   # live search, replay loader, post mapping
      representatives/selectRepresentatives.ts
      scoring/heuristicScorer.ts # Scorer interface — swap implementation later
      units/buildExperienceUnits.ts
    services/topicService.ts
    types/
      topicBundle.ts            # **Public API contract (copy to frontend)**
      internal.ts               # ExperienceUnit, RawRedditUnit, etc.
    index.ts
```

## Experience score categories

Bucket assignment is in `src/pipeline/scoring/thresholds.ts`:

| Category | Score range |
|----------|-------------|
| negative | [0, 4.5) |
| neutral | [4.5, 6.5) |
| positive | [6.5, 10] |

Each response includes `data_quality` (`sample_strength`, `retrieval_mode`, `scoring_version`, `taxonomy_version`) for debugging and UI copy.

## Live-mode count interpretation (important)

In current v1 live retrieval we ingest **post search hits** only (not full comment-tree expansion). That means:

- `analyzed_unit_count` = number of post-derived usable units that survived filter + dedupe.
- `analyzed_thread_count` = distinct source thread ids among those units.
- Because each live candidate is currently one post per thread in the search collector, these two numbers are often equal or near-equal.
- `subreddit_count` reflects only subreddits represented in the final usable units. It can be narrow (even `1`) if early requests in one subreddit fill the thread/post caps before later subreddits are queried.

So patterns like `117 units`, `117 threads`, `1 subreddit` are usually a **composition artifact of current live retrieval strategy + caps**, not necessarily a counting bug.

## TypeScript contracts

- **Frontend response bundle:** `src/types/topicBundle.ts` — export everything the UI needs; keep in sync with the frontend or move to a shared package later.
- **Internal:** `src/types/internal.ts` — `RawRedditUnit`, `ExperienceUnit`, `Scorer`.

### Response highlights

- **`reddit_score`** — Reddit API vote total for the source post/comment (not the 0–10 experience score).
- **`experience_score_definition`** — Plain-language meaning of per-unit scores.
- **`low_data_warning`** — Set when the filtered corpus is small; surface in UI.
- **`distribution_stats`** — `null` when `metric_eligibility.distribution_stats.shown` is `false` (never return detailed bucket stats while hidden).

## Reddit JSON vs pipeline (short)

| Source | Examples |
|--------|----------|
| **Strong from Reddit JSON** | `permalink`, `created_utc`, `score` (as support), `author` (nullable), `subreddit`, post/comment body |
| **Pipeline-only** | Experience score 0–10, category buckets, insights lists, consensus text, confidence, distribution stats, representative selection |
| **Weak / optional** | `age`, `sex` on units (only if explicitly parsed from text); hide sections via `metric_eligibility` |

## Example JSON

See `src/fixtures/creatine.bundle.json` for a full response matching `GET /topics/by-slug/creatine` in `fixture` or `replay` mode after pipeline run.
