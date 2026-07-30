"use client";

import { ReactNode } from "react";
import { useAppSelector } from "../../src/hooks/redux";
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
  return (
    <>
      <LeftSideBar />
      {userInfo?._id && <Header />}
      {children}
    </>
  );
};

export default MainLayout;
