import { useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import Header from "./Header";
import LeftSideBar from "./LeftSideBar/index";

export const HeaderHeight = 60;
export const LeftSideBarWidth = 76;

const Layout = () => {
  return (
    <>
      <LeftSideBar />
      <Header />
    </>
  );
};

export default Layout;
