import { Button, useColorModeValue } from "../../ui/primitives";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from "../../ui/primitives";
import "./Actions.css";
import { usePathname } from "next/navigation";
import { Fragment, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosLink } from "react-icons/io";
import { MdPublic } from "react-icons/md";
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
  toggleLikedByMe,
  updatePostAction,
} from "../../../store/PostSlice";
import {
  updatePostStatus,
  updatePostVisibility,
} from "../../../store/PostSlice/asyncThunk";
import { addEvent, getIsAdminPage } from "../../../util";
import { GA_EVENTS, sendGaEvent } from "../../../util/gtmEvents";
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
    dispatch(toggleLikedByMe({ postId: post._id }));
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

  // Repost is a UX-layer gate only — Be (task 011) is the real enforcement,
  // rejecting reposts of non-PUBLIC content with a 400. Undefined visibility
  // (pre-backfill posts) is treated as PUBLIC, matching the schema default.
  const canRepost =
    (post.visibility ?? Constants.POST_VISIBILITY.PUBLIC) ===
    Constants.POST_VISIBILITY.PUBLIC;

  const listActions = [
    {
      name: ACTIONS_NAME.LIKE,
      icon: <LikeIcon liked={!!post.likedByMe} />,
      statistic: convertStatistic(post.likesCount ?? 0),
      onClick: () => {
        if (!userInfo?._id) {
          dispatch(openLoginPopupAction());
          return;
        }
        const wasLiked = !!post.likedByMe;
        handleLike();
        addEvent({
          event: wasLiked ? "unlike_post" : "like_post",
          payload: {
            postId: post._id,
          },
        });
        sendGaEvent({
          event: wasLiked ? GA_EVENTS.UNLIKE_POST : GA_EVENTS.LIKE_POST,
          params: { post_id: post._id },
        });
      },
    },
    {
      name: ACTIONS_NAME.REPLY,
      // `repliesCount` là counter riêng trên post (không còn suy từ `replies.length` — danh sách
      // reply giờ tải phân trang, không có mặt trên card feed/list, chỉ trang detail mới tải).
      statistic: post.repliesCount ?? 0,
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
    ...(canRepost
      ? [
          {
            name: ACTIONS_NAME.REPOST,
            statistic: post?.repostNum,
            icon: <RepostIcon />,
            onClick: () => {
              if (!userInfo?._id) {
                dispatch(openLoginPopupAction());
                return;
              }
              if (!canRepost) return;
              dispatch(updatePostAction(PostConstants.ACTIONS.REPOST));
              dispatch(selectPost(post));
            },
          },
        ]
      : []),
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

  const handleUpdatePostVisibility = (visibility: number) => {
    dispatch(
      updatePostVisibility({
        userId: userInfo._id,
        postId: post._id,
        visibility: visibility,
      })
    );
  };

  const isAuthor = !!userInfo?._id && userInfo._id === post.authorId;
  const VISIBILITY_OPTIONS = [
    { value: Constants.POST_VISIBILITY.PUBLIC, label: t("visibilityPublic") },
    {
      value: Constants.POST_VISIBILITY.ONLY_FOLLOWERS,
      label: t("visibilityFollowers"),
    },
    {
      value: Constants.POST_VISIBILITY.ONLY_ME,
      label: t("visibilityOnlyMe"),
    },
  ];

  if (isAdmin) {
    return (
      <div className="post-actions post-actions--admin">
        <Button
          className="post-actions__admin-btn post-actions__admin-btn--accept"
          onClick={() => {
            handleUpdatePostStatus(Constants.POST_STATUS.PUBLIC);
          }}
        >
          Accept
        </Button>
        <Button
          className="post-actions__admin-btn btn-subtle"
          onClick={() => {
            handleUpdatePostStatus(Constants.POST_STATUS.DELETED);
          }}
        >
          Reject
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="post-actions" onClick={(e) => e.preventDefault()}>
        {listActions.map(({ name, statistic, icon, onClick }, index) => {
          if (name === ACTIONS_NAME.SHARE) {
            return (
              <Popover
                isOpen={openSubBox}
                key={name}
                onClose={() => setOpenSubBox(!openSubBox)}
              >
                <PopoverTrigger>
                  <Button className="post-actions__btn" onClick={onClick}>
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="post-actions__share-popover"
                  bg={useColorModeValue("gray.300", "gray.dark")}
                >
                  <PopoverBody
                    className="post-actions__share-item"
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
                <Button className="post-actions__btn" onClick={onClick}>
                  <div className="post-actions__icon">{icon}</div>
                  {!!statistic && (
                    <div className="post-actions__stat">{statistic}</div>
                  )}
                </Button>
              </Fragment>
            );
          }
        })}
        {isAuthor && (
          <Menu>
            <MenuButton className="post-actions__btn">
              <MdPublic size={20} />
            </MenuButton>
            <Portal>
              <MenuList zIndex={3100}>
                {VISIBILITY_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleUpdatePostVisibility(option.value)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
        )}
      </div>
    </>
  );
};

export default memo(Actions);
