"use client";

import { Avatar, Button, Divider, Text } from "./ui/primitives";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Portal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "./ui/primitives";
import "./UserHeader.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CgDanger, CgMoreO } from "react-icons/cg";
import { FaLink } from "react-icons/fa";
import NextLink from "next/link";
import { EmptyContentSvg } from "../assests/icons";
import { Route, USER_PATH } from "../Breads-Shared/APIConfig";
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { GET } from "../config/API";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { updateListPost, updatePostListLoading } from "../store/PostSlice";
import { useGetUserPostsQuery } from "../store/api/postApi";
import { IUser } from "../store/UserSlice";
import {
  changeDisplayPageData,
  showToast,
  updateHasMoreData,
  updateSeeMedia,
} from "../store/UtilSlice";
import { addEvent } from "../util";
import ConversationBtn from "./ConversationBtn";
import FollowBtn from "./FollowBtn";
import InfiniteScroll from "./InfiniteScroll";
import ListPost from "./ListPost";
import OptimizedAvatar from "./OptimizedAvatar";
import SkeletonPost from "./ListPost/Post/skeleton";
import UserFollowBox from "./UserFollowBox";
import UserFollowBoxSkeleton from "./UserFollowBox/skeleton";

const FOLLOW_TAB = {
  FOLLOWED: "followed",
  FOLLOWING: "following",
};

const TABS = {
  Bread: "",
  Replies: PostConstants.ACTIONS.REPLY,
  Reposts: PostConstants.ACTIONS.REPOST,
};

const EMPTY_FOLLOW_TAB_STATE = {
  items: [] as any[],
  loaded: false,
};

