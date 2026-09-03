"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../../src/hooks/redux";
import Header from "../../src/Layout/Header";
import LeftSideBar from "../../src/Layout/LeftSideBar/index";
import { AppState } from "../../src/store";

// Both bail out to `return null` until opened, but importing them statically
// still forces their module graph (Chakra Modal/Menu, useDebounce,
// usePopupCancel, ...) into the initial client bundle. Deferred to a chunk
// that only loads once a post/media is actually opened.
const PostPopup = dynamic(() => import("../../src/components/PostPopup"), {
  ssr: false,
});
const SeeMedia = dynamic(() => import("../../src/components/SeeMedia"), {
  ssr: false,
});
const LoginPopupScreen = dynamic(
  () => import("../../src/components/LoginPopupScreen"),
  { ssr: false },
);
const ReportPopup = dynamic(() => import("../../src/components/Report"), {
  ssr: false,
});

// Ports src/Layout/index.tsx (LeftSideBar always, Header only once a user is
// loaded). HeaderHeight / LeftSideBarWidth stay exported from src/Layout so the
// ~dozen existing consumers keep importing them from the same place.
// NOTE for Tasks 010/011/012: the old src/App.tsx applied
// `marginTop: HeaderHeight + 12` to page content on non-auth pages —
// that spacing now belongs to the individual route files.
const MainLayout = ({ children }: { children: ReactNode }) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const openLoginPopup = useAppSelector(
    (state: AppState) => state.util.openLoginPopup,
  );
  const pathname = usePathname();

  // LeftSideBar navigates via router.push, which doesn't reliably scroll the
  // window to top when switching between tabs (e.g. Home <-> Activity).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <LeftSideBar />
      <Header />
      {children}
      <PostPopup />
      <SeeMedia />
      <ReportPopup />
      {openLoginPopup && <LoginPopupScreen />}
    </>
  );
};

export default MainLayout;
