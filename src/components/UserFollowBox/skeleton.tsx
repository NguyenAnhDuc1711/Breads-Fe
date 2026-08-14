import { SkeletonText } from "../ui/primitives";
import UserBoxSekeleton from "./UserBox/skeleton";
import "./skeleton.css";

const UserFollowBoxSkeleton = ({ inFollowBox = false }) => {
  return (
    <div
      className={`user-follow-box-skeleton${
        inFollowBox ? " user-follow-box-skeleton--in-box" : ""
      }`}
    >
      <UserBoxSekeleton />
      <SkeletonText
        width={"80px"}
        noOfLines={1}
        skeletonHeight="9"
        borderRadius={"20px"}
      />
    </div>
  );
};

export default UserFollowBoxSkeleton;
