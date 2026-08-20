import { cookies } from "next/headers";
import { API_PREFIX, POST_PATH, Route } from "../../src/Breads-Shared/APIConfig";
import { IPost } from "../../src/store/PostSlice";

// Server-side equivalent of the first getPosts() dispatch HomePage fires
// client-side (src/store/PostSlice/asyncThunk.ts) — same endpoint, same
// page-1/limit-20 params, just fetched during SSR so the feed shows real
// content on first paint instead of a loading skeleton. Any failure here
// just falls back to an empty array — the existing client-side fetch
// (unchanged) still runs afterward and fills the feed in as before.
export async function getInitialPosts(
  tab: string,
  userId: string
): Promise<IPost[]> {
  const refreshToken = cookies().get("refreshToken")?.value;
  const jwt = cookies().get("jwt")?.value;
  const cookieHeader = refreshToken
    ? `refreshToken=${refreshToken}`
    : jwt
      ? `jwt=${jwt}`
      : undefined;

  try {
    const params = new URLSearchParams();
    params.set("filter[page]", tab);
    if (userId) {
      params.set("userId", userId);
    }
    params.set("page", "1");
    params.set("limit", "20");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_PREFIX}${Route.POST}${POST_PATH.GET_ALL}?${params.toString()}`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.metadata ?? data ?? [];
  } catch {
    return [];
  }
}
