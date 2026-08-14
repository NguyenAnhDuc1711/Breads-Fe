import { Text, useColorModeValue } from "../ui/primitives";
import { useAppSelector } from "../../hooks/redux";
import Survey from "../ListPost/Post/Survey";
import MediaDisplay from "./mediaDisplay";
import OptimizedAvatar from "../OptimizedAvatar";
import "./PostReplied.css";

const PostReplied = () => {
  const postReply = useAppSelector((state) => state.post.postReply);
  const textColor = useColorModeValue("ccl.dark", "ccl.light");

  return (
    <>
      {postReply && (
        <div className="post-replied">
          <OptimizedAvatar
            src={postReply.authorInfo?.avatar}
            width={"40px"}
            height={"40px"}
          />
          <div className="post-replied__body">
            <Text
              className="post-replied__username"
              style={{ color: textColor }}
            >
              {postReply.authorInfo?.username}
            </Text>
            <Text>{postReply.content}</Text>
            <MediaDisplay post={postReply} />
            {postReply.survey.length !== 0 && <Survey post={postReply} />}
          </div>
        </div>
      )}
    </>
  );
};

export default PostReplied;
