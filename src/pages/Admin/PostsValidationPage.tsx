"use client";

import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostsFilterBar from "../../components/Admin/PostsValidation/PostsFilterBar";
import PostsValidationData from "../../components/Admin/PostsValidation/PostsValidationData";
import { useAppDispatch } from "../../hooks/redux";
import { changeDisplayPageData } from "../../store/UtilSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";

const PostsValidationPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(changePage({ nextPage: PageConstant.ADMIN.POSTS_VALIDATION }));
    dispatch(changeDisplayPageData(PageConstant.ADMIN.POSTS_VALIDATION));
  }, []);

  return (
    <Flex width={"100%"} height={"fit-content"} minH={"100vh"}>
      <PostsFilterBar />
      <PostsValidationData />
    </Flex>
  );
};

export default PostsValidationPage;
