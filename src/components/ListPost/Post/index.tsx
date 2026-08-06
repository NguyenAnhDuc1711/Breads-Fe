"use client";

import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import moment from "moment";
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
}: {
  post: IPost;
  isDetail?: boolean;
  isParentPost?: boolean;
  isReply?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = getIsAdminPage(pathname);
  const dispatch = useAppDispatch();
  const { colorMode } = useColorMode();
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
        boxSizing={"border-box"}
        className="post-container"
        borderRadius="12px"
        border={isParentPost ? "1px solid gray" : "none"}
        boxShadow={isReply ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)"}
        bg={colorMode === "dark" ? "#202020" : "#ffffff"}
        width={"100%"}
        transition="transform 0.2s ease"
        mt={isReply ? "8px" : ""}
      >
        <CardBody padding={isReply ? "0px" : "1.25rem"}>
          <Flex justifyContent={"space-between"}>
            <Flex alignItems={"center"} gap={3}>
              <Avatar
                src={post?.authorInfo?.avatar}
                size={"md"}
                name={post?.authorInfo?.username}
                cursor={"pointer"}
                position={"relative"}
              />
              <Flex>
                {post?.authorInfo && (
                  <UserInfoPopover
                    user={post?.authorInfo}
                    isParentPost={isParentPost}
                    isDetail={isDetail}
                  />
                )}
              </Flex>
            </Flex>

            <Flex gap={4} alignItems={"center"}>
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
              <Text
                fontSize={"sm"}
                color={colorMode === "dark" ? "gray.100" : "gray.light"}
              >
                {moment(post?.createdAt).fromNow()}
              </Text>
              {!isParentPost && !isAdmin && (
                <div className="btn-more-action">
                  <ClickOutsideComponent
                    onClose={() => {
                      setOpenPostBox(false);
                    }}
                  >
                    <Button
                      bg={colorMode === "dark" ? "#181818" : "#ffffff"}
                      borderRadius={"50%"}
                      width={"32px"}
                      height={"40px"}
                      padding={"0"}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpenPostBox(!openPostBox);
                      }}
                    >
                      <BsThreeDots />
                    </Button>
                    {openPostBox && (
                      <PostMoreActionBox
                        post={post}
                        setOpenPostBox={setOpenPostBox}
                        setPopupCancelInfo={setPopupCancelInfo}
                        closePopupCancel={closePopupCancel}
                      />
                    )}
                  </ClickOutsideComponent>
                </div>
              )}
            </Flex>
          </Flex>
          <Container
            p={0}
            m={0}
            my={2}
            width={"100%"}
            cursor={
              !isDetail &&
              !(postAction === PostConstants.ACTIONS.REPOST && isParentPost)
                ? "pointer"
                : "text"
            }
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
          </Container>
          {isParentPost && post?.quote?._id && !postAction && (
            <Text
              display={"flex"}
              alignItems={"center"}
              gap={"4px"}
              color={"lightgray"}
              cursor={"pointer"}
              onClick={() => {
                router.push(`/posts/${post?.quote?._id}`);
              }}
            >
              <RiDoubleQuotesL />
              {post?.quote?.content}
            </Text>
          )}
          <MediaDisplay post={post} isDetail={isDetail} />
          {post?.survey?.length > 0 && <Survey post={post} />}
          {post?.parentPostInfo?._id && (
            <>
              {post?.quote?._id && isParentPost ? (
                <Text
                  display={"flex"}
                  alignItems={"center"}
                  gap={"4px"}
                  color={"lightgray"}
                  cursor={"text"}
                >
                  <RiDoubleQuotesL />
                  {post.quote.content}
                </Text>
              ) : (
                <Post post={post?.parentPostInfo} isParentPost={true} />
              )}
            </>
          )}
          {post?.files?.length > 0 && (
            <UploadDisplay isPost={true} filesFromPost={post?.files} />
          )}
          {!isParentPost && (
            <Flex gap={3} mt={"10px"} mb={isDetail ? "10px" : ""}>
              <Actions post={post} />
            </Flex>
          )}
          {isDetail && (
            <>
              <Divider />
              <Flex mt={4} justifyContent={"space-between"} m={1}>
                <Text p={2}>{t("breadCmt")}</Text>
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  p={2}
                  cursor={"pointer"}
                  _hover={{
                    transform: "scale(1.05)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onClick={() => onOpen()}
                >
                  <Text>{t("seeActivities")}</Text>
                  <ChevronRightIcon />
                </Flex>
              </Flex>
              <Divider />
              <ViewActivity post={post} isOpen={isOpen} onClose={onClose} />
              {post.replies && post.replies?.length > 0 && (
                <Container
                  width={"100%"}
                  maxWidth={"100%"}
                  padding={"12px 0"}
                  mx={0}
                  boxShadow={"none"}
                  borderY={"1px solid gray"}
                >
                  {post.replies.map((reply) => (
                    <Post key={reply._id} post={reply} isReply={true} />
                  ))}
                </Container>
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
