import { Skeleton } from "../../ui/primitives";
import "./skeleton.css";

const SkeletonPost = () => {
  return (
    <div className="post-skeleton">
      <div className="post-skeleton__header">
        <div className="post-skeleton__author-group">
          <Skeleton
            width="40px"
            height="40px"
            minW="40px"
            minH="40px"
            borderRadius="full"
          />
          <Skeleton height="16px" width="130px" borderRadius="md" />
        </div>
        <div className="post-skeleton__meta">
          <Skeleton height="14px" width="60px" borderRadius="sm" />
        </div>
      </div>
      <div className="post-skeleton__content">
        <Skeleton height="14px" width="100%" borderRadius="sm" mb="8px" />
        <Skeleton height="14px" width="70%" borderRadius="sm" mb="12px" />
        <div className="post-skeleton__media">
          <Skeleton height="180px" width="68%" borderRadius="md" flexShrink={0} />
          <Skeleton height="180px" width="28%" borderRadius="md" flexShrink={0} />
        </div>
      </div>
      <div className="post-skeleton__actions">
        <Skeleton height="20px" width="20px" borderRadius="sm" />
        <Skeleton height="20px" width="20px" borderRadius="sm" />
        <Skeleton height="20px" width="20px" borderRadius="sm" />
        <Skeleton height="20px" width="20px" borderRadius="sm" />
      </div>
    </div>
  );
};

export default SkeletonPost;
