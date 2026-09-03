import { notFound, redirect } from "next/navigation";
import PageConstant from "../../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../../src/pages/HomePage";
import { getCurrentUser } from "../../lib/getCurrentUser";
import { getInitialPosts } from "../../lib/getInitialPosts";

const VALID_TABS = new Set([
  PageConstant.FOR_YOU,
  PageConstant.FOLLOWING,
  PageConstant.LIKED,
  PageConstant.SAVED,
]);

const Page = async ({ params }: { params: { tab: string } }) => {
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
