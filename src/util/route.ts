import PageConstant from "../Breads-Shared/Constants/PageConstants";

const HOME_TABS: string[] = [
  PageConstant.FOR_YOU,
  PageConstant.FOLLOWING,
  PageConstant.LIKED,
  PageConstant.SAVED,
];

const ACTIVITY_TABS: string[] = [
  PageConstant.FOLLOWS,
  PageConstant.REPLIES,
  PageConstant.MENTIONS,
  PageConstant.LIKES,
  PageConstant.REPOSTS,
];

export const getSegments = (pathname: string | null): string[] =>
  (pathname ?? "").split("/").filter(Boolean);

export const getCurrentPage = (pathname: string | null): string => {
  const [first, second] = getSegments(pathname);

  if (!first || first === PageConstant.HOME || HOME_TABS.includes(first)) {
    return PageConstant.HOME;
  }
  if (first === PageConstant.ACTIVITY) {
    return PageConstant.ACTIVITY;
  }
  if (first === PageConstant.AUTH) {
    return second === PageConstant.SIGNUP
      ? PageConstant.SIGNUP
      : PageConstant.LOGIN;
  }
  if (first === PageConstant.SETTING.DEFAULT) {
    return PageConstant.SETTING.DEFAULT;
  }
  if (first === PageConstant.USER) {
    return PageConstant.USER;
  }
  if (first === "posts") {
    return PageConstant.POST_DETAIL;
  }
  if (first === "reset-pw") {
    return PageConstant.RESET_PW;
  }
  return first;
};

export const getDisplayPageData = (pathname: string | null): string => {
  const [first, second] = getSegments(pathname);

  if (!first || first === PageConstant.HOME) {
    return PageConstant.FOR_YOU;
  }
  if (HOME_TABS.includes(first)) {
    return first;
  }
  if (first === PageConstant.ACTIVITY) {
    return ACTIVITY_TABS.includes(second) ? second : PageConstant.ALL;
  }
  return "";
};

export const getPathForPage = (page: string, suffix: string = ""): string =>
  page === PageConstant.HOME ? "/" : "/" + page + (suffix ?? "");
