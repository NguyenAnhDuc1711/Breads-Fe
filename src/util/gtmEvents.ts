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
