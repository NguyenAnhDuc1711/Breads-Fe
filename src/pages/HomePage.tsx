import { useEffect, useState } from "react";
import { Constants } from "../Breads-Shared/Constants";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import CreatePostBar from "../components/CreatePostBar";
import ListPost from "../components/ListPost";
import ContainerLayout from "../components/MainBoxLayout";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { HeaderHeight } from "../Layout";
import { AppState } from "../store";
import { getPosts } from "../store/PostSlice/asyncThunk";
import { changeDisplayPageData } from "../store/UtilSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";

// `tab` is the single source of truth for which Home tab is active — it
// comes from the matched route segment (app/(main)/page.tsx or
// app/(main)/[tab]/page.tsx), not from parsing the browser URL manually or
// reading Redux state.util.displayPageData (AD-4).
const HomePage = ({ tab }: { tab: string }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { currentPage } = useAppSelector((state: AppState) => state.util);
  const { FOR_YOU } = PageConstant;
  const userId = userInfo?._id;

  useEffect(() => {
    if (userInfo?._id && userInfo?.role === Constants.USER_ROLE.ADMIN) {
      window.location.href =
        window.location.origin + "/" + PageConstant.ADMIN.DEFAULT;
    }
  }, [userInfo?._id]);

  useEffect(() => {
    // Next.js reuses this component across sibling tabs of the same dynamic
    // segment (e.g. /following -> /liked) instead of remounting it the way
    // react-router did, so this must be keyed on `tab`, not mount-only.
    dispatch(
      changePage({
        nextPage: PageConstant.HOME,
        currentPage,
      })
    );
    dispatch(changeDisplayPageData(tab));
    addEvent({
      event: "see_page",
      payload: {
        page: "home",
      },
    });
  }, [tab]);

  useEffect(() => {
    if (userId === null) return;
    dispatch(
      getPosts({
        filter: { page: tab },
        userId,
        isNewPage: true,
      })
    );
  }, [tab, userId]);

  return (
    // Old App.tsx applied this same marginTop to every non-auth/non-admin
    // route's wrapper div (Header is `position: fixed`); that spacing now
    // lives in each route's own page body (see app/(main)/layout.tsx note).
    <div style={{ marginTop: HeaderHeight + 12 + "px" }}>
      <ContainerLayout>
        <>
          {tab === FOR_YOU && <CreatePostBar />}
          <ListPost />
        </>
      </ContainerLayout>
    </div>
  );
};

export default HomePage;
