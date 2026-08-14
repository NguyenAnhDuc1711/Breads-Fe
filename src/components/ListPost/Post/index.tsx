"use client";

import { ChevronRightIcon } from "../../../assests/chakraIcons";
import { Button, Card, CardBody, Divider, Menu, MenuButton, MenuList, Portal, Text, Tooltip, useColorMode } from "../../ui/primitives";
import dayjs from "../../../util/dayjs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { MdLock, MdPeopleAlt } from "react-icons/md";
import { RiDoubleQuotesL } from "react-icons/ri";
import { Socket } from "socket.io-client";
import { POST_PATH, Route } from "../../../Breads-Shared/APIConfig";
import { Constants } from "../../../Breads-Shared/Constants";
import PostConstants from "../../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import usePopupCancel from "../../../hooks/usePopupCancel";
import useSocket from "../../../hooks/useSocket";
import { AppState } from "../../../store";
import { IPost, updatePostLike } from "../../../store/PostSlice";
import { getIsAdminPage } from "../../../util";
import ClickOutsideComponent from "../../../util/ClickoutCPN";
import CustomLinkPreview from "../../../util/CustomLinkPreview";
import PopupCancel from "../../../util/PopupCancel";
import UploadDisplay from "../../Message/RightSide/Conversation/MessageBar/UploadDisplay";
import MediaDisplay from "../../PostPopup/mediaDisplay";
import ViewActivity from "../../PostPopup/ViewActivity";
import OptimizedAvatar from "../../OptimizedAvatar";
import UserInfoPopover from "../../UserInfoPopover";
import Actions from "./Actions";
import PostContent from "./Content";
import "./index.css";
import PostMoreActionBox from "./MoreAction";
import Survey from "./Survey";
import { useTranslation } from "react-i18next";

const Post = ({
  post,
  isDetail = false,
  isParentPost = false,
  isReply = false,
  isFirst = false,
}: {
  post: IPost;
  isDetail?: boolean;
  isParentPost?: boolean;
  isReply?: boolean;
  isFirst?: boolean;
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = getIsAdminPage(pathname);
  const dispatch = useAppDispatch();
  const { popupCancelInfo, setPopupCancelInfo, closePopupCancel } =
    usePopupCancel();
  const postAction = useAppSelector((state: AppState) => state.post.postAction);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onOpen: Function = (): void => setIsOpen(true);
  const onClose: Function = (): void => setIsOpen(false);
  const [openPostBox, setOpenPostBox] = useState<boolean>(false);

  useSocket((socket: Socket) => {
    socket.on(Route.POST + POST_PATH.GET_ONE, ({ likesCount, postId }) => {
      if (post._id === postId) {
        dispatch(
          updatePostLike({
            postId,
            likesCount,
          })
        );
      }
    });
  }, []);

  const handleSeeDetail = () => {
    window.open(`/posts/${post._id}`, "_self");
  };

  return (
    <>
      <Card
        className={`post${isParentPost ? " post--parent" : ""}${
          isReply ? " post--reply" : ""
        }`}
      >
        <CardBody className="post__body">
          <div className="post__header">
            <div className="post__author-group">
              <OptimizedAvatar
                src={post?.authorInfo?.avatar}
                size={"md"}
                name={post?.authorInfo?.username}
                cursor={"pointer"}
                position={"relative"}
              />
              <div>
                {post?.authorInfo && (
                  <UserInfoPopover
                    user={post?.authorInfo}
                    isParentPost={isParentPost}
                    isDetail={isDetail}
                  />
                )}
              </div>
            </div>

            <div className="post__meta">
              {post?.visibility === Constants.POST_VISIBILITY.ONLY_ME && (
                <Tooltip label={t("visibilityOnlyMe")}>
                  <span>
                    <MdLock size={16} />
                  </span>
                </Tooltip>
              )}
              {post?.visibility === Constants.POST_VISIBILITY.ONLY_FOLLOWERS && (
                <Tooltip label={t("visibilityFollowers")}>
                  <span>
                    <MdPeopleAlt size={16} />
                  </span>
                </Tooltip>
              )}
              <span className="post__timestamp">
                {dayjs(post?.createdAt).fromNow()}
              </span>
              {!isParentPost && !isAdmin && (
                <div className="post__more-action">
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={Button}
                      className="post__more-action-btn"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <BsThreeDots />
                    </MenuButton>
                    <Portal>
                      <MenuList
                        zIndex={2000}
                        bg={colorMode === "dark" ? "#1c1e21" : "#edf2f7"}
                        borderRadius="12px"
                        p={1.5}
                        minW="180px"
                      >
                        <PostMoreActionBox
                          post={post}
                          setOpenPostBox={setOpenPostBox}
                          setPopupCancelInfo={setPopupCancelInfo}
                          closePopupCancel={closePopupCancel}
                        />
                      </MenuList>
                    </Portal>
                  </Menu>
                </div>
              )}
            </div>
          </div>
          <div
            className={`post__content-wrap${
              !isDetail &&
              !(postAction === PostConstants.ACTIONS.REPOST && isParentPost)
                ? " post__content-wrap--clickable"
                : " post__content-wrap--static"
            }`}
            onClick={() => {
              if (
                !isDetail &&
                !(postAction === PostConstants.ACTIONS.REPOST && isParentPost)
              ) {
                handleSeeDetail();
              }
            }}
          >
            <PostContent post={post} content={post?.content} />
            {post?.linksInfo?.length > 0 && (
              <CustomLinkPreview
                link={post?.linksInfo[post?.linksInfo?.length - 1]}
              />
            )}
          </div>
          {isParentPost && post?.quote?._id && !postAction && (
            <div
              className="post__quote post__quote--clickable"
              onClick={() => {
                router.push(`/posts/${post?.quote?._id}`);
              }}
            >
              <RiDoubleQuotesL />
              {post?.quote?.content}
            </div>
          )}
          <MediaDisplay post={post} isDetail={isDetail} isFirst={isFirst} />
          {post?.survey?.length > 0 && <Survey post={post} />}
          {post?.parentPostInfo?._id && (
            <>
              {post?.quote?._id && isParentPost ? (
                <div className="post__quote post__quote--static">
                  <RiDoubleQuotesL />
                  {post.quote.content}
                </div>
              ) : (
                <Post post={post?.parentPostInfo} isParentPost={true} />
              )}
            </>
          )}
          {post?.files?.length > 0 && (
            <UploadDisplay isPost={true} filesFromPost={post?.files} />
          )}
          {!isParentPost && (
            <div
              className={`post__actions${isDetail ? " post__actions--detail" : ""}`}
            >
              <Actions post={post} />
            </div>
          )}
          {isDetail && (
            <>
              <Divider />
              <div className="post__comment-header">
                <Text className="post__comment-label">{t("breadCmt")}</Text>
                <div className="post__view-activities" onClick={() => onOpen()}>
                  <Text>{t("seeActivities")}</Text>
                  <ChevronRightIcon />
                </div>
              </div>
              <Divider />
              <ViewActivity post={post} isOpen={isOpen} onClose={onClose} />
              {post.replies && post.replies?.length > 0 && (
                <div className="post__replies">
                  {post.replies.map((reply) => (
                    <Post key={reply._id} post={reply} isReply={true} />
                  ))}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
      {popupCancelInfo.open && (
        <PopupCancel popupCancelInfo={popupCancelInfo} />
      )}
    </>
  );
};

export default Post;
