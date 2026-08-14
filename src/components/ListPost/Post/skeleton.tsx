import { Skeleton, SkeletonCircle, SkeletonText } from "../../ui/primitives";
import "./skeleton.css";

const SkeletonPost = () => {
  return (
    <div className="post-skeleton">
      <div className="post-skeleton__header">
        <SkeletonCircle size="10" />
        <Skeleton height="16px" width={"88px"} />
      </div>
      <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="3" />
      <Skeleton
        width={"100%"}
        height={"200px"}
        mt={"4"}
        borderRadius={"10px"}
      />
    </div>
  );
};

export default SkeletonPost;
