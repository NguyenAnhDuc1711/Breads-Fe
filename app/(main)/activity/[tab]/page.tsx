"use client";

import ActivityPage from "../../../../src/pages/ActivityPage";

const Page = ({ params }: { params: { tab: string } }) => (
  <ActivityPage tab={params.tab} />
);

export default Page;
