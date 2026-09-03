"use client";

import { Spinner } from "../../src/components/ui/primitives";
import { HeaderHeight } from "../../src/Layout";
import "./loading.css";

const Loading = () => (
  <div className="route-loading">
    <Spinner size="lg" />
  </div>
);

export default Loading;

