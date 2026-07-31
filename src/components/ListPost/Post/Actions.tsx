import {
  Box,
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorModeValue,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { Fragment, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosLink } from "react-icons/io";
import {
  LikeIcon,
  ReplyIcon,
  RepostIcon,
  ShareIcon,
} from "../../../assests/icons";
import { POST_PATH, Route } from "../../../Breads-Shared/APIConfig";
import { Constants } from "../../../Breads-Shared/Constants";
import PostConstants from "../../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import Socket from "../../../socket";
import { AppState } from "../../../store";
import {
  IPost,
  selectPost,
  selectPostReply,
  updatePostAction,
} from "../../../store/PostSlice";
import { updatePostStatus } from "../../../store/PostSlice/asyncThunk";
import { addEvent, getIsAdminPage } from "../../../util";
import useCopyLink from "./MoreAction/CopyLink";
import { openLoginPopupAction } from "../../../store/UtilSlice";

const ACTIONS_NAME = {
  LIKE: "like",
  UNLIKE: "unlike",
  REPLY: "reply",
  REPOST: "repost",
  SHARE: "share",
};

const Actions = ({ post }: { post: IPost }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAdmin = getIsAdminPage(pathname);
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [openSubBox, setOpenSubBox] = useState<boolean>(false);
  const { copyURL } = useCopyLink();
  const socket = Socket.getInstant();

  const handleLike = () => {
    const payload = {
      userId: userInfo._id,
      postId: post._id,
    };
    socket.emit(Route.POST + POST_PATH.LIKE, payload);
  };

  const convertStatistic = (number: number) => {
    let value = number;
    let strValue = "";
    switch (true) {
      case number >= 1000000:
        value = number / 1000000;
        strValue = "M";
        break;
      case number >= 1000:
        value = number / 1000;
        strValue = "K";
        break;
      default:
        return number;
    }
    const strArr = value.toString().split(".");
    const intValue = strArr[0];
    const firstFloatValue = strArr?.[1]?.[0] ?? "";
    return intValue + (firstFloatValue ? "." + firstFloatValue : "") + strValue;
  };

  const listActions = [
    {
      name: ACTIONS_NAME.LIKE,
      icon: <LikeIcon liked={post.usersLike?.includes(userInfo._id)} />,
      statistic: convertStatistic(post.usersLike?.length),
      onClick: () => {
        if (!userInfo?._id) {
          dispatch(openLoginPopupAction());
          return;
        }
        handleLike();
        addEvent({
          event: post.usersLike?.includes(userInfo._id)
            ? "unlike_post"
            : "like_post",
          payload: {
            postId: post._id,
          },
        });
      },
    },
    {
      name: ACTIONS_NAME.REPLY,
      statistic: post.replies?.length,
      icon: <ReplyIcon />,
      onClick: () => {
        if (!userInfo?._id) {
          dispatch(openLoginPopupAction());
          return;
        }
        dispatch(updatePostAction(PostConstants.ACTIONS.REPLY));
        dispatch(selectPostReply(post));
        dispatch(selectPost(post));
      },
    },
    {
      name: ACTIONS_NAME.REPOST,
      statistic: post?.repostNum,
      icon: <RepostIcon />,
      onClick: () => {
        if (!userInfo?._id) {
          dispatch(openLoginPopupAction());
          return;
        }
        dispatch(updatePostAction(PostConstants.ACTIONS.REPOST));
        dispatch(selectPost(post));
      },
    },
    {
      name: ACTIONS_NAME.SHARE,
      statistic: post?.share?.length,
      icon: <ShareIcon />,
      onClick: () => {
        setOpenSubBox(!openSubBox);
      },
    },
  ];

  const handleUpdatePostStatus = (status) => {
    dispatch(
      updatePostStatus({
        userId: userInfo._id,
        postId: post._id,
        status: status,
      })
    );
  };

  if (isAdmin) {
    return (
      <Flex alignItems={"center"} gap={3} width={"100%"} mt={1}>
        <Button
          flex={1}
          bg="green"
          onClick={() => {
            handleUpdatePostStatus(Constants.POST_STATUS.PUBLIC);
          }}
        >
          Accept
        </Button>
        <Button
          flex={1}
          onClick={() => {
            handleUpdatePostStatus(Constants.POST_STATUS.DELETED);
          }}
        >
          Reject
        </Button>
      </Flex>
    );
  }

  return (
    <>
      <Flex onClick={(e) => e.preventDefault()} mb={0}>
        {listActions.map(({ name, statistic, icon, onClick }, index) => {
          if (name === ACTIONS_NAME.SHARE) {
            return (
              <Popover
                isOpen={openSubBox}
                key={name}
                onClose={() => setOpenSubBox(!openSubBox)}
              >
                <PopoverTrigger>
                  <Button
                    onClick={onClick}
                    width={"32px"}
                    height={"32px"}
                    padding={"6px 10px"}
                    bg={"transparent"}
                    borderRadius={"16px"}
                    position={"relative"}
                    zIndex={0}
                  >
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  width={"fit-content"}
                  borderRadius={"8px"}
                  bg={useColorModeValue("gray.300", "gray.dark")}
                  padding={"8px 10px"}
                >
                  <PopoverBody
                    cursor={"pointer"}
                    padding={"2px 10px"}
                    borderRadius={"6px"}
                    display={"flex"}
                    gap={"12px"}
                    alignItems={"center"}
                    _hover={{
                      bg: "gray",
                      opacity: "0.7",
                    }}
                    onClick={() => {
                      copyURL(post);
                      setOpenSubBox(false);
                      addEvent({
                        event: "copy_post_link",
                        payload: {
                          postId: post._id,
                        },
                      });
                    }}
                  >
                    {t("copylink")}
                    <IoIosLink />
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            );
          } else {
            return (
              <Fragment key={name}>
                <Button
                  onClick={onClick}
                  width={"32px"}
                  height={"32px"}
                  padding={"6px 10px"}
                  bg={"transparent"}
                  borderRadius={"16px"}
                  _active={{
                    bg: "rgba(0, 0, 0, 0.1)",
                    boxShadow: "none",
                    transform: "none",
                  }}
                  zIndex={0}
                >
                  <Box
                    width={"20px"}
                    height={"20px"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {icon}
                  </Box>
                  {!!statistic && (
                    <Flex alignItems={"center"} fontSize={"14px"} pl={1}>
                      {statistic}
                    </Flex>
                  )}
                </Button>
              </Fragment>
            );
          }
        })}
      </Flex>
    </>
  );
};

export default memo(Actions);
