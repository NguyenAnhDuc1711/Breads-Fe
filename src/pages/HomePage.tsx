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
