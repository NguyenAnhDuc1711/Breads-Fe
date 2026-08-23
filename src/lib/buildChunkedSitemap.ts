import type { MetadataRoute } from "next";

/**
 * Generic helper for building a Next.js `generateSitemaps()`-based sub-sitemap
 * from a cursor-paginated backend endpoint.
 *
 * Shared by app/post-sitemap/sitemap.ts (Task 010) and the profile sitemap
 * (Task 011) — parameterize, do not fork this logic. See
 * `.ccpm/context/handoffs/010.md` for the exact Next.js route convention this
 * was built against and the caching behavior it relies on.
 */

export interface FetchPageResult<T> {
  data: T[];
  /** Cursor for the next page, or `null` when this is the last page. */
  nextCursor: string | null;
  /**
   * Total record count matching the filter. Only meaningful on the FIRST
   * page (cursor === null) — callers must return `null` on subsequent pages
   * per Task 002's contract (see handoffs/002.md).
   */
  totalCount: number | null;
}

export interface BuildChunkedSitemapParams<T> {
  /** Fetch one page of records, given the previous page's cursor (`null` for the first page). */
  fetchPage: (cursor: string | null) => Promise<FetchPageResult<T>>;
  /** Build the absolute URL for one item. */
  urlBuilder: (item: T) => string;
  /** Key on `T` holding the ISO date string used for `<lastmod>`. */
  lastModifiedField: keyof T;
  /** Max URLs per sub-sitemap. Google's hard cap is 50,000 — do not raise. */
  chunkSize?: number;
  baseUrl: string;
}

/**
 * Orchestrator fix (discovered live: `next build`'s static export runs
 * `getChunk(id)` for every id `generateSitemaps()` returned concurrently —
 * late chunks (which must walk many preceding pages, see `fetchChunk`) add
 * up across that concurrency and can still trip `sitemapListLimiter` even
 * after removing the `generateSitemaps()` full-walk and adding per-page
 * pacing. Rather than guess a pacing/concurrency number that keeps needing
 * retuning as the dataset or Next's own build parallelism changes, retry
 * 429s with backoff — this is correct regardless of *why* the limit was
 * hit, matches standard client behavior for a rate-limited API, and the
 * route is a background/build-time job where a few extra seconds of retry
 * delay is free (unlike user-facing request latency).
 */
