"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Constants } from "../Breads-Shared/Constants";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import CreatePostBar from "../components/CreatePostBar";
import ListPost from "../components/ListPost";
import ContainerLayout from "../components/MainBoxLayout";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { IPost, updateListPost } from "../store/PostSlice";
import { getPosts } from "../store/PostSlice/asyncThunk";
import { changeDisplayPageData, updateHasMoreData } from "../store/UtilSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";

// `tab` is the single source of truth for which Home tab is active — it
// comes from the matched route segment (app/(main)/page.tsx or
// app/(main)/[tab]/page.tsx), not from parsing the browser URL manually or
// reading Redux state.util.displayPageData (AD-4).
const HomePage = ({
  tab,
  initialPosts,
}: {
  tab: string;
  initialPosts: IPost[];
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { currentPage } = useAppSelector((state: AppState) => state.util);
  const { FOR_YOU } = PageConstant;
  const userId = userInfo?._id;

  useEffect(() => {
    if (userInfo?._id && userInfo?.role === Constants.USER_ROLE.ADMIN) {
      router.push(`/${PageConstant.ADMIN.DEFAULT}`);
    }
  }, [userInfo?._id]);

  useEffect(() => {
    // Seeds the feed with the server-fetched first page so ListPost renders
    // real posts on first paint. ListPost's own InfiniteScroll still fires
    // its usual client-side getPosts() fetch right after (unchanged) and
    // will replace this with its own copy — harmless since it's normally
    // the same page 1, just re-confirms it's fresh.
    dispatch(updateListPost(initialPosts));
    dispatch(updateHasMoreData(initialPosts.length > 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
    if (!userId) return;
    dispatch(
      getPosts({
        filter: { page: tab },
        userId,
        isNewPage: true,
      })
    );
  }, [tab, userId]);

  return (
    <ContainerLayout>
      <>
        {tab === FOR_YOU && <CreatePostBar />}
        <ListPost />
      </>
    </ContainerLayout>
  );
};

export default HomePage;
