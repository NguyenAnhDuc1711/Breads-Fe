import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  API_PREFIX,
  Route,
  USER_PATH,
} from "../../../../src/Breads-Shared/APIConfig";
import ContainerLayout from "../../../../src/components/MainBoxLayout";
import UserHeader from "../../../../src/components/UserHeader";
import UserPageHydrate from "./UserPageHydrate";

async function fetchJson(path: string, cookieHeader: string | undefined) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}${API_PREFIX}${path}`, {
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
  return fetchJson(
    `${Route.USER}${USER_PATH.PROFILE.replace(":userId", userId)}`,
    cookieHeader
  );
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: user.username,
              image: user.avatar,
              description: user.bio || undefined,
              url: `${process.env.NEXT_PUBLIC_APP_URL || "https://breads.sytes.net"}/users/${params.userId}`,
            },
          }),
        }}
      />
      <UserHeader user={user} />
      <UserPageHydrate userId={params.userId} />
    </ContainerLayout>
  );
};

export default Page;
