"use client";

import { useEffect } from "react";
import PageConstant from "../../../../src/Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../../../src/hooks/redux";
import { AppState } from "../../../../src/store";
import { getUserPosts } from "../../../../src/store/PostSlice/asyncThunk";
import { getUserInfo } from "../../../../src/store/UserSlice/asyncThunk";
import { changeDisplayPageData } from "../../../../src/store/UtilSlice";
import { changePage } from "../../../../src/store/UtilSlice/asyncThunk";
import { addEvent } from "../../../../src/util";

// Renders nothing — reproduces UserPage.tsx's original mount effects
// (populate Redux userSelected/posts via the existing thunks so the
// client child's follow button / tabs work post-hydration exactly as
// before, page-tracking, analytics event) since the server-rendered
// branch renders <UserHeader> directly instead of the client-only
// UserPage component that normally owns these effects.
const UserPageHydrate = ({ userId }: { userId: string }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);

  useEffect(() => {
    dispatch(changeDisplayPageData(""));
    dispatch(getUserInfo({ userId, getCurrentUser: false })).then(() => {
      dispatch(
        changePage({
          nextPage:
            userId === userInfo?._id ? PageConstant.USER : PageConstant.FRIEND,
        })
      );
    });
    dispatch(getUserPosts(userId));
    addEvent({
      event: "see_page",
      payload: {
        page: "user",
        userPage: userId,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
};

export default UserPageHydrate;
