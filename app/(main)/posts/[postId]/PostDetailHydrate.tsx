"use client";

import { useEffect } from "react";
import PageConstant from "../../../../src/Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../../../src/hooks/redux";
import { AppState } from "../../../../src/store";
import { getPost } from "../../../../src/store/PostSlice/asyncThunk";
import { changePage } from "../../../../src/store/UtilSlice/asyncThunk";
import { addEvent } from "../../../../src/util";

// Renders nothing — reproduces PostDetail.tsx's original mount effect
// (populate Redux `postSelected` via the existing thunk, page-tracking,
// analytics event) for the PUBLIC/server-rendered branch, since that
// branch renders <Post> directly instead of the client-only PostDetail
// component that normally owns this effect.
const PostDetailHydrate = ({ postId }: { postId: string }) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state: AppState) => state.util.currentPage);

  useEffect(() => {
    dispatch(changePage({ currentPage, nextPage: PageConstant.POST_DETAIL }));
    dispatch(getPost(postId));
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
