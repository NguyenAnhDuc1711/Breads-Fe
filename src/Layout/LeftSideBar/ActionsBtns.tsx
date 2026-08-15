import { Button, useColorMode } from "../../components/ui/primitives";
import { usePathname, useRouter } from "next/navigation";
import { FaFacebookMessenger, FaRegHeart } from "react-icons/fa";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { openLoginPopupAction } from "../../store/UtilSlice";
import { getCurrentPage } from "../../util/route";
import "./ActionsBtns.css";

export const BtnLike = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const currentPage = getCurrentPage(pathname);

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  const handleClick = (): void => {
    if (!userInfo?._id) {
      dispatch(openLoginPopupAction());
      return;
    }
    router.push("/" + PageConstant.ACTIVITY);
  };

  return (
    <Button
      className="header-icon-btn"
      color={getButtonColor(currentPage === PageConstant.ACTIVITY, colorMode)}
      onClick={handleClick}
    >
      <FaRegHeart size={24} />
    </Button>
  );
};

export const BtnMess = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const currentPage = getCurrentPage(pathname);

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  const handleClick = () => {
    if (!userInfo?._id) {
      dispatch(openLoginPopupAction());
      return;
    }
    router.push("/" + PageConstant.CHAT);
  };

  return (
    <Button
      className="header-icon-btn"
      color={getButtonColor(currentPage === PageConstant.CHAT, colorMode)}
      onClick={handleClick}
    >
      <FaFacebookMessenger size={24} />
    </Button>
  );
};
