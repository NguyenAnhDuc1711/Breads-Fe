"use client";

import { Spinner } from "../../src/components/ui/primitives";
import { HeaderHeight } from "../../src/Layout";
import "./loading.css";

// Next.js swaps this in immediately on navigation while the target route
// segment's server work (identity fetch in the root layout, any future
// per-route server fetch) is still in flight — instant feedback instead of
// a frozen screen, without needing every page to build its own loading
// state. Kept shape-agnostic (a spinner, not a posts skeleton) since this
// same fallback covers everything under (main) — feed, chat, search,
// admin, auth.
const Loading = () => (
  <div
    className="route-loading"
    style={{
      height: `calc(100vh - ${HeaderHeight}px)`,
      marginTop: `${HeaderHeight}px`,
    }}
  >
    <Spinner size="lg" />
  </div>
);

export default Loading;
