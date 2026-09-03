import PageConstant from "../Breads-Shared/Constants/PageConstants";

/**
 * Single source of truth for "which page / which tab am I on".
 *
 * Before the Next.js migration this lived in Redux (`state.util.currentPage`
 * and `state.util.displayPageData`, written by the `changePage` /
 * `changeDisplayPageData` actions). It is now derived purely from the URL, so
 * the router is the only source of truth (epic AD-4).
 *
 * `getCurrentPage()` returns exactly the same `PageConstant` values the old
 * `state.util.currentPage` held, so every existing `currentPage === X` check
 * keeps working unchanged — only the input changed.
 */

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

/** Pathname -> the value `state.util.currentPage` used to hold. */
export const getCurrentPage = (pathname: string | null): string => {
  const [first, second] = getSegments(pathname);

  // "/" , "/home" and every home tab all belong to the HOME section.
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
  // /search, /chat, /chat/:id, /update, /error ... map to their first segment.
  return first;
};

/** Pathname -> the value `state.util.displayPageData` used to hold. */
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

/** Href a LeftSideBar/Header entry for `page` should point at. */
export const getPathForPage = (page: string, suffix: string = ""): string =>
  page === PageConstant.HOME ? "/" : "/" + page + (suffix ?? "");
