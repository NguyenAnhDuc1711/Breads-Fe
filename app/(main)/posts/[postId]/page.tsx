import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_PREFIX, Route } from "../../../../src/Breads-Shared/APIConfig";
import { Constants } from "../../../../src/Breads-Shared/Constants";
import Post from "../../../../src/components/ListPost/Post";
import ContainerLayout from "../../../../src/components/MainBoxLayout";
import PostDetail from "../../../../src/pages/PostDetail";
import PostDetailHydrate from "./PostDetailHydrate";

// Classifies a fetched post into one of 3 mutually-exclusive access outcomes
// covering every status x visibility combination (PRD FR-7):
// - "deleted": status === DELETED -> notFound()/410, never render PostDetail.
// - "public": status === PUBLIC && visibility === PUBLIC (or undefined) ->
//   full SSR + indexable (case a of the epic's "public" branch).
// - "noindex": everything else that still exists — any private visibility
//   combination, AND PRE_ACCEPT+PUBLIC (AD-5: intentionally still shown to
//   preserve UX, but must not be indexed while pending review). Both of
//   these map to the same SEO signal (200 + noindex), only UX differs, which
//   is handled by the branches that call this helper.
// Shared by generateMetadata and Page so both places stay in sync (previously
// each computed `isPublic` separately, which is exactly the kind of drift
// this task fixes).
function classifyPostAccess(post: any): "deleted" | "noindex" | "public" {
  if (!post || post.status === Constants.POST_STATUS.DELETED) return "deleted";
  const isPublicVisibility =
    post.visibility === Constants.POST_VISIBILITY.PUBLIC || post.visibility === undefined;
  if (isPublicVisibility && post.status === Constants.POST_STATUS.PUBLIC) return "public";
  // catch-all: PRE_ACCEPT+PUBLIC (case c) OR any private-visibility combination (case b)
  return "noindex";
}

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
      `${apiUrl}${API_PREFIX}${Route.POST}/${postId}`,
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
  const access = classifyPostAccess(post);

  if (access === "deleted") {
    // notFound() can't be called from generateMetadata; the Page component
    // below handles the actual 404/410 response.
    return { title: "Bread" };
  }
  if (access === "noindex") {
    return { title: "Bread", robots: { index: false, follow: false } };
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
  const access = classifyPostAccess(post);

  if (access === "deleted") {
    // PRD allows 404 or 410; Next.js App Router Server Components don't
    // expose a convenient arbitrary-status API, so notFound() (404) is used.
    notFound();
  }

  if (access === "public") {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      author: { "@type": "Person", name: post.author?.username },
      datePublished: post.createdAt,
      articleBody: post.content,
      image: post.media?.[0]?.url,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: post.likesCount ?? 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: post.repliesCount ?? 0,
        },
      ],
    };
    return (
      <ContainerLayout>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Post post={post} isDetail={true} />
        <PostDetailHydrate postId={params.postId} />
      </ContainerLayout>
    );
  }

  // access === "noindex": deleted post already returned above via notFound().
  // Fallback to client-side PostDetail component which has access to localStorage tokens
  // and full client-side Redux gating for authenticated, private, or client-loaded posts.
  // noindex is already applied via generateMetadata; UX here is unchanged.
  return <PostDetail postId={params.postId} />;
};

export default Page;
