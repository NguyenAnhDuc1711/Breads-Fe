import { redirect } from "next/navigation";
import PageConstant from "../../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../../src/pages/HomePage";
import { getCurrentUser } from "../../lib/getCurrentUser";
import { getInitialPosts } from "../../lib/getInitialPosts";

// Handles /for_you, /following, /liked, /saved — params.tab is the single
// source of truth for which Home tab is active (see Task 010 / AD-4).
// Server Component, mirrors app/(main)/page.tsx — see the comment there.
const Page = async ({ params }: { params: { tab: string } }) => {
  const user = await getCurrentUser();
  const isPublicTab = params.tab === PageConstant.FOR_YOU;

  if (!user?._id && !isPublicTab) {
    redirect(`/${PageConstant.LOGIN}`);
  }

  const initialPosts = await getInitialPosts(params.tab, user?._id || "");
  return <HomePage tab={params.tab} initialPosts={initialPosts} />;
};

export default Page;
