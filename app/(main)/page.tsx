import { redirect } from "next/navigation";
import PageConstant from "../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../src/pages/HomePage";
import { getCurrentUser } from "../lib/getCurrentUser";
import { getInitialPosts } from "../lib/getInitialPosts";

// "/" is the default Home tab (for_you). Sibling tabs (/following, /liked,
// /saved) are handled by app/(main)/[tab]/page.tsx — see Task 010.
// Server Component: resolves identity + fetches page 1 of the feed here so
// HomePage has real content on first paint instead of waiting on its own
// client-side getPosts() round trip. middleware.ts already blocks requests
// with no jwt cookie at all from reaching this route — the redirect below
// only fires for the narrower case of a present-but-invalid/expired cookie
// (same condition the old client-side redirect effect covered).
const Page = async () => {
  const user = await getCurrentUser();
  const initialPosts = await getInitialPosts(
    PageConstant.FOR_YOU,
    user?._id || "",
  );
  return <HomePage tab={PageConstant.FOR_YOU} initialPosts={initialPosts} />;
};

export default Page;
