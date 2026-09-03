import { Avatar, Button, Divider, Spinner, Text } from "../ui/primitives";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "../ui/primitives";
import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import { BsChatRightQuote } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegCommentDots, FaRetweet } from "react-icons/fa6";
import { IoArrowBack, IoClose, IoChevronForward } from "react-icons/io5";
import { TbMessageReply } from "react-icons/tb";
import { addEvent } from "../../util";
import { IPost } from "../../store/PostSlice";
import { useTranslation } from "react-i18next";
import { GET } from "../../config/API";
import { Route } from "../../Breads-Shared/APIConfig";
import "./ViewActivity.css";

type TabType = "overview" | "likes" | "comments" | "reposts";

interface InteractedUser {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  commentContent?: string;
  commentCreatedAt?: string;
}

const ViewActivity = ({
  post,
  isOpen,
  onClose,
}: {
  post: IPost;
  isOpen: boolean;
  onClose: Function;
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [usersList, setUsersList] = useState<InteractedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      addEvent({
        event: "see_post_activity",
        payload: {
          postId: post._id,
        },
      });
      setActiveTab("overview");
      setUsersList([]);
    }
  }, [isOpen, post._id]);

  const fetchUsersByTab = useCallback(
    async (tab: "likes" | "comments" | "reposts") => {
      setLoading(true);
      try {
        const res = await GET({
          path: `${Route.POST}/${post._id}/activities`,
          params: { type: tab, limit: 50 },
        });
        if (res && res.users) {
          setUsersList(res.users);
          setTotalCount(res.total ?? res.users.length);
        } else {
          setUsersList([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("fetchUsersByTab error:", err);
        setUsersList([]);
      } finally {
        setLoading(false);
      }
    },
    [post._id]
  );

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== "overview") {
      fetchUsersByTab(tab);
    }
  };

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case "likes":
        return t("countLike") || "Likes";
      case "comments":
        return t("countCmt") || "Comments";
      case "reposts":
        return t("countRepost") || "Reposts";
      default:
        return t("viewActTitle") || "Activities in this post";
    }
  };

  const actionsArray = [
    {
      tab: "likes" as TabType,
      icon: CiHeart,
      activeIcon: FaHeart,
      num: post.likesCount ?? 0,
      name: t("countLike") || "Likes",
      color: "#e53e3e",
      btnText: "Xem danh sách",
    },
    {
      tab: "comments" as TabType,
      icon: TbMessageReply,
      activeIcon: FaRegCommentDots,
      num: post.repliesCount ?? 0,
      name: t("countCmt") || "Comments",
      color: "#3182ce",
      btnText: "Xem bình luận",
    },
    {
      tab: "reposts" as TabType,
      icon: BsChatRightQuote,
      activeIcon: FaRetweet,
      num: post?.repostNum ?? 0,
      name: t("countRepost") || "Reposts",
      color: "#38a169",
      btnText: "Xem chia sẻ",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} isCentered size="md">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent className="view-activity-modal">
        <div className="view-activity-modal__header-bar">
          {activeTab !== "overview" ? (
            <button
              type="button"
              className="view-activity-modal__back-btn"
              onClick={() => setActiveTab("overview")}
              aria-label="Back to overview"
            >
              <IoArrowBack size={20} />
            </button>
          ) : (
            <div className="view-activity-modal__header-placeholder" />
          )}

          <ModalHeader className="view-activity-modal__header-title">
            {getTabTitle(activeTab)}
          </ModalHeader>

          <button
            type="button"
            className="view-activity-modal__close-btn"
            onClick={() => onClose()}
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Tab pills switcher if in subview */}
        {activeTab !== "overview" && (
          <div className="view-activity-modal__subtabs">
            {actionsArray.map((item) => (
              <button
                type="button"
                key={item.tab}
                className={`view-activity-modal__subtab-btn${
                  activeTab === item.tab
                    ? " view-activity-modal__subtab-btn--active"
                    : ""
                }`}
                onClick={() => handleSelectTab(item.tab)}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
                <span className="view-activity-modal__subtab-badge">
                  {item.num}
                </span>
              </button>
            ))}
          </div>
        )}

        <ModalBody className="view-activity-modal__body">
          {activeTab === "overview" ? (
            <>
              {/* Post Summary Card */}
              <div className="view-activity-modal__summary">
                <Avatar
                  src={post.authorInfo?.avatar}
                  width="44px"
                  height="44px"
                  className="view-activity-modal__summary-avatar"
                />
                <div className="view-activity-modal__summary-body">
                  <Text className="view-activity-modal__summary-username">
                    {post.authorInfo?.name || post.authorInfo?.username}
                    <span className="view-activity-modal__summary-handle">
                      @{post.authorInfo?.username}
                    </span>
                  </Text>
                  <Text className="view-activity-modal__summary-content">
                    {post.content || "(No content)"}
                  </Text>
                </div>
              </div>

              {/* Action Rows */}
              <div className="view-activity-modal__stat-list">
                {actionsArray.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      className="view-activity-modal__stat-card"
                      key={item.tab}
                      onClick={() => handleSelectTab(item.tab)}
                    >
                      <div className="view-activity-modal__stat-left">
                        <div
                          className="view-activity-modal__stat-icon-wrapper"
                          style={{
                            backgroundColor: `${item.color}18`,
                            color: item.color,
                          }}
                        >
                          <IconComp size={22} />
                        </div>
                        <div className="view-activity-modal__stat-meta">
                          <Text className="view-activity-modal__stat-name">
                            {item.name}
                          </Text>
                          <Text className="view-activity-modal__stat-count">
                            {item.num} tương tác
                          </Text>
                        </div>
                      </div>

                      <div className="view-activity-modal__stat-right">
                        <Button
                          type="button"
                          className="view-activity-modal__view-btn"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleSelectTab(item.tab);
                          }}
                        >
                          <span>{item.btnText}</span>
                          <IoChevronForward size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="view-activity-modal__users-list-wrap">
              {loading ? (
                <div className="view-activity-modal__loading">
                  <Spinner size="md" />
                  <Text mt={3}>Đang tải danh sách người dùng...</Text>
                </div>
              ) : usersList.length === 0 ? (
                <div className="view-activity-modal__empty">
                  <Text className="view-activity-modal__empty-text">
                    Chưa có người dùng nào tương tác cho mục này.
                  </Text>
                </div>
              ) : (
                <div className="view-activity-modal__users-list">
                  {usersList.map((user) => (
                    <div
                      key={user._id}
                      className="view-activity-modal__user-item"
                    >
                      <NextLink
                        href={`/users/${user._id}`}
                        className="view-activity-modal__user-link"
                        onClick={() => onClose()}
                      >
                        <Avatar
                          src={user.avatar}
                          width="44px"
                          height="44px"
                          className="view-activity-modal__user-avatar"
                        />
                        <div className="view-activity-modal__user-info">
                          <Text className="view-activity-modal__user-name">
                            {user.name || user.username}
                          </Text>
                          <Text className="view-activity-modal__user-handle">
                            @{user.username}
                          </Text>
                          {user.commentContent && (
                            <div className="view-activity-modal__comment-bubble">
                              <Text className="view-activity-modal__comment-text">
                                "{user.commentContent}"
                              </Text>
                            </div>
                          )}
                          {user.bio && !user.commentContent && (
                            <Text className="view-activity-modal__user-bio">
                              {user.bio}
                            </Text>
                          )}
                        </div>
                      </NextLink>

                      <NextLink
                        href={`/users/${user._id}`}
                        className="view-activity-modal__profile-btn"
                        onClick={() => onClose()}
                      >
                        Xem trang
                      </NextLink>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewActivity;
