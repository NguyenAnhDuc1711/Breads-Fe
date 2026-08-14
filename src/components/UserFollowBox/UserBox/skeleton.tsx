import { SkeletonCircle, SkeletonText } from "../../ui/primitives";
import "./skeleton.css";

const UserBoxSekeleton = ({
  smallAvatar = false,
}: {
  smallAvatar?: boolean;
}) => {
  return (
    <div className="user-box-skeleton">
      <SkeletonCircle size={smallAvatar ? "8" : "12"} />
      <div className="user-box-skeleton__text-col">
        <SkeletonText mt="2" noOfLines={1} skeletonHeight="3" width={"80px"} />
        <SkeletonText mt="2" noOfLines={1} skeletonHeight="3" width={"140px"} />
      </div>
    </div>
  );
};

export default UserBoxSekeleton;
