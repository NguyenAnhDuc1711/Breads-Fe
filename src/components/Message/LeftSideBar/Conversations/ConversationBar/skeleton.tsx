import { Skeleton, SkeletonCircle } from "../../../../ui/primitives";
import "./skeleton.css";

const ConversationSkeleton = () => {
  return (
    <div className="conversation-bar-skeleton">
      <div>
        <SkeletonCircle size={"10"} />
      </div>
      <div className="conversation-bar-skeleton__text-col">
        <Skeleton h={"10px"} w={"80px"} />
        <Skeleton h={"8px"} w={"90%"} />
      </div>
    </div>
  );
};

export default ConversationSkeleton;
