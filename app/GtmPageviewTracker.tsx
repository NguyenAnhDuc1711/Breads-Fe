"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const GtmPageviewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // GTM script (app/layout.tsx) có thể bị ad-blocker/mạng chặn trước khi
      // kịp khởi tạo window.dataLayer — không giả định nó luôn tồn tại
      // (plan-review ARCH-1, đảm bảo NFR-2 không throw crash UI).
      window.dataLayer = window.dataLayer || [];
      const query = searchParams?.toString();
      window.dataLayer.push({
        event: "page_view",
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
