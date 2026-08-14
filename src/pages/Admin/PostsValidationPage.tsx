"use client";

import { useEffect } from "react";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostsFilterBar from "../../components/Admin/PostsValidation/PostsFilterBar";
import PostsValidationData from "../../components/Admin/PostsValidation/PostsValidationData";
import { useAppDispatch } from "../../hooks/redux";
import { changeDisplayPageData } from "../../store/UtilSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";
import "./PostsValidationPage.css";

const PostsValidationPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(changePage({ nextPage: PageConstant.ADMIN.POSTS_VALIDATION }));
    dispatch(changeDisplayPageData(PageConstant.ADMIN.POSTS_VALIDATION));
  }, []);

  return (
    <div className="posts-validation-page">
      <PostsFilterBar />
      <PostsValidationData />
    </div>
  );
};

export default PostsValidationPage;
