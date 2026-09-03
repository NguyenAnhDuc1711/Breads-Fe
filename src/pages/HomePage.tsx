"use client";

import { useEffect, useState } from "react";
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
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { currentPage } = useAppSelector((state: AppState) => state.util);
  const { FOR_YOU } = PageConstant;

  useEffect(() => {
    // Seeds the feed with the server-fetched first page so ListPost renders
    // real posts on first paint. app/(main)/page.tsx and [tab]/page.tsx both
    // re-run getInitialPosts() server-side on every tab navigation, so this
    // is always the up-to-date page 1 for the current `tab` — no separate
    // client-side getPosts() fetch needed here (ListPost's InfiniteScroll
    // only fetches page 2+, see its `page === 1` early-return).
    dispatch(updateListPost(initialPosts));
    dispatch(updateHasMoreData(initialPosts.length > 0));
    if (!initialPosts || initialPosts.length === 0) {
      dispatch(
        getPosts({
          filter: { page: tab },
          page: 1,
          isNewPage: true,
          ...(userInfo?._id ? { userId: userInfo._id } : {}),
        })
      );
    }
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

  return (
    <ContainerLayout>
      <>
        {tab === FOR_YOU && !!userInfo?._id && <CreatePostBar />}
        <ListPost />
      </>
    </ContainerLayout>
  );
};

export default HomePage;
