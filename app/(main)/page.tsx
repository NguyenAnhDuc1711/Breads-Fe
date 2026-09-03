import { redirect } from "next/navigation";
import PageConstant from "../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../src/pages/HomePage";
import { getCurrentUser } from "../lib/getCurrentUser";
import { getInitialPosts } from "../lib/getInitialPosts";

const Page = async () => {
  const user = await getCurrentUser();
  const initialPosts = await getInitialPosts(
    PageConstant.FOR_YOU,
    user?._id || "",
  );
  return <HomePage tab={PageConstant.FOR_YOU} initialPosts={initialPosts} />;
};

export default Page;
