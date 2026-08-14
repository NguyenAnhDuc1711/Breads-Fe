"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";
import { ReactNode } from "react";
import { Constants } from "../../../src/Breads-Shared/Constants";
import { useAppSelector } from "../../../src/hooks/redux";
import { LeftSideBarWidth } from "../../../src/Layout";
import { AppState } from "../../../src/store";

// Ports src/pages/Admin/index.tsx's non-routing parts (isAdmin gate +
// Container wrapper). The pathname-parsing/useMemo switch it used to do is
// gone — Next.js's file-based routing (the 5 page.tsx files under this
// directory) replaces it directly.
const AdminLayout = ({ children }: { children: ReactNode }) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const isAdmin = userInfo?.role === Constants.USER_ROLE.ADMIN;

  if (!isAdmin) {
    return <>Invalid Access</>;
  }

  return (
    <div
      className="admin-layout"
      style={{
        width: `calc(100vw - ${LeftSideBarWidth + 8}px)`,
        maxWidth: `calc(100vw - ${LeftSideBarWidth + 8}px)`,
        left: `${LeftSideBarWidth}px`,
      }}
    >
      {children}
    </div>
  );
};

export default AdminLayout;
