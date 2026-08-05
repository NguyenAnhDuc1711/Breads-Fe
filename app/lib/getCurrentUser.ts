import { cookies } from "next/headers";
import { Route, USER_PATH } from "../../src/Breads-Shared/APIConfig";
import { IUser } from "../../src/store/UserSlice";

// Resolves identity from the jwt cookie — same endpoint the client-side
// getMe() thunk calls (src/store/UserSlice/asyncThunk.ts), just fetched
// server-side so pages don't have to wait on that round trip after
// hydration. Next.js deduplicates identical fetch() calls made during the
// same request, so calling this from both app/layout.tsx and a page.tsx
// still only hits the backend once.
export async function getCurrentUser(): Promise<IUser | null> {
  const jwt = cookies().get("jwt")?.value;
  if (!jwt) return null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api${Route.USER}${USER_PATH.ME}`,
      {
        headers: { Cookie: `jwt=${jwt}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.metadata ?? data ?? null;
  } catch {
    return null;
  }
}
