"use client";

import { Avatar, Container, Text } from "../../ui/primitives";
import { useRouter } from "next/navigation";
import UserInfoPopover from "../../UserInfoPopover";
import { IUser } from "../../../store/UserSlice";
import "./index.css";

const UserBox = ({
  user,
  isTagBox = false,
  inFollowBox = false,
  setOpenTagBox,
  searchValue,
  onClick,
}: {
  user: IUser;
  isTagBox?: boolean;
  inFollowBox?: boolean;
  setOpenTagBox?: Function;
  searchValue?: string;
  onClick?: Function;
}) => {
  const router = useRouter();

  const getToUserPage = () => {
    router.push(`/users/${user._id}`);
  };

  return (
    <div
      className={`user-box${isTagBox ? " user-box--tag" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        !!onClick && onClick(user);
      }}
    >
      <Avatar
        size={isTagBox ? "sm" : "md"}
        src={user.avatar}
        cursor={"pointer"}
        onClick={() => {
          if (!isTagBox) {
            getToUserPage();
          }
        }}
      />
      <Container>
        {!isTagBox && !inFollowBox ? (
          <UserInfoPopover user={user} />
        ) : (
          <Text
            className="user-box__username"
            onClick={(e) => {
              e.stopPropagation();
              if (inFollowBox) {
                getToUserPage();
              }
            }}
          >
            {user?.username}
          </Text>
        )}
        <Text
          className={`user-box__name${isTagBox ? " user-box__name--tag" : ""}`}
        >
          {user.name}
        </Text>
      </Container>
    </div>
  );
};

export default UserBox;
