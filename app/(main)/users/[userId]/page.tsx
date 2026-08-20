import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_PREFIX, Route, USER_PATH } from "../../../../src/Breads-Shared/APIConfig";
import ContainerLayout from "../../../../src/components/MainBoxLayout";
import UserHeader from "../../../../src/components/UserHeader";
import UserPageHydrate from "./UserPageHydrate";

// New server-side fetches — separate from the client-only getUserInfo
// Redux thunk (Server Components can't dispatch thunks). Forwards the
// jwt cookie for parity with client requests (src/config/API.ts's
// Authorization header). No visibility/privacy model exists for user
// profiles in this codebase (confirmed during plan-review via
// `grep -rniE "visibility|private|isPrivate|blocked" src/store/UserSlice
// src/pages/UserPage.tsx` — zero matches) — SSR is unconditional for any
// existing userId, unlike posts/[postId] which forks on status.
async function fetchJson(path: string, cookieHeader: string | undefined) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_PREFIX}${path}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.metadata ?? data;
  } catch {
    return null;
  }
}

async function fetchUser(userId: string) {
  const refreshToken = cookies().get("refreshToken")?.value;
  const jwt = cookies().get("jwt")?.value;
  const cookieHeader = refreshToken
    ? `refreshToken=${refreshToken}`
    : jwt
      ? `jwt=${jwt}`
      : undefined;
  return fetchJson(`${Route.USER}${USER_PATH.PROFILE}${userId}`, cookieHeader);
}

export async function generateMetadata({
  params,
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await fetchUser(params.userId);
  if (!user) {
    return { title: "Bread" };
  }
  const title = user.username ? `${user.username} · Breads` : "Breads";
  const description = user.bio ?? undefined;
  return {
    title,
    description,
    openGraph: {
      type: "profile",
      title,
      description,
      images: user.avatar
        ? [{ url: user.avatar, alt: `${user.username}'s avatar` }]
        : undefined,
    },
    twitter: {
      card: user.avatar ? "summary" : "summary",
      title,
      description,
      images: user.avatar ? [user.avatar] : undefined,
    },
  };
}

const Page = async ({ params }: { params: { userId: string } }) => {
  const user = await fetchUser(params.userId);

  if (!user) {
    notFound();
  }

  return (
    <ContainerLayout>
      <UserHeader user={user} />
      <UserPageHydrate userId={params.userId} />
    </ContainerLayout>
  );
};

export default Page;
