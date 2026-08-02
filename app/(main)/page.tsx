"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageConstant from "../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../src/pages/HomePage";

import { useAppSelector } from "../../src/hooks/redux";

// "/" is the default Home tab (for_you). Sibling tabs (/following, /liked,
// /saved) are handled by app/(main)/[tab]/page.tsx — see Task 010.
const Page = () => {
  const router = useRouter();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const isLoading = useAppSelector((state) => state.user.isLoading);

  useEffect(() => {
    if (!isLoading && !userInfo?._id) {
      router.replace(`/${PageConstant.LOGIN}`);
    }
  }, [userInfo?._id, isLoading, router]);

  return <HomePage tab={PageConstant.FOR_YOU} />;
};

export default Page;
