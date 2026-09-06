import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect } from "react";

/**
 * Windowing cho nhánh `virtualized` của InfiniteScroll.
 *
 * Tách khỏi thân component có chủ ý: InfiniteScroll đã mang 2 chế độ scroll và
 * 6 effect. Nhánh `virtualized=false` không gọi hook này, nên `git diff` đủ để
 * chứng minh 8 call site còn lại không đổi hành vi — điều quan trọng vì repo
 * chưa có test tự động.
 */
export const useVirtualRows = ({
  data,
  preloadIndex,
  estimateSize,
  overscan,
  scrollMargin,
  canLoadMore,
  onReachEnd,
}: {
  data: any;
  preloadIndex: number;
  estimateSize: number;
  overscan?: number;
  scrollMargin: number;
  /**
   * Điều kiện cho phép tải thêm (`hasMoreData && !isLoading && …`).
   * BẮT BUỘC truyền vào đây thay vì chỉ kiểm bên trong `onReachEnd`, vì nó phải
   * nằm trong deps của effect — xem giải thích ở effect bên dưới.
   */
  canLoadMore: boolean;
  onReachEnd?: () => void;
}) => {
  // Nhánh cũ chịu được `data === undefined` nhờ `data?.map`. Virtualizer thì
  // không: `count: undefined` làm nó vỡ. Xử lý tường minh ở đây.
  const count = data?.length ?? 0;

  // Bất biến: overscan >= preloadIndex.
  // Trigger tải-thêm đọc index lớn nhất trong getVirtualItems(), tức chỉ thấy
  // được các item trong viewport + overscan. Nếu overscan nhỏ hơn preloadIndex,
  // điều kiện `lastIndex >= count - preloadIndex` không bao giờ đúng cho tới khi
  // cuộn sát đáy tuyệt đối — mất hẳn preload, feed khựng ở mỗi ranh giới page.
  // Ràng buộc này phải nằm trong hook, không để làm quan hệ ngầm giữa 2 tham số.
  const safeOverscan = Math.max(overscan ?? 0, preloadIndex);

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => estimateSize,
    overscan: safeOverscan,
    // Danh sách không bắt đầu ở đỉnh document (phía trên còn header, CreatePostBar…).
    // Thiếu scrollMargin thì mọi toạ độ lệch đúng bằng offsetTop của container.
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.length
    ? virtualItems[virtualItems.length - 1].index
    : -1;

  // Trigger tải-thêm dạng index-based, thay cho IntersectionObserver của nhánh cũ.
  // Dưới windowing, node mà observer cũ bám vào (item thứ `length - preloadIndex`)
  // không nằm trong DOM khi ở xa vùng render, nên cơ chế cũ không dùng được.
  //
  // Deps cố ý KHÔNG chứa `virtualItems`: mảng đó có danh tính mới mỗi frame cuộn.
  // `lastIndex` là số nguyên, ổn định trong suốt một vùng render.
  //
  // `canLoadMore` BẮT BUỘC nằm trong deps. Nếu chỉ kiểm điều kiện bên trong
  // `onReachEnd` mà không đưa vào deps, ta lặp lại đúng lỗi của cơ chế cũ:
  // lúc mount `isLoading` còn true nên lần fire duy nhất bị nuốt, rồi
  // `lastIndex`/`count` không đổi nữa nên effect không bao giờ chạy lại và feed
  // treo vĩnh viễn. Có `canLoadMore` trong deps thì khoảnh khắc điều kiện mở ra,
  // effect tự đánh giá lại.
  //
  // Đây chính là điểm khiến trigger index-based bền hơn IntersectionObserver:
  // nó là *level-triggered* (đánh giá lại theo trạng thái) chứ không phải
  // *edge-triggered* (chỉ bắn khi có transition giao cắt).
  useEffect(() => {
    if (!canLoadMore) return;
    if (count === 0) return;
    if (lastIndex < count - preloadIndex) return;
    onReachEnd?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex, count, preloadIndex, canLoadMore]);

  return {
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  };
};

export default useVirtualRows;
