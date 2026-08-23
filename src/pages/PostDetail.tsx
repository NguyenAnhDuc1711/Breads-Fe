"use client";

import { useEffect, useMemo } from "react";
import { Constants } from "../Breads-Shared/Constants";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { EmptyContentSvg } from "../assests/icons";
import Post from "../components/ListPost/Post";
import ContainerLayout from "../components/MainBoxLayout";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { getPost } from "../store/PostSlice/asyncThunk";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import { GA_EVENTS, getPostContentType, sendGaEvent } from "../util/gtmEvents";
import { showToast } from "../store/UtilSlice";
import { useTranslation } from "react-i18next";
import "./PostDetail.css";

const PostDetail = ({ postId }: { postId: string }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const postSelected = useAppSelector(
    (state: AppState) => state.post.postSelected
  );
  const currentPage = useAppSelector(
    (state: AppState) => state.util.currentPage
  );

  useEffect(() => {
    if (postId) {
      dispatch(changePage({ currentPage, nextPage: PageConstant.POST_DETAIL }));
      dispatch(getPost(postId))
        .unwrap()
        .then((post) => {
          sendGaEvent({
            event: GA_EVENTS.VIEW_POST,
            params: { post_id: postId, content_type: getPostContentType(post) },
          });
        })
        .catch(() => {});
      addEvent({
        event: "see_detail_post",
        payload: {
          postId: postId,
        },
      });
    }
  }, [postId]);

  const getContentRender = useMemo(() => {
    if (!postSelected || !postSelected._id) {
      return null;
    }

    const postStatus = postSelected?.status;
    const postVisibility = postSelected?.visibility;
    const { DELETED } = Constants.POST_STATUS;
    const { ONLY_ME, ONLY_FOLLOWERS } = Constants.POST_VISIBILITY;
    let ableToDisplayPost: boolean = true;

    switch (postStatus) {
      case DELETED:
        dispatch(
          showToast({
            title: "",
            description: t("postDeleted"),
            status: "error",
          })
        );
        ableToDisplayPost = false;
        break;
      default:
        switch (postVisibility) {
          case ONLY_ME:
            ableToDisplayPost = !!userInfo?._id && String(userInfo?._id) === String(postSelected?.authorId);
            break;
          case ONLY_FOLLOWERS: {
            const followers = userInfo?.followed;
            ableToDisplayPost =
              !!userInfo?._id &&
              (String(userInfo?._id) === String(postSelected?.authorId) ||
                (Array.isArray(followers) && followers.map(String).includes(String(postSelected?.authorId))));
            break;
          }
          default:
            ableToDisplayPost = true;
        }
    }
    if (ableToDisplayPost) {
      return (
        <ContainerLayout>
          <Post post={postSelected} isDetail={true} />
        </ContainerLayout>
      );
    }
    return (
      <div className="post-detail__empty">
        <EmptyContentSvg />
      </div>
    );
  }, [postSelected, userInfo?._id]);

  return <>{getContentRender}</>;
};

export default PostDetail;
