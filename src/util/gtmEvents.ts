import { sendGAEvent } from "@next/third-parties/google";

export const GA_EVENTS = {
  VIEW_POST: "view_post",
  LIKE_POST: "like_post",
  UNLIKE_POST: "unlike_post",
  COMMENT_POST: "comment_post",
  FOLLOW_USER: "follow_user",
  SEARCH: "search",
  CREATE_POST: "create_post",
  REPOST_POST: "repost_post",
  EDIT_POST: "edit_post",
  SHARE: "share",
} as const;

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
    sendGAEvent("event", event, params ?? {});
  } catch (err) {
    console.error("sendGaEvent: ", err);
  }
};
