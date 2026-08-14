import { useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { IUser } from "../../store/UserSlice";
import FollowBtn from "../FollowBtn";
import UserBox from "./UserBox";
import "./index.css";

const UserFollowBox = ({
  user,
  inFollowBox = false,
}: {
  user: IUser;
  inFollowBox?: boolean;
}) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);

  return (
    <>
      <div
        className={`user-follow-box${
          inFollowBox ? " user-follow-box--in-box" : ""
        }`}
      >
        <UserBox user={user} inFollowBox={inFollowBox} />
        {userInfo?._id !== user?._id && (
          <FollowBtn user={user} inUserFlBox={true} />
        )}
      </div>
    </>
  );
};

export default UserFollowBox;
