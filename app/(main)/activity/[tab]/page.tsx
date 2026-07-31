"use client";

import ActivityPage from "../../../../src/pages/ActivityPage";

// Handles /activity/follows, /activity/replies, /activity/mentions,
// /activity/likes, /activity/reposts — params.tab is the single source of
// truth for which Activity tab is active (see Task 010 / AD-4).
const Page = ({ params }: { params: { tab: string } }) => (
  <ActivityPage tab={params.tab} />
);

export default Page;
