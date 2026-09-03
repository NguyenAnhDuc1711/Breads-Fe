import { Fragment } from "react";
import { EmptyContentSvg } from "../../assests/icons";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { getPosts } from "../../store/PostSlice/asyncThunk";
import InfiniteScroll from "../InfiniteScroll";
import Post from "./Post";
import SkeletonPost from "./Post/skeleton";
import "./index.css";

const ListPost = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { listPost, isLoading } = useAppSelector(
    (state: AppState) => state.post,
  );
  const { currentPage, displayPageData } = useAppSelector(
    (state: AppState) => state.util,
  );

  const handleGetPosts = async ({ page }) => {
    try {
      if (
        currentPage === PageConstant.USER ||
        currentPage === PageConstant.FRIEND
      ) {
        return;
      }
      if (page === 1 && hasPosts) {
        return;
      }
      const filter = { page: displayPageData };
      const payload: {
        filter: any;
        userId?: string;
        page: string;
        isNewPage?: boolean;
      } = {
        filter: filter,
        ...(userInfo?._id ? { userId: userInfo._id } : {}),
        page: page,
      };
      if (page === 1) {
        payload.isNewPage = true;
      }
      dispatch(getPosts(payload));
    } catch (err) {
      console.error("Error scroll to get more post: ", err);
    }
  };

  const hasPosts = Array.isArray(listPost) && listPost.length > 0;

  return (
    <>
      {hasPosts ? (
        <>
          <InfiniteScroll
            queryFc={(page) => {
              handleGetPosts({
                page,
              });
            }}
            data={Array.isArray(listPost) ? listPost : []}
            cpnFc={(post, index) => (
              <Fragment>
                <Post post={post} isFirst={index === 0} />
                <hr className="list-post__gap" />
              </Fragment>
            )}
            skeletonCpn={<SkeletonPost />}
          />
        </>
      ) : (
        <>
          {isLoading ? (
            <div className="list-post__skeletons">
              {[1, 2, 3, 4, 5].map((num) => (
                <SkeletonPost key={`skeleton-post-${num}`} />
              ))}
            </div>
          ) : (
            <div className="list-post__empty">
              <EmptyContentSvg />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ListPost;
