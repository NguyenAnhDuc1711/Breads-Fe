"use client";

import { Button, Image, useColorMode } from "../../components/ui/primitives";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { BiLogIn } from "react-icons/bi";
import { FaFacebookMessenger, FaRegHeart } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { GrHomeRounded } from "react-icons/gr";
import { MdAdd } from "react-icons/md";
import {
  MESSAGE_PATH,
  NOTIFICATION_PATH,
  Route,
} from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import useSocket from "../../hooks/useSocket";
import { AppState } from "../../store";
import { updateHasNotification } from "../../store/NotificationSlice";
import { api } from "../../store/api/baseApi";
import {
  updateGlobalTotal,
  updateUnreadCount,
} from "../../store/MessageSlice";
import { openLoginPopupAction } from "../../store/UtilSlice";
import { updatePostAction } from "../../store/PostSlice";
import { getCurrentPage, getPathForPage } from "../../util/route";
import { formatUnreadBadge } from "../../util";
import SidebarMenu from "./SidebarMenu";
import "./index.css";

const LeftSideBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode } = useColorMode();

  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  // Active item now comes from the URL, not from Redux (AD-4).
  const currentPage = getCurrentPage(pathname);
  const hasNewNotification = useAppSelector(
    (state: AppState) => state.notification.hasNewNotification,
  );
  const globalTotal = useAppSelector(
    (state: AppState) => state.message.globalTotal,
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
        {globalTotal > 0 && (
          <div className="left-sidebar__badge left-sidebar__badge--count">
            {formatUnreadBadge(globalTotal)}
          </div>
        )}
      </div>
    ),
    [globalTotal],
  );

  useSocket((socket) => {
    socket.on(Route.NOTIFICATION + NOTIFICATION_PATH.GET_NEW, () => {
      dispatch(updateHasNotification(true));
      // Refetches only if an Activity page query is actively subscribed —
      // replaces the old client-side unshift-into-slice (addNotification),
      // now that `notifications` lives in RTK Query cache (notificationApi).
      dispatch(api.util.invalidateTags(["Notification"]));
    });
  }, []);

  useSocket((socket) => {
    const handleUnreadUpdate = (payload: {
      conversationId: string;
      unreadCount: number;
      globalTotal: number;
    }) => {
      dispatch(
        updateUnreadCount({
          conversationId: payload?.conversationId,
          unreadCount: payload?.unreadCount,
        })
      );
      dispatch(updateGlobalTotal(payload?.globalTotal));
    };

    socket.on(Route.MESSAGE + MESSAGE_PATH.UNREAD_UPDATE, handleUnreadUpdate);

    return () => {
      socket.off(Route.MESSAGE + MESSAGE_PATH.UNREAD_UPDATE, handleUnreadUpdate);
    };
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

  const listItems: any = userInfo?._id
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
          icon: <GrHomeRounded size={24} />,
          ...getItemPropByPage(PageConstant.HOME),
        },
        {
          icon: <FiSearch size={24} />,
          ...getItemPropByPage(PageConstant.SEARCH),
        },
        {
          icon: linkIcon,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
        },
        {
          icon: <MdAdd size={24} />,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
        },
        {
          icon: <FaRegUser size={24} />,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
        },
        {
          icon: messIcon,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
        },
      ];

  const mobileListItems = userInfo?._id
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
          icon: <MdAdd size={24} />,
          onClick: () => {
            dispatch(updatePostAction(PostConstants.ACTIONS.CREATE));
          },
          color: getButtonColor(false, colorMode),
        },
        {
          icon: <FaRegUser size={24} />,
          ...getItemPropByPage(PageConstant.USER, `/${userInfo._id}`),
        },
      ]
    : [
        {
          icon: <GrHomeRounded size={24} />,
          ...getItemPropByPage(PageConstant.HOME),
        },
        {
          icon: <FiSearch size={24} />,
          ...getItemPropByPage(PageConstant.SEARCH),
        },
        {
          icon: <MdAdd size={24} />,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
        },
        {
          icon: <FaRegUser size={24} />,
          onClick: () => dispatch(openLoginPopupAction()),
          color: getButtonColor(false, colorMode),
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
            <SidebarMenu />
          </div>
        </div>
      </div>

      {/* leftsidebar với mobile */}
      <div className="left-sidebar__mobile">
        <div className="left-sidebar__mobile-row">
          {mobileListItems.map((item, index) => (
            <div key={`side-bar-mobile-item-${index}`}>
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
          <SidebarMenu />
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