const UserHeader = ({ user }: { user: IUser }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const displayPageData = useAppSelector(
    (state: AppState) => state.util.displayPageData,
  );
  const { data: userPosts, isFetching: isLoading } = useGetUserPostsQuery(
    { userId: user._id, displayPageData },
    { skip: !user._id },
  );

  useEffect(() => {
    dispatch(updatePostListLoading(isLoading));
    if (userPosts) {
      dispatch(updateListPost(userPosts));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosts, isLoading]);
  const [followBox, setFollowBox] = useState({
    open: false,
    currentTab: FOLLOW_TAB.FOLLOWED,
  });
  const [followLists, setFollowLists] = useState({
    [FOLLOW_TAB.FOLLOWED]: EMPTY_FOLLOW_TAB_STATE,
    [FOLLOW_TAB.FOLLOWING]: EMPTY_FOLLOW_TAB_STATE,
  });

  const loadFollowPage = async (type: string, page: number) => {
    const data = await GET({
      path: `${Route.USER}${USER_PATH.USERS_FOLLOW}`,
      params: { userId: user._id, type, page, limit: 20 },
    });
    setFollowLists((prev) => ({
      ...prev,
      [type]: {
        items:
          page === 1
            ? data?.users ?? []
            : [...prev[type].items, ...(data?.users ?? [])],
        loaded: true,
      },
    }));
    dispatch(updateHasMoreData(!!data?.hasMore));
  };

  const openFollowBox = (tab: string) => {
    setFollowBox({ open: true, currentTab: tab });
  };

  const copyURL = () => {
    addEvent({
      event: "copy_user_link",
      payload: {
        userId: user?._id,
      },
    });
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      dispatch(
        showToast({
          title: "Success",
          description: t("Profilelinkcopied"),
          status: "success",
        })
      );
    });
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleSeeAvatar = () => {
    addEvent({
      event: "see_avatar",
      payload: {
        userId: user?._id,
      },
    });
    dispatch(
      updateSeeMedia({
        open: true,
        media: [
          {
            url: user?.avatar,
            type: "image",
          },
        ],
        currentMediaIndex: 0,
      })
    );
  };
  const date = user?.createdAt ? new Date(user?.createdAt) : new Date();
  const month = date.toLocaleString("vi-VN");
  const year = date.toLocaleString("vi-VN");

  return (
    <>
      <div className="user-header">
        <div className="user-header__top">
          <div>
            <Text className="user-header__name">{user?.name}</Text>
            <div className="user-header__username-row">
              <Text className="user-header__username">{user?.username}</Text>
              <Text className="user-header__badge">Breads.net</Text>
            </div>
          </div>
          <div>
            {user?.avatar && (
              <OptimizedAvatar
                name={user?.name}
                src={user?.avatar}
                size={{
                  base: "md",
                  md: "xl",
                }}
                onClick={() => handleSeeAvatar()}
              />
            )}
            {!user?.avatar && (
              <Avatar
                name={user?.name}
                src="https://bit.ly/broken-link"
                size={{
                  base: "md",
                  md: "xl",
                }}
              />
            )}
          </div>
        </div>
        <Text>{user?.bio}</Text>
        {userInfo._id === user?._id && (
          <NextLink href="/update">
            <Button className="user-header__update-btn btn-subtle" size={"sm"}>
              {" "}
              {t("updateprofile")}
            </Button>
          </NextLink>
        )}
        {userInfo._id !== user?._id && (
          <div className="user-header__actions-row">
            <FollowBtn user={user} />
            <ConversationBtn user={user} />
          </div>
        )}
        <div className="user-header__stats-row">
          <div className="user-header__followers-group">
            <Text
              className="user-header__followers-text"
              onClick={() => openFollowBox(FOLLOW_TAB.FOLLOWED)}
            >
              {user?.followersCount ?? 0} {t("followers")}
            </Text>
          </div>
          <div>
            {user?._id !== userInfo?._id && (
              <div className="icon-container">
                <Menu>
                  <MenuButton>
                    <CgMoreO size={24} cursor={"pointer"} />
                  </MenuButton>
                  <Portal>
                    <MenuList
                      bg="gray.dark"
                      boxShadow="md"
                      borderRadius={"10px"}
                    >
                      <MenuItem
                        className="user-header__menu-item"
                        onClick={copyURL}
                      >
                        <FaLink />
                        {t("copylink")}
                      </MenuItem>
                      <MenuItem className="user-header__menu-item">
                        <div
                          className="user-header__menu-item-trigger"
                          onClick={onOpen}
                        >
                          <CgDanger />
                          {t("aboutthisprofile")}
                        </div>

                        <Modal
                          closeOnOverlayClick={true}
                          isOpen={isOpen}
                          onClose={onClose}
                        >
                          <ModalOverlay />
                          <ModalContent className="user-header__about-modal">
                            <ModalBody className="user-header__about-modal-body">
                              <div className="user-header__about-row">
                                <div className="user-header__about-col">
                                  <Text>{t("name")}</Text>
                                  <div>{`${user.name}(@${user.username})`}</div>
                                </div>
                                <Avatar src={user.avatar} size="lg" />
                              </div>
                              <Divider width={"270px"} borderWidth="1px" />
                              <div className="user-header__about-row--spaced">
                                <div className="user-header__about-col">
                                  <Text>{t("joindate")}</Text>
                                  <div>{`${month} ${t("year")} ${year}`}</div>
                                </div>
                              </div>
                            </ModalBody>
                          </ModalContent>
                        </Modal>
                      </MenuItem>
                    </MenuList>
                  </Portal>
                </Menu>
              </div>
            )}
          </div>
        </div>

        <Tabs width={"100%"}>
          <TabList width={"100%"}>
            {Object.keys(TABS).map((key) => (
              <Tab
                key={`tab-${key}`}
                className="user-header__tab"
                onClick={() => {
                  addEvent({
                    event: "change_user_post_tab",
                    payload: {
                      tab: TABS[key],
                    },
                  });
                  dispatch(changeDisplayPageData(TABS[key]));
                }}
              >
                <Text fontWeight={"bold"}>{t(key)}</Text>
              </Tab>
            ))}
          </TabList>

          <TabPanels width={"100%"}>
            {Object.keys(TABS).map((tab) => (
              <TabPanel key={tab} className="user-header__tab-panel">
                {isLoading ? (
                  <div className="user-header__skeleton-list">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SkeletonPost key={`skeleton-${num}`} />
                    ))}
                  </div>
                ) : (
                  <ListPost />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
      <Modal
        isOpen={followBox.open}
        onClose={() => {
          setFollowBox({
            open: false,
            currentTab: FOLLOW_TAB.FOLLOWED,
          });
        }}
      >
        <ModalOverlay />
        <ModalContent className="user-header__follow-modal-content">
          <Tabs
            isLazy
            index={followBox.currentTab === FOLLOW_TAB.FOLLOWED ? 0 : 1}
            onChange={(index) => {
              const tab =
                index === 0 ? FOLLOW_TAB.FOLLOWED : FOLLOW_TAB.FOLLOWING;
              setFollowBox({ ...followBox, currentTab: tab });
            }}
          >
            <TabList width={"100%"} maxWidth={"100%"}>
              <Tab className="user-header__follow-tab">
                <div className="user-header__follow-tab-inner">
                  <Text>{FOLLOW_TAB.FOLLOWED}</Text>
                  <Text className="user-header__follow-tab-count">
                    {user?.followersCount ?? 0}
                  </Text>
                </div>
              </Tab>
              <Tab className="user-header__follow-tab">
                <div className="user-header__follow-tab-inner">
                  <Text>{FOLLOW_TAB.FOLLOWING}</Text>
                  <Text className="user-header__follow-tab-count">
                    {user?.followingCount ?? 0}
                  </Text>
                </div>
              </Tab>
            </TabList>

            <TabPanels className="user-header__follow-panels">
              {[FOLLOW_TAB.FOLLOWED, FOLLOW_TAB.FOLLOWING].map((tab) => (
                <TabPanel key={tab}>
                  <InfiniteScroll
                    queryFc={(page) => loadFollowPage(tab, page)}
                    data={followLists[tab].items}
                    cpnFc={(followUser) => (
                      <UserFollowBox
                        user={followUser}
                        key={`user-follow-${followUser?._id}`}
                        inFollowBox={true}
                      />
                    )}
                    skeletonCpn={<UserFollowBoxSkeleton inFollowBox={true} />}
                  />
                  {followLists[tab].loaded &&
                    followLists[tab].items.length === 0 && (
                      <div className="user-header__follow-empty">
                        <EmptyContentSvg />
                      </div>
                    )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserHeader;
