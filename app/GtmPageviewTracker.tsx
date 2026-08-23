"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

const GtmPageviewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // GA script (app/layout.tsx) có thể bị ad-blocker/mạng chặn trước khi
      // kịp khởi tạo window.dataLayer — sendGAEvent tự warn (không throw)
      // nếu GA chưa init, nhưng vẫn bọc try/catch cho chắc (plan-review
      // ARCH-1, đảm bảo NFR-2 không throw crash UI).
      const query = searchParams?.toString();
      sendGAEvent("event", "page_view", {
        page_path: pathname + (query ? `?${query}` : ""),
        page_title: document.title,
      });
    } catch (err) {
      console.error("GtmPageviewTracker: ", err);
    }
  }, [pathname, searchParams]);

  return null;
};

export default GtmPageviewTracker;
