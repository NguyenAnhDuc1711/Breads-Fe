import { cookies } from "next/headers";
import { API_PREFIX, Route, USER_PATH } from "../../src/Breads-Shared/APIConfig";
import { IUser } from "../../src/store/UserSlice";

// Resolves identity server-side during SSR.
//
// Passes the refreshToken (or legacy jwt) cookie to /me so the server can
// verify the session without destroying/rotating the refresh token prematurely.
// This allows the initial SSR page to render with user data on first paint.
export async function getCurrentUser(): Promise<IUser | null> {
  const refreshToken = cookies().get("refreshToken")?.value;
  const legacyJwt = cookies().get("jwt")?.value;

  if (!refreshToken && !legacyJwt) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const cookieHeader = refreshToken
      ? `refreshToken=${refreshToken}`
      : `jwt=${legacyJwt}`;

    const res = await fetch(
      `${apiUrl}${API_PREFIX}${Route.USER}${USER_PATH.ME}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data?.metadata ?? data ?? null;
  } catch {
    return null;
  }
}
