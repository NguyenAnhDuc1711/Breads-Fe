"use client";

import { Avatar, Button } from "../ui/primitives";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "../ui/primitives";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdVerified } from "react-icons/md";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { IUserShortInfo } from "../../store/PostSlice";
import { selectUser } from "../../store/UserSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";
import { addEvent } from "../../util";
import { handleFollow } from "../FollowBtn";
import UnFollowPopup from "../FollowBtn/UnfollowPopup";
import "./index.css";

const CELEBRITY_FOLLOWERS_THRESHOLD = 50000;

export const UserInfoBox = ({ user }: { user: IUserShortInfo }) => {
  const dispatch = useAppDispatch();
  const [openCancelPopup, setOpenCancelPopup] = useState(false);
  const { userInfo } = useAppSelector((state: AppState) => state.user);
  const isFollowing = userInfo?.following?.includes(user?._id);
  return (
    <PopoverBody className="user-info-card">
      <div className="user-info-card__body">
        <div className="user-info-card__header">
          <div>
            <div className="user-info-card__name-row">
              <span className="user-info-card__username">
                {user?.username}
              </span>
              {(user?.followersCount ?? 0) > CELEBRITY_FOLLOWERS_THRESHOLD && (
                <Tooltip label="Celebrity">
                  <span>
                    <MdVerified color="#1d9bf0" size={16} />
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="user-info-card__name">{user?.name}</p>
          </div>
          <Avatar
            src={user?.avatar}
            size={"md"}
            name={user?.username}
            cursor={"pointer"}
          />
        </div>
        <p className="user-info-card__bio"> {user?.bio}</p>
        <p className="user-info-card__followers">
          {user?.followersCount ?? 0} người theo dõi
        </p>
        {user?._id !== userInfo?._id && (
          <Button
            className="user-info-card__follow-btn"
            onClick={() => {
              if (isFollowing) {
                setOpenCancelPopup(true);
              } else {
                handleFollow(userInfo, user, dispatch);
              }
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
      <UnFollowPopup
        user={user}
        isOpen={openCancelPopup}
        onClose={() => setOpenCancelPopup(false)}
        onClick={() => {
          handleFollow(userInfo, user, dispatch);
          setOpenCancelPopup(false);
        }}
      />
    </PopoverBody>
  );
};

const UserInfoPopover = ({
  user,
  isParentPost,
  isDetail,
}: {
  user: IUserShortInfo;
  isParentPost?: boolean;
  isDetail?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userInfo, userSelected } = useAppSelector(
    (state: AppState) => state.user
  );
  const currentPage = useAppSelector(
    (state: AppState) => state.util.currentPage
  );
  const isFrPage: boolean = currentPage === PageConstant.FRIEND;

  const handleGoToUserPage = (): void => {
    router.push(`/users/${user._id}`);
    dispatch(
      changePage({
        nextPage:
          user?._id === userInfo?._id ? PageConstant.USER : PageConstant.FRIEND,
      })
    );
  };

  return (
    <Popover trigger="hover" placement="bottom-start">
      <PopoverTrigger>
        <NextLink
          href={`/users/${user?._id}`}
          onClick={() => handleGoToUserPage()}
          onMouseEnter={() => {
            if (userSelected?._id !== user?._id && !isFrPage) {
              dispatch(selectUser(user));
              addEvent({
                event: "hover_user_popup",
                payload: {
                  userId: user?._id,
                },
              });
            }
          }}
        >
          <div className="user-info-trigger">
            <span className="user-info-trigger__username">
              {user?.username}
            </span>
            {(user?.followersCount ?? 0) > CELEBRITY_FOLLOWERS_THRESHOLD && (
              <Tooltip label="Celebrity">
                <span>
                  <MdVerified color="#1d9bf0" size={14} />
                </span>
              </Tooltip>
            )}
          </div>
        </NextLink>
      </PopoverTrigger>

      {((!isParentPost &&
        (isFrPage
          ? userSelected?._id !== user?._id
          : userInfo?._id !== user?._id)) ||
        isDetail) && (
        <PopoverContent
          top="-1"
          left="-7"
          transform="translateX(-50%)"
          borderRadius={"10px"}
          zIndex={10000}
        >
          <UserInfoBox
            user={user?._id === userSelected?._id ? userSelected : user}
          />
        </PopoverContent>
      )}
    </Popover>
  );
};

export default UserInfoPopover;
