import { CloseIcon } from "../../../../../../assests/chakraIcons";
import { Flex, Text } from "@chakra-ui/react";
import { MdOutlineAttachFile, MdOutlineReply } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import { selectMsg } from "../../../../../../store/MessageSlice";
import { getCurrentTheme } from "../../../../../../util/Themes";

const RepliedMsgBar = () => {
  const dispatch = useAppDispatch();
  const { selectedMsg, selectedConversation } = useAppSelector(
    (state: AppState) => state.message
  );
  const { conversationBackground, user1Message } = getCurrentTheme(
    selectedConversation?.theme
  );
  const bg = conversationBackground?.backgroundColor;
  const textColor = user1Message?.color;
  const participant = selectedConversation?.participant;

  const handleMsgContent = () => {
    const media = selectedMsg?.media;
    const file = selectedMsg?.file;
    if (media?.length || file?._id) {
      return (
        <Flex alignItems={"center"}>
          <MdOutlineAttachFile />
          <Text ml={1}>Attached {media?.length ? media[0].type : "file"}</Text>
        </Flex>
      );
    }
    return (
      <Text
        maxW={"30vw"}
        textOverflow={"ellipsis"}
        overflow={"hidden"}
        whiteSpace={"nowrap"}
      >
        {selectedMsg?.content}
      </Text>
    );
  };

  return (
    <Flex
      width={"100%"}
      pos={"relative"}
      bg={bg}
      color={textColor}
      py={1}
      px={4}
      alignItems={"center"}
      gap={4}
    >
      <MdOutlineReply />
      <Flex flexDir={"column"} maxW={"80%"}>
        <Text>
          Reply to{" "}
          <span
            style={{
              fontWeight: 600,
            }}
          >
            {participant?.username}
          </span>
        </Text>
        {handleMsgContent()}
      </Flex>
      <CloseIcon
        pos={"absolute"}
        right={"24px"}
        cursor={"pointer"}
        _hover={{
          opacity: 0.7,
        }}
        onClick={() => {
          dispatch(selectMsg(null));
        }}
      />
    </Flex>
  );
};

export default RepliedMsgBar;
