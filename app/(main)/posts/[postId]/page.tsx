import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Route } from "../../../../src/Breads-Shared/APIConfig";
import { Constants } from "../../../../src/Breads-Shared/Constants";
import Post from "../../../../src/components/ListPost/Post";
import ContainerLayout from "../../../../src/components/MainBoxLayout";
import PostDetail from "../../../../src/pages/PostDetail";
import PostDetailHydrate from "./PostDetailHydrate";

// Server-side fetch forwards cookies so backend sees identity if cookies present.
// Parity with src/config/API.ts with fallback to localhost:8080.
async function fetchPost(postId: string): Promise<any | null> {
  const refreshToken = cookies().get("refreshToken")?.value;
  const jwt = cookies().get("jwt")?.value;
  const cookieHeader = refreshToken
    ? `refreshToken=${refreshToken}`
    : jwt
      ? `jwt=${jwt}`
      : undefined;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const res = await fetch(
      `${apiUrl}/api${Route.POST}/${postId}`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.metadata ?? data;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const post = await fetchPost(params.postId);
  const isPublic =
    post &&
    post.status !== Constants.POST_STATUS.DELETED &&
    (post.visibility === Constants.POST_VISIBILITY.PUBLIC || post.visibility === undefined);

  if (!isPublic) {
    return { title: "Bread" };
  }
  const text: string = post.content ?? "";
  const image = post.media?.[0]?.url;
  const title = text ? text.slice(0, 60) : "Breads";
  const description = text.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const Page = async ({ params }: { params: { postId: string } }) => {
  const post = await fetchPost(params.postId);

  const isPublic =
    post &&
    post.status !== Constants.POST_STATUS.DELETED &&
    (post.visibility === Constants.POST_VISIBILITY.PUBLIC || post.visibility === undefined);

  if (isPublic) {
    return (
      <ContainerLayout>
        <Post post={post} isDetail={true} />
        <PostDetailHydrate postId={params.postId} />
      </ContainerLayout>
    );
  }

  // Fallback to client-side PostDetail component which has access to localStorage tokens
  // and full client-side Redux gating for authenticated, private, or client-loaded posts
  return <PostDetail postId={params.postId} />;
};

export default Page;
