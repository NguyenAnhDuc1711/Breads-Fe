import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Route } from "../../../../src/Breads-Shared/APIConfig";
import { Constants } from "../../../../src/Breads-Shared/Constants";
import Post from "../../../../src/components/ListPost/Post";
import ContainerLayout from "../../../../src/components/MainBoxLayout";
import PostDetail from "../../../../src/pages/PostDetail";
import PostDetailHydrate from "./PostDetailHydrate";

// New server-side fetch — separate from the client-only getPost Redux
// thunk (Server Components can't dispatch thunks). Forwards the jwt
// cookie so the backend sees the same identity a client request would
// (parity with src/config/API.ts's Authorization header, just via
// Cookie here since axios's withCredentials isn't available server-side).
async function fetchPost(postId: string): Promise<any | null> {
  const jwt = cookies().get("jwt")?.value;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api${Route.POST}/${postId}`,
      {
        headers: jwt ? { Cookie: `jwt=${jwt}` } : {},
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.metadata ?? data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const post = await fetchPost(params.postId);
  // Only PUBLIC posts get real OG content — anything else must not leak
  // title/content into publicly-crawlable <head> metadata.
  if (!post || post.status !== Constants.POST_STATUS.PUBLIC) {
    return { title: "Bread" };
  }
  const text: string = post.content ?? "";
  const image = post.media?.[0]?.url;
  return {
    title: text ? text.slice(0, 60) : "Bread",
    description: text.slice(0, 160),
    openGraph: {
      title: text ? text.slice(0, 60) : "Bread",
      description: text.slice(0, 160),
      images: image ? [image] : undefined,
    },
  };
}

const Page = async ({ params }: { params: { postId: string } }) => {
  const post = await fetchPost(params.postId);

  if (!post) {
    notFound();
  }

  if (post.status === Constants.POST_STATUS.PUBLIC) {
    return (
      <ContainerLayout>
        <Post post={post} isDetail={true} />
        <PostDetailHydrate postId={params.postId} />
      </ContainerLayout>
    );
  }

  // PENDING/DELETED/ONLY_ME/ONLY_FOLLOWERS: no reliable server-side way to
  // know the requester's identity (the app's identity source is
  // localStorage, browser-only — see epic handoff notes), so these fall
  // back to PostDetail.tsx's exact existing client-only gating, unchanged
  // (Risk #2 — port exactly, don't rewrite). SSR has no SEO value for
  // non-public content anyway.
  return <PostDetail postId={params.postId} />;
};

export default Page;
