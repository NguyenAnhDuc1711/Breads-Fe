// ViewActivity.jsx
import {
  Avatar,
  Box,
  Container,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { BsChatRightQuote } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { TbMessageReply } from "react-icons/tb";
import { addEvent } from "../../util";
import { IPost } from "../../store/PostSlice";
import { useTranslation } from "react-i18next";

const ViewActivity = ({
  post,
  isOpen,
  onClose,
}: {
  post: IPost;
  isOpen: boolean;
  onClose: Function;
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    addEvent({
      event: "see_post_activity",
      payload: {
        postId: post._id,
      },
    });
  }, []);

  const actionsArray = [
    {
      action: CiHeart,
      num: post.likesCount ?? 0,
      name: t("countLike"),
    },
    {
      action: TbMessageReply,
      num: post.replies?.length,
      name: t("countCmt"),
    },
    {
      action: BsChatRightQuote,
      num: post?.repostNum,
      name: t("countRepost"),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
      <ModalOverlay />
      <ModalContent
        position={"relative"}
        boxSizing="border-box"
        width="500px"
        maxWidth={"620px"}
        bg={"white"}
        color={"gray"}
        pr={1}
        borderRadius={"16px"}
        id="modal"
      >
        <Box p={1}></Box>
        <ModalHeader textAlign={"center"} py={3}>
          {t("viewActTitle")}
        </ModalHeader>

        <ModalBody>
          <Flex
            border="1px solid #999"
            borderRadius="8px"
            p={4}
            m={2}
            mb={6}
            bg="gray.50"
            boxShadow="md"
            alignItems="center"
            justifyContent="space-between"
          >
            <Avatar
              src={post.authorInfo?.avatar}
              width={"40px"}
              height={"40px"}
            />
            <Container margin="0" paddingRight={0}>
              <Text color="black" fontWeight={"600"} m={0}>
                {post.authorInfo?.username}
              </Text>
              <Text m={0}>{post.content}</Text>
            </Container>
          </Flex>
          <Box>
            {actionsArray.map((item, index) => (
              <Box key={index} m={1}>
                <Flex justifyContent={"space-between"} alignItems="center">
                  <Box display="flex" alignItems="center" borderRadius="8px">
                    <Flex alignItems="center" px={2}>
                      <item.action
                        style={{ marginRight: "8px", padding: "0" }}
                      />
                      <Text fontWeight="semibold" fontSize="lg" m={0}>
                        {item.name}
                      </Text>
                    </Flex>
                  </Box>
                  <Text alignItems="center" px={3} m={0}>
                    {item.num}
                  </Text>
                </Flex>
                <Box pl={"30px"}>
                  <Divider borderColor="gray.300" />
                </Box>
              </Box>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewActivity;
