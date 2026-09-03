"use client";

import { useEffect } from "react";
import PageConstant from "../../../../src/Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../../../src/hooks/redux";
import { AppState } from "../../../../src/store";
import { selectUser } from "../../../../src/store/UserSlice";
import { useLazyGetUserInfoQuery } from "../../../../src/store/api/userApi";
import { changeDisplayPageData } from "../../../../src/store/UtilSlice";
import { changePage } from "../../../../src/store/UtilSlice/asyncThunk";
import { addEvent } from "../../../../src/util";

const UserPageHydrate = ({ userId }: { userId: string }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [triggerGetUserInfo] = useLazyGetUserInfoQuery();

  useEffect(() => {
    dispatch(changeDisplayPageData(""));
    triggerGetUserInfo({ userId }).then((result) => {
      if (result.data) {
        dispatch(selectUser(result.data));
      }
      dispatch(
        changePage({
          nextPage:
            userId === userInfo?._id ? PageConstant.USER : PageConstant.FRIEND,
        })
      );
    });
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