async function fetchPageWithRetry<T>(
  fetchPage: (cursor: string | null) => Promise<FetchPageResult<T>>,
  cursor: string | null,
  attempt = 0,
): Promise<FetchPageResult<T>> {
  const maxAttempts = 6;
  try {
    return await fetchPage(cursor);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isRateLimited = message.includes("429");
    if (!isRateLimited || attempt >= maxAttempts - 1) {
      throw err;
    }
    const delayMs = 500 * 2 ** attempt; // 500ms, 1s, 2s, 4s, 8s, 16s
    console.warn(
      `[buildChunkedSitemap] rate-limited (429), retrying in ${delayMs}ms ` +
        `(attempt ${attempt + 1}/${maxAttempts})`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchPageWithRetry(fetchPage, cursor, attempt + 1);
  }
}

/**
 * Fetches ONLY the first page (limit irrelevant — we only read `totalCount`)
 * to compute how many chunks exist. Does NOT walk the full dataset.
 *
 * Orchestrator fix (discovered live during Task 090 verification): the
 * original design called a full-dataset walk (`fetchAllChunks`, see below)
 * just to COUNT chunks — for ~961K records that's ~961 sequential requests,
 * which (a) trips per-minute rate limiters almost immediately regardless of
 * their `max`, since the whole walk finishes in well under 60s, and (b) blew
 * past Next.js's own 60-second "collecting page data" build timeout,
 * crashing the build outright (a harder failure than the 429s alone — no
 * try/catch inside this function can stop Next's external SIGTERM kill of a
 * timed-out worker). Chunk COUNT only needs `totalCount`, already returned
 * on every backend response's first page (Task 002/003 contract) — one
 * lightweight request replaces ~961.
 */
async function countChunks<T>({
  fetchPage,
  chunkSize,
}: Pick<BuildChunkedSitemapParams<T>, "fetchPage" | "chunkSize">): Promise<number> {
  const size = chunkSize ?? 50000;
  const page = await fetchPageWithRetry(fetchPage, null);
  const totalCount = page.totalCount ?? 0;
  return Math.max(1, Math.ceil(totalCount / size));
  // Math.max(1, ...) so an empty/zero dataset still gets exactly 1 (empty)
  // chunk rather than zero chunks — keeps getChunk(0) well-defined instead
  // of every id looking like "shrank away" (see getChunk's comment below).
}

/**
 * Walks `fetchPage` sequentially starting from the beginning, discarding
 * pages that fall before chunk `targetId`'s range, then collects exactly
 * that chunk's records and stops — does NOT continue walking past it.
 *
 * Residual limitation (documented, not fixed here — flagged for Task 090 /
 * future backend work): because Task 002/003's endpoint is cursor-only (no
 * skip/offset param), reaching a LATE chunk (e.g. id=19 of ~20) still
 * requires walking every preceding page first — there is no way to "jump"
 * to a chunk's start. Early chunks (especially id=0, the most commonly hit)
 * are fast; the last chunk of a large dataset could still take a while to
 * regenerate on its `revalidate` window. A future improvement would add a
 * skip-based or index-based windowing param to the backend endpoint so this
 * function can seek directly instead of walking. Out of scope to change the
 * backend contract mid-verification for this epic.
 *
 * CRITICAL (epic seo-sitemap-schema plan-review FAIL-1): if the walk runs
 * out of pages (`nextCursor === null`) strictly before reaching this chunk's
 * expected start position, that's ambiguous between "dataset shrank
 * naturally since generateSitemaps() last counted" (not an error) and "the
 * backend undercounted" (a real bug) — we can't distinguish those without a
 * full re-walk, so per FAIL-1's spirit we do NOT silently pretend nothing's
 * wrong: return an empty-but-valid sitemap for this chunk (never throw at
 * request time — a request-time throw would 500 real crawler traffic) but
 * log loudly so it's visible in server logs either way.
 */
async function fetchChunk<T>({
  fetchPage,
  chunkSize,
  targetId,
}: Pick<BuildChunkedSitemapParams<T>, "fetchPage" | "chunkSize"> & {
  targetId: number;
}): Promise<T[]> {
  const size = chunkSize ?? 50000;
  const skipRecords = targetId * size;

  let cursor: string | null = null;
  let seen = 0;
  const collected: T[] = [];

  for (;;) {
    const page = await fetchPageWithRetry(fetchPage, cursor);

    for (const item of page.data) {
      if (seen >= skipRecords && collected.length < size) {
        collected.push(item);
      }
      seen++;
      if (collected.length >= size) {
        return collected;
      }
    }

    cursor = page.nextCursor;
    if (cursor === null) {
      if (collected.length === 0 && seen <= skipRecords) {
        console.warn(
          `[buildChunkedSitemap] chunk ${targetId} requested but the dataset ` +
            `ran out (${seen} record(s) seen, needed to reach index ${skipRecords}) ` +
            `before reaching it — either the dataset shrank since generateSitemaps() ` +
            `last counted (natural churn, not a bug) or the backend undercounted ` +
            `(see FAIL-1). Serving an empty sitemap for this chunk rather than 500ing ` +
            `real crawler traffic.`,
        );
      }
      return collected;
    }
  }
}

export function buildChunkedSitemap<T>({
  fetchPage,
  urlBuilder,
  lastModifiedField,
  chunkSize,
}: BuildChunkedSitemapParams<T>) {
  async function generateSitemaps(): Promise<{ id: number }[]> {
    // Orchestrator fix (discovered right after Task 010 closed, then again
    // during live Task 090 testing): Next.js calls generateSitemaps() during
    // `next build`'s static-param collection, so an unreachable/misconfigured
    // backend at BUILD time (missing SITEMAP_SHARED_SECRET, backend down, no
    // live backend in CI, or — the original bug here — a slow/rate-limited
    // request) crashed the ENTIRE production build, not just this route.
    // Now that this only makes ONE lightweight request (see countChunks），
    // this try/catch mainly guards against the backend being fully
    // unreachable/down at build time, not against timeout/rate-limit churn.
    // getChunk() below deliberately does NOT throw at request time on a
    // similar failure (would 500 real crawler traffic) — this function
    // returning empty is the build-time-only equivalent of that same call.
    try {
      const numChunks = await countChunks({ fetchPage, chunkSize });
      return Array.from({ length: numChunks }, (_, id) => ({ id }));
    } catch (err) {
      console.warn(
        "[buildChunkedSitemap] generateSitemaps() failed at build/collection time " +
          "(backend unreachable or misconfigured) — returning zero static params so " +
          "`next build` can complete instead of crashing the whole build. This relies " +
          "on Next's default `dynamicParams: true` (not overridden by this route) so " +
          "an actual request to a chunk URL at runtime still generates on-demand once " +
          "the backend is reachable, rather than 404ing. Underlying error:",
        err,
      );
      return [];
    }
  }

  async function getChunk(id: number): Promise<MetadataRoute.Sitemap> {
    const chunk = await fetchChunk({ fetchPage, chunkSize, targetId: id });
    return chunk.map((item) => ({
      url: urlBuilder(item),
      lastModified: new Date(item[lastModifiedField] as unknown as string),
    }));
  }

  return { generateSitemaps, getChunk };
}
