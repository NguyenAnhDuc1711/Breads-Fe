"use client";

import PageConstant from "../../../src/Breads-Shared/Constants/PageConstants";
import ActivityPage from "../../../src/pages/ActivityPage";

// "/activity" with no sub-path shows all notifications (PageConstant.ALL,
// matching getDisplayPageData's contract for a bare "/activity" URL).
// Sibling tabs (/activity/follows, etc.) are handled by
// app/(main)/activity/[tab]/page.tsx — see Task 010.
const Page = () => <ActivityPage tab={PageConstant.ALL} />;

export default Page;
