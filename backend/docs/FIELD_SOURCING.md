# Field sourcing: Reddit JSON vs pipeline vs weak spots

## Top 10 weakest / least defensible fields (from Reddit JSON alone)

These are the hardest to justify as “ground truth” without heavy caveats. Safer alternatives are listed for each.

### 1. `experience_posts[].age` and `experience_posts[].sex`

**Why weak:** Reddit’s official JSON does not include user age or gender. Values only appear when users **self-report in free text** (comments like “I’m 32 M”). Regex/NLP will miss most units, mis-parse formats, and hallucinate if tuned aggressively.

**Safer alternative:** Keep **nullable**; set only when `extraction.demographics.self_reported` passes conservative patterns; expose `demographic_confidence: 'extracted' | null` in internal schema (optional future API field). Never interpolate defaults.

### 2. `insights.benefits[]` / `insights.side_effects[]` (names and counts)

**Why weak:** Not in Reddit JSON. Requires **entity extraction** (lexicon + fuzzy match + optional LLM). Synonyms (“bloat” vs “water retention”) split counts; negation (“no headaches”) is easy to get wrong.

**Safer alternative:** Ship a **controlled taxonomy** per topic (or global supplement lexicon) with explicit `matched_span` / `match_method` internally; surface `confidence: high | medium | low` (already in contract). Prefer “mentioned in X% of units” over absolute medical claims.

### 3. `insights.protocols[]` / `insights.stacks[]`

**Why weak:** Same as benefits—purely extracted. “Protocol” is subjective; stacks are often informal (“took with beta alanine”).

**Safer alternative:** Normalize to **canonical strings** from a small allowlist where possible; cap list length; hide section when `metric_eligibility.protocols.shown === false`.

### 4. `consensus.summary_text`

**Why weak:** Fully **generated** (template + aggregates or LLM). Reddit provides no summary field for a topic.

**Safer alternative:** Prefix with scope: *“Based on N experience units from M threads in these subreddits…”*; avoid causal/medical language; keep summary strictly **descriptive of distributions** in v1.

### 5. `consensus.expected_score` and `consensus.confidence`

**Why weak:** Reddit gives **upvote `score`**, not “personal experience quality 0–10.” Our **experience score** is pipeline-defined. “Confidence” is inherently a model choice.

**Safer alternative:** Document that `expected_score` is **mean (or robust center) of unit-level experience scores**; `confidence` shrinks with N and variance (e.g. Wilson-style or empirical variance penalty)—never copy Reddit score as experience score.

### 6. `sentiment.positive_percent` / `neutral_percent` / `negative_percent`

**Why weak:** Sentiment is **not** Reddit’s labels—it is derived from **our** 0–10 buckets. Misleading if presented as “Reddit sentiment.”

**Safer alternative:** Label in copy (handled by frontend) as “experience sentiment distribution”; ensure percentages sum to 100 from the same scored set.

### 7. `distribution_stats` (per-category means and quantiles)

**Why weak:** Entirely derived from **our** scoring layer. Small **count** in a bucket makes p25/p75 unstable (e.g. 2 points).

**Safer alternative:** Require minimum bucket `count` before showing; hide via `metric_eligibility.distribution_stats` with explicit reason.

### 8. `representative_posts.positive` / `negative` (choice of “representative”)

**Why weak:** Reddit does not designate representatives. Selection is **algorithmic** (length, score, specificity heuristics). “Most upvoted negative experience” ≠ “worst medical outcome.”

**Safer alternative:** Treat as **illustrative excerpts**; prefer high `reddit_score` + minimum length; avoid superlatives in API copy; document selection rules in README.

### 9. `experience_posts[].excerpt`

**Why weak:** Must be **truncated/edited** from body. Risk of cutting mid-sentence or losing negation.

**Safer alternative:** Truncate on sentence boundaries where possible; max chars; never alter meaning (no paraphrase in v1 unless LLM with guardrails).

### 10. `topic.analyzed_unit_count` vs marketing-style “big data” claims

**Why weak:** If retrieval is shallow, counts are small. Inflating **thread** count by double-counting or listing duplicates breaks trust.

**Safer alternative:** Tie every count to **deduped IDs** and store `analyzed_thread_count` as distinct Reddit thread IDs (post `name` / permalink path). Expose exact integers only.

---

## Strong support from Reddit JSON (when not deleted)

| Field | Source |
|--------|--------|
| `url` | `permalink` + `https://reddit.com` prefix |
| `timestamp_utc` | `created_utc` → ISO string |
| `username` | `author` (nullable if `[deleted]`) |
| `reddit_score` | `score` on post/comment (nullable if hidden) |
| `subreddit` | `subreddit` or parsed from URL |
| Raw text | `selftext`, `title`, `body` |

## Pipeline-derived (explicitly not raw Reddit)

- `score` (0–10 experience score)
- `category` (from experience score)
- All `insights` lists and percentages
- `consensus` block (except tying N to real counts)
- `distribution_stats`
- `representative_posts` selection
- `metric_eligibility`

## Weak / optional — hide when unavailable

- `age`, `sex` on units
- Entire insight sections when N is low
- `distribution_stats` when bucket counts tiny
- `representative_posts` when no passing candidate in that polarity
