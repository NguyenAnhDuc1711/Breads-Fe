import { Container, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useAppSelector } from "../../hooks/redux";
import Survey from "../ListPost/Post/Survey";
import MediaDisplay from "./mediaDisplay";
import OptimizedAvatar from "../OptimizedAvatar";

const PostReplied = () => {
  const postReply = useAppSelector((state) => state.post.postReply);
  const textColor = useColorModeValue("ccl.dark", "ccl.light");

  return (
    <>
      {postReply && (
        <Flex>
          <OptimizedAvatar
            src={postReply.authorInfo?.avatar}
            width={"40px"}
            height={"40px"}
          />
          <Container margin="0" paddingRight={0}>
            <Text color={textColor} fontWeight={"600"}>
              {postReply.authorInfo?.username}
            </Text>
            <Text>{postReply.content}</Text>
            <MediaDisplay post={postReply} />
            {postReply.survey.length !== 0 && <Survey post={postReply} />}
          </Container>
        </Flex>
      )}
    </>
  );
};

export default PostReplied;
