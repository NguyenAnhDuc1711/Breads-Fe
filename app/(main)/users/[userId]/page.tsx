import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Route, USER_PATH } from "../../../../src/Breads-Shared/APIConfig";
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
async function fetchJson(path: string, jwt: string | undefined) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${path}`, {
      headers: jwt ? { Cookie: `jwt=${jwt}` } : {},
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
  const jwt = cookies().get("jwt")?.value;
  return fetchJson(`${Route.USER}${USER_PATH.PROFILE}${userId}`, jwt);
}

async function fetchUsersFollow(userId: string) {
  const jwt = cookies().get("jwt")?.value;
  const data = await fetchJson(
    `${Route.USER}${USER_PATH.USERS_FOLLOW}?userId=${userId}`,
    jwt
  );
  return {
    followed: data?.followed ?? [],
    following: data?.following ?? [],
  };
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
  return {
    title: user.username ? `${user.username} · Bread` : "Bread",
    description: user.bio ?? undefined,
    openGraph: {
      title: user.username ? `${user.username} · Bread` : "Bread",
      description: user.bio ?? undefined,
      images: user.avatar ? [user.avatar] : undefined,
    },
  };
}

const Page = async ({ params }: { params: { userId: string } }) => {
  const user = await fetchUser(params.userId);

  if (!user) {
    notFound();
  }

  const usersFollow = await fetchUsersFollow(params.userId);

  return (
    <ContainerLayout>
      <UserHeader user={user} usersFollow={usersFollow} />
      <UserPageHydrate userId={params.userId} />
    </ContainerLayout>
  );
};

export default Page;
