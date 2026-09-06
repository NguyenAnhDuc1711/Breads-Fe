import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { useVirtualRows } from "./useVirtualRows";

/**
 * Nhánh render có windowing của InfiniteScroll.
 *
 * Tồn tại như một component riêng (thay vì viết thẳng trong index.tsx) vì hook
 * không gọi có điều kiện được. Tách ra thế này thì nhánh `virtualized=false`
 * hoàn toàn không chạm tới `useVirtualRows`, và diff trong index.tsx chỉ còn
 * vài dòng — đủ để chứng minh 8 call site còn lại không đổi hành vi bằng
 * `git diff`, vốn là cách nghiệm thu duy nhất (repo chưa có test tự động).
 */
const VirtualRows = ({
  data,
  cpnFc,
  preloadIndex,
  estimateSize,
  overscan,
  canLoadMore,
  onReachEnd,
  skeletonCpn,
  showTrailingSkeleton,
}: {
  data: any;
  cpnFc: any;
  preloadIndex: number;
  estimateSize: number;
  overscan?: number;
  canLoadMore: boolean;
  onReachEnd?: () => void;
  skeletonCpn?: any;
  showTrailingSkeleton?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Danh sách không bắt đầu ở đỉnh document. Đo khoảng cách từ đỉnh trang tới
  // container để virtualizer quy đổi đúng toạ độ cuộn của window.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { virtualItems, totalSize, measureElement } = useVirtualRows({
    data,
    preloadIndex,
    estimateSize,
    overscan,
    scrollMargin,
    canLoadMore,
    onReachEnd,
  });

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: totalSize }}
      >
        {virtualItems.map((virtualRow) => {
          const ele = data?.[virtualRow.index];
          return (
            <div
              key={ele?._id ?? virtualRow.key}
              data-index={virtualRow.index}
              ref={measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              {cpnFc(ele, virtualRow.index)}
            </div>
          );
        })}
      </div>
      {/* Skeleton "đang tải thêm" nằm NGOÀI danh sách ảo, không phải item giả —
          giữ ánh xạ index ↔ data một-một. */}
      {showTrailingSkeleton && skeletonCpn && (
        <>
          {[1, 2, 3, 4, 5].map((num) => (
            <Fragment key={`virtual-skeleton-${num}`}>{skeletonCpn}</Fragment>
          ))}
        </>
      )}
    </>
  );
};

export default VirtualRows;
