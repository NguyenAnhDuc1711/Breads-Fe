"use client";

import { Avatar } from "@chakra-ui/avatar";
import { Box, Divider, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import {
  Button,
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
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
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
import { getUserPosts } from "../store/PostSlice/asyncThunk";
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
  const { isLoading } = useAppSelector((state: AppState) => state.post);
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
  const hoverColor = useColorModeValue("cbg.light", "cbg.dark");
  const bgColor = useColorModeValue("cuse.light", "cuse.dark");
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
      <VStack gap={4} alignItems={"start"} padding={"4px"}>
        <Flex justifyContent={"space-between"} w={"full"}>
          <Box>
            <Text fontSize={"2xl"}>{user?.name}</Text>
            <Flex gap={2} alignItems={"center"}>
              <Text fontSize={"sm"}>{user?.username}</Text>
              <Text
                fontSize={"xs"}
                bg={"gray.dark"}
                color={"gray.light"}
                p={1}
                borderRadius={"full"}
              >
                Breads.net
              </Text>
            </Flex>
          </Box>
          <Box>
            {user?.avatar && (
              <Avatar
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
          </Box>
        </Flex>
        <Text>{user?.bio}</Text>
        {userInfo._id === user?._id && (
          <Link as={NextLink} href="/update">
            <Button size={"sm"} w={"full"}>
              {" "}
              {t("updateprofile")}
            </Button>
          </Link>
        )}
        {userInfo._id !== user?._id && (
          <Flex width={"100%"} gap={4}>
            <FollowBtn user={user} />
            <ConversationBtn user={user} />
          </Flex>
        )}
        <Flex w={"full"} justifyContent={"space-between"}>
          <Flex gap={2} alignItems={"center"}>
            <Text
              _hover={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
              color={"gray.light"}
              onClick={() => openFollowBox(FOLLOW_TAB.FOLLOWED)}
            >
              {user?.followersCount ?? 0} {t("followers")}
            </Text>
          </Flex>
          <Flex>
            {user?._id !== userInfo?._id && (
              <Box className="icon-container">
                <Menu>
                  <MenuButton>
                    <CgMoreO size={24} cursor={"pointer"} />
                  </MenuButton>
                  <Portal>
                    <MenuList
                      bg="gray.dark"
                      boxShadow="md"
                      py={2}
                      borderRadius={"10px"}
                    >
                      <MenuItem
                        bg="gray.dark"
                        color="white"
                        _hover={{ bg: hoverColor }}
                        py={3}
                        px={4}
                        display="flex"
                        borderRadius={"10px"}
                        alignItems="center"
                        gap={2}
                        onClick={copyURL}
                      >
                        <FaLink />
                        {t("copylink")}
                      </MenuItem>
                      <MenuItem
                        bg="gray.dark"
                        color="white"
                        _hover={{ bg: hoverColor }}
                        py={3}
                        px={4}
                        display="flex"
                        borderRadius={"10px"}
                        alignItems="center"
                        gap={2}
                      >
                        <Box
                          onClick={onOpen}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <CgDanger />
                          {t("aboutthisprofile")}
                        </Box>

                        <Modal
                          closeOnOverlayClick={true}
                          isOpen={isOpen}
                          onClose={onClose}
                        >
                          <ModalOverlay />
                          <ModalContent
                            w={"400px"}
                            bg={bgColor}
                            borderRadius={"10px"}
                          >
                            <ModalBody pb={6}>
                              <Flex justifyContent={"space-between"} mt={2}>
                                <Flex direction={"column"}>
                                  <Text>{t("name")}</Text>
                                  <Box>{`${user.name}(@${user.username})`}</Box>
                                </Flex>
                                <Avatar src={user.avatar} size="lg" />
                              </Flex>
                              <Divider width={"270px"} borderWidth="1px" />
                              <Flex justifyContent={"space-between"} my={2}>
                                <Flex direction={"column"}>
                                  <Text>{t("joindate")}</Text>
                                  <Box>{`${month} ${t("year")} ${year}`}</Box>
                                </Flex>
                              </Flex>
                            </ModalBody>
                          </ModalContent>
                        </Modal>
                      </MenuItem>
                    </MenuList>
                  </Portal>
                </Menu>
              </Box>
            )}
          </Flex>
        </Flex>

        <Tabs width={"100%"}>
          <TabList width={"100%"}>
            {Object.keys(TABS).map((key) => (
              <Tab
                key={`tab-${key}`}
                flex={1}
                borderBottom={"1.5px solid white"}
                justifyContent={"center"}
                pb={3}
                cursor={"pointer"}
                onClick={() => {
                  addEvent({
                    event: "change_user_post_tab",
                    payload: {
                      tab: TABS[key],
                    },
                  });
                  dispatch(changeDisplayPageData(TABS[key]));
                  dispatch(getUserPosts(user._id));
                }}
              >
                <Text fontWeight={"bold"}>{t(key)}</Text>
              </Tab>
            ))}
          </TabList>

          <TabPanels width={"100%"}>
            {Object.keys(TABS).map((tab) => (
              <TabPanel key={tab} p={0} mt={4} width={"100%"}>
                {isLoading ? (
                  <Flex direction="column" gap={2}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SkeletonPost key={`skeleton-${num}`} />
                    ))}
                  </Flex>
                ) : (
                  <ListPost />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
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
        <ModalContent overflow={"hidden"}>
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
              <Tab width={"50%"} textTransform={"capitalize"}>
                <Flex flexDirection={"column"}>
                  <Text>{FOLLOW_TAB.FOLLOWED}</Text>
                  <Text fontSize={"14px"} fontWeight={500}>
                    {user?.followersCount ?? 0}
                  </Text>
                </Flex>
              </Tab>
              <Tab width={"50%"} textTransform={"capitalize"}>
                <Flex flexDirection={"column"}>
                  <Text>{FOLLOW_TAB.FOLLOWING}</Text>
                  <Text fontSize={"14px"} fontWeight={500}>
                    {user?.followingCount ?? 0}
                  </Text>
                </Flex>
              </Tab>
            </TabList>

            <TabPanels padding={0} maxHeight={"50vh"} overflowY={"auto"}>
              {[FOLLOW_TAB.FOLLOWED, FOLLOW_TAB.FOLLOWING].map((tab) => (
                <TabPanel padding={0} key={tab}>
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
                      <Flex justifyContent={"center"} padding={"16px"}>
                        <EmptyContentSvg />
                      </Flex>
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
