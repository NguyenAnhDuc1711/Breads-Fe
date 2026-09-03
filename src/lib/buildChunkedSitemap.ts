import type { MetadataRoute } from "next";

export interface FetchPageResult<T> {
  data: T[];
  nextCursor: string | null;
  totalCount: number | null;
}

export interface BuildChunkedSitemapParams<T> {
  fetchPage: (cursor: string | null) => Promise<FetchPageResult<T>>;
  urlBuilder: (item: T) => string;
  lastModifiedField: keyof T;
  chunkSize?: number;
  baseUrl: string;
}

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
    const delayMs = 500 * 2 ** attempt;
    console.warn(
      `[buildChunkedSitemap] rate-limited (429), retrying in ${delayMs}ms ` +
        `(attempt ${attempt + 1}/${maxAttempts})`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchPageWithRetry(fetchPage, cursor, attempt + 1);
  }
}

async function countChunks<T>({
  fetchPage,
  chunkSize,
}: Pick<BuildChunkedSitemapParams<T>, "fetchPage" | "chunkSize">): Promise<number> {
  const size = chunkSize ?? 50000;
  const page = await fetchPageWithRetry(fetchPage, null);
  const totalCount = page.totalCount ?? 0;
  return Math.max(1, Math.ceil(totalCount / size));
}

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
