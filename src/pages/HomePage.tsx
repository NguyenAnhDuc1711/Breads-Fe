"use client";

import { useEffect, useRef, useState } from "react";
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
  const userId = userInfo?._id ?? "";
  const loadedForUserId = useRef(userId);

  const fetchFeed = () =>
    dispatch(
      getPosts({
        filter: { page: tab },
        page: 1,
        isNewPage: true,
        ...(userId ? { userId } : {}),
      })
    );

  useEffect(() => {
    // initialPosts đến từ fetch phía server; khi fetch đó hỏng nó có thể không
    // phải mảng, nên chuẩn hoá trước khi lấy .length làm điều kiện — nếu không,
    // `undefined === 0` là false và request cứu hộ bên dưới không bao giờ chạy.
    const seeded = Array.isArray(initialPosts) ? initialPosts : [];
    dispatch(updateListPost(seeded));
    dispatch(updateHasMoreData(seeded.length > 0));
    if (seeded.length === 0) {
      fetchFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Feed chỉ được nạp lúc mount, nên khi danh tính người xem đổi mà trang vẫn
  // đang mounted (đăng nhập bằng popup, đăng xuất) thì dữ liệu của phiên trước
  // ở lại: likedByMe và phần cá nhân hoá đều sai. Ref chặn fetch thừa lúc mount.
  useEffect(() => {
    if (loadedForUserId.current === userId) return;
    loadedForUserId.current = userId;
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tab]);

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
