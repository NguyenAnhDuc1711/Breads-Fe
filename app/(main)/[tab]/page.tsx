import { notFound, redirect } from "next/navigation";
import PageConstant from "../../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../../src/pages/HomePage";
import { getCurrentUser } from "../../lib/getCurrentUser";
import { getInitialPosts } from "../../lib/getInitialPosts";

// Valid tabs for the Home page — only these should be handled by this route.
// Any other single-segment path that isn't caught by a sibling route should 404.
const VALID_TABS = new Set([
  PageConstant.FOR_YOU,
  PageConstant.FOLLOWING,
  PageConstant.LIKED,
  PageConstant.SAVED,
]);

// Handles /for_you, /following, /liked, /saved — params.tab is the single
// source of truth for which Home tab is active (see Task 010 / AD-4).
// Server Component, mirrors app/(main)/page.tsx — see the comment there.
const Page = async ({ params }: { params: { tab: string } }) => {
  // Reject unknown tabs early — without this, ANY single-segment URL
  // (e.g. /abc-xyz) would be silently rendered as a Home page.
  if (!VALID_TABS.has(params.tab)) {
    notFound();
  }

  const user = await getCurrentUser();
  const isPublicTab = params.tab === PageConstant.FOR_YOU;

  if (!user?._id && !isPublicTab) {
    redirect(`/${PageConstant.LOGIN}`);
  }

  const initialPosts = await getInitialPosts(params.tab, user?._id || "");
  return <HomePage tab={params.tab} initialPosts={initialPosts} />;
};

export default Page;
