"use client";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Container, Flex, Text, useColorMode } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeaderHeight } from ".";
import { Constants } from "../Breads-Shared/Constants";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { containerBoxWidth } from "../components/MainBoxLayout";
import { useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import ClickOutsideComponent from "../util/ClickoutCPN";
import { getCurrentPage, getDisplayPageData } from "../util/route";
import { BtnLike, BtnMess } from "./LeftSideBar/ActionsBtns";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  // Active section / tab now comes from the URL, not from Redux (AD-4).
  const currentPage = getCurrentPage(pathname);
  const displayPageData = getDisplayPageData(pathname);
  const { userInfo, userSelected } = useAppSelector(
    (state: AppState) => state.user
  );
  const [openBox, setOpenBox] = useState(false);
  const isAdmin = userInfo?.role === Constants.USER_ROLE.ADMIN;

  if (isAdmin) {
    return <></>;
  }

  const getBoxItems = () => {
    switch (currentPage) {
      case PageConstant.HOME:
        return [t("forYou"), t("following"), t("Liked"), t("saved")];
      case PageConstant.ACTIVITY:
        return [t("all"), t("follows"), t("replies"), t("likes"), t("reposts")];
      default:
        return [];
    }
  };

  const getHeaderContent = () => {
    const headerContentMap = {
      [PageConstant.HOME]: t("forYou"),
      [PageConstant.ACTIVITY]: t("activity"),
      [PageConstant.FOR_YOU]: t("forYou"),
      [PageConstant.FOLLOWING]: t("following"),
      [PageConstant.FOLLOWS]: t("follows"),
      [PageConstant.LIKED]: t("Liked"),
      [PageConstant.LIKES]: t("likes"),
      [PageConstant.REPOSTS]: t("reposts"),
      [PageConstant.REPLIES]: t("replies"),
      [PageConstant.SAVED]: t("saved"),
      [PageConstant.SEARCH]: t("search"),
      [PageConstant.USER]: t("userProfile"),
      [PageConstant.FRIEND]: userSelected?.username ?? t("friend"),
      [PageConstant.POST_DETAIL]: t("bread"),
      [PageConstant.CHAT]: t("chat"),
    };

    switch (currentPage) {
      case PageConstant.HOME: {
        if (displayPageData === PageConstant.FOR_YOU) {
          return t("forYou");
        } else if (displayPageData === PageConstant.FOLLOWING) {
          return t("following");
        } else if (displayPageData === PageConstant.LIKED) {
          return t("Liked");
        } else if (displayPageData === PageConstant.SAVED) {
          return t("saved");
        }

        return t("forYou");
      }
      case PageConstant.ACTIVITY: {
        if (displayPageData === PageConstant.LIKES) {
          return t("likes");
        } else if (displayPageData === PageConstant.FOLLOWS) {
          return t("follows");
        } else if (displayPageData === PageConstant.REPLIES) {
          return t("replies");
        } else if (displayPageData === PageConstant.REPOSTS) {
          return t("reposts");
        }

        return t("activity");
      }
      case PageConstant.CHAT:
        return (
          headerContentMap[currentPage][0]?.toUpperCase() +
          headerContentMap[currentPage].slice(1)
        );
      default:
        return headerContentMap[currentPage] || t("forYou");
    }
  };

  const handleNavigate = (item) => {
    if (currentPage === PageConstant.ACTIVITY) {
      const activityPageMap = {
        [t("all")]: "",
        [t("follows")]: PageConstant.FOLLOWS,
        [t("replies")]: PageConstant.REPLIES,
        [t("likes")]: PageConstant.LIKES,
        [t("reposts")]: PageConstant.REPOSTS,
      };
      const targetPage = activityPageMap[item];
      router.push(
        targetPage
          ? `/${PageConstant.ACTIVITY}/${targetPage}`
          : `/${PageConstant.ACTIVITY}`
      );
    } else {
      const pageMap = {
        [t("forYou")]: PageConstant.FOR_YOU,
        [t("following")]: PageConstant.FOLLOWING,
        [t("Liked")]: PageConstant.LIKED,
        [t("saved")]: PageConstant.SAVED,
      };
      const targetPage = pageMap[item] || item;
      router.push("/" + targetPage);
    }
  };

  return (
    <Flex
      display={"flex"}
      position={"fixed"}
      left={0}
      top={0}
      width={"100vw"}
      maxWidth={"100vw"}
      height={`${HeaderHeight}px`}
      zIndex={999}
      justifyContent={["space-between", "space-between", "center"]}
      alignItems={"center"}
      bg={colorMode === "dark" ? "#0a0a0a" : "#fafafa"}
    >
      <BtnLike />
      <Flex
        width={containerBoxWidth}
        maxWidth={containerBoxWidth}
        height={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        gap={"12px"}
        position={"relative"}
        fontWeight={600}
        fontSize={"17px"}
      >
        {getHeaderContent()}
        {[PageConstant.HOME, PageConstant.ACTIVITY].includes(currentPage) && (
          <ClickOutsideComponent onClose={() => setOpenBox(false)}>
            <ChevronDownIcon
              width={"32px"}
              height={"32px"}
              padding={"4px"}
              borderRadius={"50%"}
              cursor={"pointer"}
              transform={openBox ? "rotate(180deg)" : ""}
              _hover={{ bg: colorMode === "dark" ? "#171717" : "#f0f0f0" }}
              onClick={() => setOpenBox(!openBox)}
            />
            {openBox && (
              <Container
                position={"absolute"}
                top={"calc(100% - 12px)"}
                left={"50%"}
                width={"200px"}
                height={"fit-content"}
                borderRadius={"12px"}
                padding="8px 12px"
                overflow={"hidden"}
                bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
                boxShadow={"0px 0px 8px -3px rgba(0,0,0,0.53)"}
              >
                {getBoxItems()?.map((item) => (
                  <Text
                    width={"100%"}
                    key={item}
                    padding="8px 12px"
                    cursor={"pointer"}
                    borderRadius={"8px"}
                    _hover={{
                      bg: colorMode === "dark" ? "#171717" : "#f0f0f0",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(item);
                      setOpenBox(false);
                    }}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                ))}
              </Container>
            )}
          </ClickOutsideComponent>
        )}
      </Flex>
      <BtnMess />
    </Flex>
  );
};

export default memo(Header);
