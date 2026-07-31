"use client";

import PageConstant from "../../src/Breads-Shared/Constants/PageConstants";
import HomePage from "../../src/pages/HomePage";

// "/" is the default Home tab (for_you). Sibling tabs (/following, /liked,
// /saved) are handled by app/(main)/[tab]/page.tsx — see Task 010.
const Page = () => <HomePage tab={PageConstant.FOR_YOU} />;

export default Page;
