declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

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

export const sendGaEvent = ({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) => {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch (err) {
    console.error("sendGaEvent: ", err);
  }
};
