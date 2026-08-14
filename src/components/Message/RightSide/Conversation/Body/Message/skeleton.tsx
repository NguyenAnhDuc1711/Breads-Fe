import { Skeleton, SkeletonCircle } from "../../../../../ui/primitives";
import "./skeleton.css";

const MessagesSkeleton = () => {
  return [...Array(5)].map((_, i) => (
    <div
      key={i}
      className={`message-skeleton${
        i % 2 === 0 ? " message-skeleton--start" : " message-skeleton--end"
      }`}
    >
      {i % 2 === 0 && <SkeletonCircle size={7} />}
      <div className="message-skeleton__bubble-col">
        <Skeleton h={"32px"} w={"240px"} />
      </div>
    </div>
  ));
};

export default MessagesSkeleton;
