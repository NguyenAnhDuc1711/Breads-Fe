"use client";

import { Button, Image, useColorMode } from "../../components/ui/primitives";
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
import "./index.css";

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
    (state: AppState) => state.notification.hasNewNotification,
  );

  const linkIcon = useMemo(
    () => (
      <div className="left-sidebar__icon-wrap">
        <FaRegHeart size={24} />
        {hasNewNotification && <div className="left-sidebar__badge" />}
      </div>
    ),
    [hasNewNotification],
  );

  const messIcon = useMemo(
    () => (
      <div className="left-sidebar__icon-wrap">
        <FaFacebookMessenger size={24} />
        {userInfo.hasNewMsg && <div className="left-sidebar__badge" />}
      </div>
    ),
    [userInfo.hasNewMsg],
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
            ...getItemPropByPage(PageConstant.LOGIN, ""),
          },
        ];

  if (
    currentPage === PageConstant.LOGIN ||
    currentPage === PageConstant.SIGNUP
  ) {
    return <></>;
  }

  return (
    <div className="left-sidebar">
      <div className="left-sidebar__desktop">
        <div className="left-sidebar__desktop-inner">
          <NextLink href={"/"}>
            <div className="left-sidebar__logo-wrap">
              <Image
                className="left-sidebar__logo"
                alt="logo"
                src={
                  colorMode === "dark"
                    ? "/bread-logo-dark.svg"
                    : "/bread-logo-light.svg"
                }
              />
            </div>
          </NextLink>
          <div className="left-sidebar__items">
            {listItems.map((item, index) => (
              <div className="left-sidebar__item-wrap" key={`side-bar-item-${index}`}>
                <Button
                  className="left-sidebar__item-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.linkTo) {
                      e.preventDefault();
                    }
                    item.onClick && item.onClick();
                  }}
                >
                  {item?.linkTo ? (
                    <NextLink
                      href={item.linkTo}
                      className="left-sidebar__item-link"
                      style={{ color: item.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick && item.onClick();
                      }}
                    >
                      {item.icon}
                    </NextLink>
                  ) : (
                    <>{item.icon}</>
                  )}
                </Button>
              </div>
            ))}
          </div>
          <div className="left-sidebar__footer">
            {userInfo?._id && <SidebarMenu />}
          </div>
        </div>
      </div>

      {/* leftsidebar với mobile */}
      <div className="left-sidebar__mobile">
        <div className="left-sidebar__mobile-row">
          {listItems
            .filter(({ linkTo }) => {
              return ![PageConstant.ACTIVITY, PageConstant.CHAT].includes(
                linkTo?.slice(1, linkTo.length),
              );
            })
            .map((item, index) => (
              <div key={`side-bar-item-${index}`}>
                <Button
                  className="left-sidebar__mobile-item-btn"
                  style={{ color: item.color }}
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
                    <NextLink
                      href={item.linkTo}
                      className="left-sidebar__mobile-item-link"
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </NextLink>
                  ) : (
                    <>{item.icon}</>
                  )}
                </Button>
              </div>
            ))}
          {userInfo?._id && <SidebarMenu />}
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
