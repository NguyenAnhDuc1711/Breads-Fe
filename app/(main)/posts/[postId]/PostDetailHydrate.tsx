"use client";

import { useEffect } from "react";
import PageConstant from "../../../../src/Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../../../src/hooks/redux";
import { AppState } from "../../../../src/store";
import { selectPost } from "../../../../src/store/PostSlice";
import { useLazyGetPostQuery } from "../../../../src/store/api/postApi";
import { changePage } from "../../../../src/store/UtilSlice/asyncThunk";
import { addEvent } from "../../../../src/util";
import { GA_EVENTS, getPostContentType, sendGaEvent } from "../../../../src/util/gtmEvents";

const PostDetailHydrate = ({ postId }: { postId: string }) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state: AppState) => state.util.currentPage);
  const [triggerGetPost] = useLazyGetPostQuery();

  useEffect(() => {
    dispatch(changePage({ currentPage, nextPage: PageConstant.POST_DETAIL }));
    triggerGetPost(postId)
      .unwrap()
      .then((post) => {
        dispatch(selectPost(post));
        sendGaEvent({
          event: GA_EVENTS.VIEW_POST,
          params: { post_id: postId, content_type: getPostContentType(post) },
        });
      })
      .catch(() => {});
    addEvent({
      event: "see_detail_post",
      payload: {
        postId: postId,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default PostDetailHydrate;
