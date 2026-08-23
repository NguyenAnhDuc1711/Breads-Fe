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
 * Pages through `fetchPage` sequentially (never holds more than one page in
 * flight), grouping records into `chunkSize`-sized chunks. After the last
 * page (`nextCursor === null`), compares the running fetched count against
 * `totalCount` from the first page.
 *
 * CRITICAL (epic seo-sitemap-schema plan-review FAIL-1): a mismatch means the
 * backend silently returned fewer eligible records than it counted — e.g. a
 * filter bug. We must NOT serve a sitemap missing URLs silently: log loudly
 * and throw so the build/request fails instead of shipping bad data to
 * search engines.
 */
async function fetchAllChunks<T>({
  fetchPage,
  chunkSize,
}: Pick<BuildChunkedSitemapParams<T>, "fetchPage" | "chunkSize">): Promise<
  T[][]
> {
  const chunks: T[][] = [];
  let currentChunk: T[] = [];
  let cursor: string | null = null;
  let totalCount: number | null = null;
  let fetchedCount = 0;
  let isFirstPage = true;
  const size = chunkSize ?? 50000;

  // Loop terminates on nextCursor === null (NOT data.length === 0 — Task
  // 002's contract has an edge case where a page can be empty with
  // nextCursor already null, but a page could theoretically also be empty
  // with more pages left; nextCursor is the only reliable stop condition).
  for (;;) {
    const page = await fetchPage(cursor);

    if (isFirstPage) {
      totalCount = page.totalCount;
      isFirstPage = false;
    }

    for (const item of page.data) {
      currentChunk.push(item);
      fetchedCount++;
      if (currentChunk.length >= size) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }

    cursor = page.nextCursor;
    if (cursor === null) break;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  if (totalCount !== null && fetchedCount !== totalCount) {
    const message =
      `[buildChunkedSitemap] totalCount mismatch: fetched ${fetchedCount} record(s) ` +
      `but backend reported totalCount=${totalCount}. Refusing to serve an ` +
      `incomplete sitemap silently (see FAIL-1, epic seo-sitemap-schema plan-review). ` +
      `Likely causes: a filter bug on the backend, or a race between the ` +
      `count and the paginated fetch.`;
    console.error(message);
    throw new Error(message);
  }

  return chunks;
}

export function buildChunkedSitemap<T>({
  fetchPage,
  urlBuilder,
  lastModifiedField,
  chunkSize,
}: BuildChunkedSitemapParams<T>) {
  async function generateSitemaps(): Promise<{ id: number }[]> {
    // Orchestrator fix (discovered right after Task 010 closed): Next.js calls
    // generateSitemaps() during `next build`'s static-param collection, so an
    // unreachable/misconfigured backend at BUILD time (missing
    // SITEMAP_SHARED_SECRET, backend down, wrong port, CI with no live
    // backend at all) crashed the ENTIRE production build, not just this
    // route — confirmed by reproducing a real `npm run build` failure.
    // getChunk() below deliberately keeps the strict FAIL-1 throw (a failure
    // there only 500s that one request, at runtime, when it should be loud);
    // this function degrades instead, since a build-time failure here has a
    // much larger blast radius than the problem it would be protecting against.
    try {
      const chunks = await fetchAllChunks({ fetchPage, chunkSize });
      return chunks.map((_, id) => ({ id }));
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
    const chunks = await fetchAllChunks({ fetchPage, chunkSize });
    const chunk = chunks[id];
    // A chunk can legitimately disappear between the generateSitemaps() call
    // and this call if the eligible-record count shrank in between (natural
    // data churn, not a data-loss bug — that case is caught above via the
    // totalCount guard within a single traversal). Serve an empty-but-valid
    // sitemap rather than throwing.
    if (!chunk) return [];

    return chunk.map((item) => ({
      url: urlBuilder(item),
      lastModified: new Date(item[lastModifiedField] as unknown as string),
    }));
  }

  return { generateSitemaps, getChunk };
}
