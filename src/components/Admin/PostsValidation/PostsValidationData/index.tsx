import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { AppState } from "../../../../store";
import { getPosts } from "../../../../store/PostSlice/asyncThunk";
import ListPost from "../../../ListPost";
import { filterPostWidth } from "../PostsFilterBar";
import "./index.css";

const PostsValidationData = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const currentPage = useAppSelector(
    (state: AppState) => state.util.currentPage
  );

  useEffect(() => {
    if (userInfo?._id) {
      dispatch(
        getPosts({
          filter: { page: currentPage },
          userId: localStorage.getItem("userId"),
          isNewPage: true,
        })
      );
    }
  }, [userInfo?._id]);

  return (
    <div
      className="posts-validation-data"
      style={{ marginLeft: `${filterPostWidth}px` }}
    >
      <div className="posts-validation-data__inner">
        <ListPost />
      </div>
    </div>
  );
};

export default PostsValidationData;
