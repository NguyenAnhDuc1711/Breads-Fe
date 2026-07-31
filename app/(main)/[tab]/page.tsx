"use client";

import HomePage from "../../../src/pages/HomePage";

// Handles /for_you, /following, /liked, /saved — params.tab is the single
// source of truth for which Home tab is active (see Task 010 / AD-4).
const Page = ({ params }: { params: { tab: string } }) => (
  <HomePage tab={params.tab} />
);

export default Page;
