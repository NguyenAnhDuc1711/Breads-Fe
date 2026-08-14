import { Avatar, AvatarBadge } from "./ui/primitives";
import { Skeleton } from "./ui/primitives";
import "./Activity.css";
import dayjs from "../util/dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiSolidShare } from "react-icons/bi";
import { BsThreads } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { FaRepeat, FaUser } from "react-icons/fa6";
import { IoImageOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { EmptyContentSvg } from "../assests/icons";
import { Constants } from "../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import FollowBtn from "./FollowBtn";
import { updateHasNotification } from "../store/NotificationSlice";

const Activity = ({ currentPage }: { currentPage: string }) => {
  const dispatch = useAppDispatch();
  const navigate = useRouter().push;
  const { t } = useTranslation();
  const { notifications, isLoading } = useAppSelector(
    (state: AppState) => state.notification
  );
  const [uniqueNotifications, setUniqueNotifications] = useState<any>([]);

  useEffect(() => {
    const seen = new Set();
    const unique = (notifications ?? []).filter((notification) => {
      if (!seen.has(notification._id)) {
        seen.add(notification._id);
        return true;
      }
      return false;
    });
    setUniqueNotifications(unique);
  }, [notifications]);

  const { LIKE, FOLLOW, REPLY, REPOST, TAG } = Constants.NOTIFICATION_ACTION;
  const actionList = [
    {
      name: LIKE,
      icon: <FaHeart color="white" size={12} />,
      color: "red.600",
      actionText: t("liked"),
    },
    {
      name: FOLLOW,
      icon: <FaUser color="white" size={12} />,
      color: "purple.500",
      actionText: t("followed"),
    },
    {
      name: REPLY,
      icon: <BiSolidShare color="white" size={12} />,
      color: "blue.500",
      actionText: t("replied"),
    },
    {
      name: REPOST,
      icon: <FaRepeat color="white" size={12} />,
      color: "#c329bf",
      actionText: t("reposted"),
    },
    {
      name: TAG,
      icon: <BsThreads color="white" size={12} />,
      color: "green.500",
      actionText: t("tagged"),
    },
  ];

  const filteredNotifications = (() => {
    switch (currentPage) {
      case "follows":
        return uniqueNotifications.filter((item) => item.action === FOLLOW);
      case "likes":
        return uniqueNotifications.filter((item) => item.action === LIKE);
      case "reposts":
        return uniqueNotifications.filter((item) => item.action === REPOST);
      case "replies":
        return uniqueNotifications.filter((item) => item.action === REPLY);
      case "tags":
        return uniqueNotifications.filter((item) => item.action === TAG);
      default:
        return uniqueNotifications;
    }
  })();
  const comeToPost = (postId) => {
    navigate(`/posts/${postId}`);
  };
  const comeToUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const getEmptyMessage = () => {
    switch (currentPage) {
      case "follows":
        return t("noFollows");
      case "likes":
        return t("noLikes");
      case "reposts":
        return t("noReposts");
      case "replies":
        return t("noReplies");
      case "tags":
        return t("noTags");
      default:
        return t("noActivity");
    }
  };

  if (isLoading && filteredNotifications.length === 0) {
    return (
      <div className="activity-skeleton-list">
        {[1, 2, 3, 4, 5].map((num) => (
          <Skeleton
            key={`activity-skeleton-${num}`}
            height="64px"
            borderRadius="10px"
            startColor="#202020"
            endColor="#2a2a2a"
          />
        ))}
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="activity-empty">
        <EmptyContentSvg />
        <p className="activity-empty__text">{getEmptyMessage()}</p>
      </div>
    );
  }

  return (
    <>
      {filteredNotifications.map((item) => {
        const actionDetails = actionList.find(
          (action) => action.name === item.action
        );
        return (
          <div
            key={item._id}
            className="activity-item"
            onClick={() => dispatch(updateHasNotification(false))}
          >
            {item.action !== FOLLOW ? (
              <div className="activity-item__main">
                <Avatar
                  className="activity-item__avatar"
                  src={item.FromUserDetails?.avatar}
                >
                  <AvatarBadge
                    boxSize="1.4em"
                    bg={actionDetails?.color}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {actionDetails?.icon}
                  </AvatarBadge>
                </Avatar>
                <div className="activity-item__body">
                  <div className="activity-item__header">
                    <span
                      className="activity-item__username"
                      onClick={() => comeToUser(item.fromUser)}
                    >
                      {item.FromUserDetails?.username || "Unknown User"}
                    </span>
                    <span className="activity-item__time">
                      {item.createdAt
                        ? dayjs(new Date(item.createdAt)).fromNow()
                        : "Unknown time"}
                    </span>
                  </div>
                  <span
                    className="activity-item__content"
                    onClick={() => comeToPost(item.target)}
                  >
                    {item.postDetails?.content ? (
                      item.postDetails.content
                    ) : (
                      <IoImageOutline />
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="activity-item__header--spread"
                onClick={() => dispatch(updateHasNotification(false))}
              >
                <div className="activity-item__main">
                  <Avatar
                    className="activity-item__avatar"
                    src={item.FromUserDetails?.avatar}
                  >
                    <AvatarBadge
                      boxSize="1.4em"
                      bg={actionDetails?.color}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {actionDetails?.icon}
                    </AvatarBadge>
                  </Avatar>
                  <div className="activity-item__body">
                    <div className="activity-item__header--spread">
                      <span
                        className="activity-item__username"
                        onClick={() => comeToUser(item.fromUser)}
                      >
                        {item.FromUserDetails?.username || "Unknown User"}
                      </span>
                      <span className="activity-item__time--nowrap">
                        {item.createdAt
                          ? dayjs(new Date(item.createdAt)).fromNow()
                          : "Unknown time"}
                      </span>
                    </div>

                    {item.name !== FOLLOW && (
                      <span className="activity-item__action-text">
                        {actionDetails?.actionText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="activity-item__follow-row">
                  <FollowBtn user={item.FromUserDetails} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Activity;
