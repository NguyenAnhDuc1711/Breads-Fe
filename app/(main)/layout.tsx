"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../../src/hooks/redux";
import Header from "../../src/Layout/Header";
import LeftSideBar from "../../src/Layout/LeftSideBar/index";
import { AppState } from "../../src/store";

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

const MainLayout = ({ children }: { children: ReactNode }) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const openLoginPopup = useAppSelector(
    (state: AppState) => state.util.openLoginPopup,
  );
  const pathname = usePathname();

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
