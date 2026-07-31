"use client";

import { Box, Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { BiLogIn } from "react-icons/bi";
import { BsFilePost } from "react-icons/bs";
import { FaFacebookMessenger, FaRegHeart, FaUsers } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { GrHomeRounded, GrOverview } from "react-icons/gr";
import { MdAdd } from "react-icons/md";
import { TbMessageReport } from "react-icons/tb";
import { LeftSideBarWidth } from "..";
import { NOTIFICATION_PATH, Route } from "../../Breads-Shared/APIConfig";
import { Constants } from "../../Breads-Shared/Constants";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import useSocket from "../../hooks/useSocket";
import { AppState } from "../../store";
import {
  addNotification,
  updateHasNotification,
} from "../../store/NotificationSlice";
import { updatePostAction } from "../../store/PostSlice";
import { getCurrentPage, getPathForPage } from "../../util/route";
import SidebarMenu from "./SidebarMenu";

const LeftSideBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode } = useColorMode();

  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const isAdmin = userInfo?.role === Constants.USER_ROLE.ADMIN;
  // Active item now comes from the URL, not from Redux (AD-4).
  const currentPage = getCurrentPage(pathname);
  const hasNewNotification = useAppSelector(
    (state: AppState) => state.notification.hasNewNotification
  );

  const linkIcon = useMemo(
    () => (
      <Box position="relative" display="inline-block">
        <FaRegHeart size={24} />
        {hasNewNotification && (
          <Box
            position="absolute"
            top="-2px"
            right="-6px"
            width="12px"
            height="12px"
            borderRadius="full"
            bg="red"
            border="2px solid"
            borderColor={colorMode === "dark" ? "gray.800" : "white"}
          />
        )}
      </Box>
    ),
    [hasNewNotification]
  );

  const messIcon = useMemo(
    () => (
      <Box position="relative" display="inline-block">
        <FaFacebookMessenger size={24} />
        {userInfo.hasNewMsg && (
          <Box
            position="absolute"
            top="-2px"
            right="-6px"
            width="12px"
            height="12px"
            borderRadius="full"
            bg="red"
            border="2px solid"
            borderColor={colorMode === "dark" ? "gray.800" : "white"}
          />
        )}
      </Box>
    ),
    [userInfo.hasNewMsg]
  );

  useSocket((socket) => {
    socket.on(Route.NOTIFICATION + NOTIFICATION_PATH.GET_NEW, (payload) => {
      dispatch(updateHasNotification(true));
      dispatch(addNotification(payload));
    });
  }, []);

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  const getHoverColor = (colorMode) => {
    return colorMode === "dark" ? "#171717" : "#f0f0f0";
  };

  const getItemPropByPage = (page, queryInParams = "") => {
    const linkTo = getPathForPage(page, queryInParams);
    return {
      linkTo: linkTo,
      onClick: () => {
        router.push(linkTo);
      },
      color: getButtonColor(currentPage === page, colorMode),
    };
  };

  const listItems: any = isAdmin
    ? [
        {
          icon: <GrOverview size={24} />,
          ...getItemPropByPage(PageConstant.ADMIN.DEFAULT),
        },
        {
          icon: <BsFilePost size={24} />,
          ...getItemPropByPage(PageConstant.ADMIN.POSTS),
        },
        {
          icon: <FaUsers size={24} />,
          ...getItemPropByPage(PageConstant.ADMIN.USERS),
        },
        {
          icon: <TbMessageReport size={24} />,
          ...getItemPropByPage(PageConstant.ADMIN.REPORT),
        },
      ]
    : userInfo?._id
    ? [
        {
          icon: <GrHomeRounded size={24} />,
          ...getItemPropByPage(PageConstant.HOME),
        },
        {
          icon: <FiSearch size={24} />,
          ...getItemPropByPage(PageConstant.SEARCH),
        },
        {
          icon: linkIcon,
          ...getItemPropByPage(PageConstant.ACTIVITY),
          onClick: () => {
            getItemPropByPage(PageConstant.ACTIVITY).onClick();
            dispatch(updateHasNotification(false));
          },
        },
        {
          icon: <MdAdd size={24} />,
          onClick: () => {
            dispatch(updatePostAction(PostConstants.ACTIONS.CREATE));
          },
        },
        {
          icon: <FaRegUser size={24} />,
          ...getItemPropByPage(PageConstant.USER, `/${userInfo._id}`),
        },
        {
          icon: messIcon,
          ...getItemPropByPage(PageConstant.CHAT),
        },
      ]
    : [
        {
          icon: <BiLogIn size={24} />,
          ...getItemPropByPage(PageConstant.AUTH, `/${PageConstant.LOGIN}`),
        },
      ];

  if (
    currentPage === PageConstant.LOGIN ||
    currentPage === PageConstant.SIGNUP
  ) {
    return <></>;
  }

  return (
    <Flex
      direction={["column", "row"]}
      width={[`${LeftSideBarWidth}px`, "100%"]}
    >
      <Box
        height={["auto", "auto", "100vh"]}
        color="white"
        p={1}
        position="fixed"
        top={0}
        left={0}
        zIndex={1000}
        display={["none", "none", "block"]}
      >
        <Flex
          alignItems={"center"}
          direction="column"
          justifyContent="space-between"
          height="100%"
          color={colorMode === "dark" ? "white" : "black"}
          position="relative"
        >
          <Link as={NextLink} href={"/"}>
            <Box m={5}>
              <Image
                cursor={"pointer"}
                alt="logo"
                w={9}
                src={
                  colorMode === "dark"
                    ? "/bread-logo-dark.svg"
                    : "/bread-logo-light.svg"
                }
              />
            </Box>
          </Link>
          <Flex direction={"column"}>
            {listItems.map((item, index) => (
              <Box my={2} key={`side-bar-item-${index}`}>
                <Button
                  bg="transparent"
                  _hover={{
                    bg: colorMode === "dark" ? "#171717" : "#f0f0f0",
                  }}
                  color={colorMode === "dark" ? "#4d4d4d" : "#a0a0a0"}
                  py={2}
                  px={4}
                  borderRadius="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.linkTo) {
                      e.preventDefault();
                    }
                    item.onClick && item.onClick();
                  }}
                >
                  {item?.linkTo ? (
                    <Link
                      as={NextLink}
                      href={item.linkTo}
                      borderRadius="md"
                      width={"100%"}
                      height={"100%"}
                      _hover={{ textDecoration: "none" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick && item.onClick();
                      }}
                      color={item.color}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <>{item.icon}</>
                  )}
                </Button>
              </Box>
            ))}
          </Flex>
          <Flex marginBottom={"10px"}>{userInfo?._id && <SidebarMenu />}</Flex>
        </Flex>
      </Box>

      {/* leftsidebar với mobile */}
      <Box
        display={["block", "block", "none"]}
        position="fixed"
        bottom={0}
        width="100%"
        bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
        zIndex={1000}
        py={2}
      >
        <Flex
          justifyContent="space-evenly"
          alignItems="center"
          direction="row"
          width="100%"
        >
          {listItems
            .filter(({ linkTo }) => {
              return ![PageConstant.ACTIVITY, PageConstant.CHAT].includes(
                linkTo?.slice(1, linkTo.length)
              );
            })
            .map((item, index) => (
              <Box key={`side-bar-item-${index}`}>
                <Button
                  p={0}
                  bg="transparent"
                  _hover={{
                    bg: colorMode === "dark" ? "#171717" : "#f0f0f0",
                  }}
                  color={item.color}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.linkTo) {
                      e.preventDefault();
                      item.onClick && item.onClick();
                    } else {
                      item.onClick && item.onClick();
                    }
                  }}
                >
                  {item?.linkTo ? (
                    <Link
                      as={NextLink}
                      href={item.linkTo}
                      _hover={{ textDecoration: "none" }}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <>{item.icon}</>
                  )}
                </Button>
              </Box>
            ))}
          {userInfo?._id && <SidebarMenu />}
        </Flex>
      </Box>
    </Flex>
  );
};

export default LeftSideBar;
