import { sendGAEvent } from "@next/third-parties/google";

export const GA_EVENTS = {
  VIEW_POST: "view_post",
  LIKE_POST: "like_post",
  UNLIKE_POST: "unlike_post",
  COMMENT_POST: "comment_post",
  FOLLOW_USER: "follow_user",
  SEARCH: "search",
} as const;

// Post chưa có field "content type" lưu sẵn — suy theo thứ tự: poll > media > text.
export const getPostContentType = (post: {
  survey?: unknown[];
  media?: { type?: string }[];
}) => {
  if (post?.survey && post.survey.length > 0) return "poll";
  if (post?.media && post.media.length > 0) return post.media[0]?.type ?? "text";
  return "text";
};

// Hướng B: gọi thẳng gtag.js qua sendGAEvent (đúng cú pháp gtag('event', tên,
// params)) — không qua GTM container, không cần cấu hình trigger/tag nào cho
// event mới. sendGAEvent tự warn (không throw) nếu GA chưa init, nhưng vẫn
// bọc try/catch cho chắc (đảm bảo không crash UI nếu load thất bại).
export const sendGaEvent = ({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) => {
  try {
    sendGAEvent("event", event, params ?? {});
  } catch (err) {
    console.error("sendGaEvent: ", err);
  }
};
