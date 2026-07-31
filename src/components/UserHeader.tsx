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
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { IUser } from "../store/UserSlice";
import {
  changeDisplayPageData,
  showToast,
  updateSeeMedia,
} from "../store/UtilSlice";
import { addEvent } from "../util";
import ConversationBtn from "./ConversationBtn";
import FollowBtn from "./FollowBtn";
import ListPost from "./ListPost";
import SkeletonPost from "./ListPost/Post/skeleton";
import UserFollowBox from "./UserFollowBox";

const FOLLOW_TAB = {
  FOLLOWED: "followed",
  FOLLOWING: "following",
};

const TABS = {
  Bread: "",
  Replies: PostConstants.ACTIONS.REPLY,
  Reposts: PostConstants.ACTIONS.REPOST,
};

const UserHeader = ({
  user,
  usersFollow,
}: {
  user: IUser;
  usersFollow: any;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { isLoading } = useAppSelector((state: AppState) => state.post);
  const [followBox, setFollowBox] = useState({
    open: false,
    currentTab: FOLLOW_TAB.FOLLOWED,
  });

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
              onClick={() => {
                setFollowBox({
                  ...followBox,
                  open: true,
                });
              }}
            >
              {user?.followed?.length} {t("followers")}
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
          <Tabs>
            <TabList width={"100%"} maxWidth={"100%"}>
              <Tab width={"50%"} textTransform={"capitalize"}>
                <Flex flexDirection={"column"}>
                  <Text>{FOLLOW_TAB.FOLLOWED}</Text>
                  <Text fontSize={"14px"} fontWeight={500}>
                    {usersFollow.followed?.length}
                  </Text>
                </Flex>
              </Tab>
              <Tab width={"50%"} textTransform={"capitalize"}>
                <Flex flexDirection={"column"}>
                  <Text>{FOLLOW_TAB.FOLLOWING}</Text>
                  <Text fontSize={"14px"} fontWeight={500}>
                    {usersFollow.following?.length}
                  </Text>
                </Flex>
              </Tab>
            </TabList>

            <TabPanels padding={0} maxHeight={"85vh"} overflowY={"auto"}>
              <TabPanel padding={0}>
                {usersFollow.followed?.length > 0 ? (
                  usersFollow.followed?.map((user) => (
                    <UserFollowBox
                      user={user}
                      key={`user-follow-${user?._id}`}
                      inFollowBox={true}
                    />
                  ))
                ) : (
                  <Flex justifyContent={"center"} padding={"16px"}>
                    <EmptyContentSvg />
                  </Flex>
                )}
              </TabPanel>
              <TabPanel padding={0}>
                {usersFollow.following?.length > 0 ? (
                  usersFollow.following?.map((user) => (
                    <UserFollowBox
                      user={user}
                      key={`user-follow-${user?._id}`}
                      inFollowBox={true}
                    />
                  ))
                ) : (
                  <Flex justifyContent={"center"} padding={"16px"}>
                    <EmptyContentSvg />
                  </Flex>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserHeader;
