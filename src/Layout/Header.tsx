"use client";

import { ChevronDownIcon } from "../assests/chakraIcons";
import { Text } from "../components/ui/primitives";
import { usePathname, useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeaderHeight } from ".";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import ClickOutsideComponent from "../util/ClickoutCPN";
import { getCurrentPage, getDisplayPageData } from "../util/route";
import { BtnLike, BtnMess } from "./LeftSideBar/ActionsBtns";
import "./Header.css";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Active section / tab now comes from the URL, not from Redux (AD-4).
  const currentPage = getCurrentPage(pathname);
  const displayPageData = getDisplayPageData(pathname);
  const { userInfo, userSelected } = useAppSelector(
    (state: AppState) => state.user,
  );
  const [openBox, setOpenBox] = useState(false);

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
          : `/${PageConstant.ACTIVITY}`,
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
    <div className="app-header" style={{ height: `${HeaderHeight}px` }}>
      <div className="app-header__mobile-only">
        <BtnLike />
      </div>
      <div className="app-header__center">
        {getHeaderContent()}
        {!!userInfo?._id &&
          [PageConstant.HOME, PageConstant.ACTIVITY].includes(currentPage) && (
            <ClickOutsideComponent onClose={() => setOpenBox(false)}>
              <ChevronDownIcon
                className={`app-header__chevron${
                  openBox ? " app-header__chevron--open" : ""
                }`}
                onClick={() => setOpenBox(!openBox)}
              />
              {openBox && (
                <div className="app-header__dropdown">
                  {getBoxItems()?.map((item) => (
                    <Text
                      className="app-header__dropdown-item"
                      key={item}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item);
                        setOpenBox(false);
                      }}
                    >
                      {item[0].toUpperCase() + item.slice(1)}
                    </Text>
                  ))}
                </div>
              )}
            </ClickOutsideComponent>
          )}
      </div>
      <div className="app-header__mobile-only">
        <BtnMess />
      </div>
    </div>
  );
};

export default memo(Header);
