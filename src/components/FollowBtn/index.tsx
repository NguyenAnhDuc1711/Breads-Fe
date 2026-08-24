import { Button } from "../ui/primitives";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NOTIFICATION_PATH, Route } from "../../Breads-Shared/APIConfig";
import { Constants } from "../../Breads-Shared/Constants";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import Socket from "../../socket";
import { IUserShortInfo } from "../../store/PostSlice";
import { IUser } from "../../store/UserSlice";
import { followUser } from "../../store/UserSlice/asyncThunk";
import { addEvent } from "../../util";
import { GA_EVENTS, sendGaEvent } from "../../util/gtmEvents";
import UnFollowPopup from "./UnfollowPopup";
import { openLoginPopupAction, showToast } from "../../store/UtilSlice";
import "./index.css";

export const handleFollow = async (
  userInfo: IUser,
  user: IUserShortInfo,
  dispatch: any,
  isFollowAction: boolean = true
) => {
  if (!userInfo?._id) {
    return;
  }
  try {
    // plan-review ARCH-1: trước đây dispatch không await/unwrap nên lỗi
    // network được Redux thunk tự xử lý êm. Giờ cần await để biết chính
    // xác thời điểm thành công (cho sendGaEvent) — bắt buộc bọc try/catch
    // để không biến lỗi network thành unhandled promise rejection.
    await dispatch(
      followUser({
        userFlId: user._id,
        userId: userInfo._id,
      })
    ).unwrap();
    if (isFollowAction) {
      sendGaEvent({ event: GA_EVENTS.FOLLOW_USER, params: {} });
    }
  } catch (err) {
    console.error("handleFollow: ", err);
  }
  try {
    const socket = Socket.getInstant();
    socket.emit(Route.NOTIFICATION + NOTIFICATION_PATH.CREATE, {
      fromUser: userInfo._id,
      toUsers: [user._id],
      action: Constants.NOTIFICATION_ACTION.FOLLOW,
      target: "",
    });
  } catch (error) {
    dispatch(
      showToast({
        title: "Error",
        description: error,
        status: "error",
      })
    );
  }
};

const FollowBtn = ({
  user,
  inUserFlBox = false,
}: {
  user: IUserShortInfo;
  inUserFlBox?: boolean;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const currentPage = useAppSelector((state) => state.util.currentPage);
  const isFollowing = userInfo?.following?.includes(user?._id);
  const [openCancelPopup, setOpenCancelPopup] = useState<boolean>(false);

  const clickFollowBtn = () => {
    if (!userInfo?._id) {
      dispatch(openLoginPopupAction());
      return;
    }
    if (isFollowing) {
      setOpenCancelPopup(true);
    } else {
      addEvent({
        event: "follow_user",
        payload: {
          userId: user._id,
        },
      });
      handleFollow(userInfo, user, dispatch, true);
    }
  };
  const isFullWidth = currentPage === PageConstant.FRIEND && !inUserFlBox;

  return (
    <div className={isFullWidth ? "follow-btn-wrap--full" : undefined}>
      <Button
        className="follow-btn btn-subtle"
        size={"md"}
        onClick={() => {
          clickFollowBtn();
        }}
      >
        {isFollowing
          ? t("unfollow")
          : userInfo.followed?.includes(user?._id)
          ? t("followback")
          : t("follow")}
      </Button>
      <UnFollowPopup
        user={user}
        isOpen={openCancelPopup}
        onClose={() => setOpenCancelPopup(false)}
        onClick={() => {
          addEvent({
            event: "unfollow_user",
            payload: {
              userId: user._id,
            },
          });
          handleFollow(userInfo, user, dispatch, false);
          setOpenCancelPopup(false);
        }}
      />
    </div>
  );
};

export default FollowBtn;
