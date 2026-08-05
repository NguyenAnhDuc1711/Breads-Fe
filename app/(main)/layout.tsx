"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../../src/hooks/redux";
import PostPopup from "../../src/components/PostPopup";
import SeeMedia from "../../src/components/SeeMedia";
import Header from "../../src/Layout/Header";
import LeftSideBar from "../../src/Layout/LeftSideBar/index";
import { AppState } from "../../src/store";

// Ports src/Layout/index.tsx (LeftSideBar always, Header only once a user is
// loaded). HeaderHeight / LeftSideBarWidth stay exported from src/Layout so the
// ~dozen existing consumers keep importing them from the same place.
// NOTE for Tasks 010/011/012: the old src/App.tsx applied
// `marginTop: HeaderHeight + 12` to page content on non-auth/non-admin pages —
// that spacing now belongs to the individual route files.
const MainLayout = ({ children }: { children: ReactNode }) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const pathname = usePathname();

  // LeftSideBar navigates via router.push, which doesn't reliably scroll the
  // window to top when switching between tabs (e.g. Home <-> Activity).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <LeftSideBar />
      {userInfo?._id && <Header />}
      {children}
      <PostPopup />
      <SeeMedia />
    </>
  );
};

export default MainLayout;
