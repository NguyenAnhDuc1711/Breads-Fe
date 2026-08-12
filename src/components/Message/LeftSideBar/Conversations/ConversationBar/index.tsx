import {
  Avatar,
  AvatarBadge,
  Container,
  Flex,
  Image,
  Stack,
  Text,
  useBreakpointValue,
  WrapItem,
} from "@chakra-ui/react";
import dayjs from "../../../../../util/dayjs";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import { AppState } from "../../../../../store";
import { selectConversation } from "../../../../../store/MessageSlice";

const ConversationBar = ({
  conversation,
  onSelect,
}: {
  conversation: any;
  onSelect: Function;
}) => {
  const dispatch = useAppDispatch();
  const { _id, emoji, updatedAt, lastMsg, participant } = conversation;
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const selectedConversation = useAppSelector(
    (state) => state.message.selectedConversation
  );
  const isSeen = lastMsg?.usersSeen?.includes(userInfo?._id);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLastMsgInfo = () => {
    const isCurrentUser = lastMsg?.sender === userInfo._id;
    const userPrefix = isCurrentUser ? "You" : participant?.username;
    const msgContent = lastMsg?.content?.trim()
      ? lastMsg.content?.trim()
      : lastMsg?.file?._id
      ? "Send a file to you"
      : lastMsg?.media?.length
      ? "Send media to you"
      : "";
    const maxWidth = isMobile ? "145px" : "100px";
    const marginBottom = isMobile ? "5px" : "0px";
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          marginBottom: marginBottom,
        }}
      >
        <span
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: maxWidth,
            flexGrow: 1,
          }}
        >
          {userPrefix + ": " + msgContent}
        </span>
        <span
          style={{
            flexShrink: 0,
            whiteSpace: "nowrap",
            marginLeft: "8px",
            minWidth: "50px",
          }}
        >
          {" • " + dayjs(lastMsg?.createdAt).fromNow(true)}
        </span>
      </div>
    );
  };

  const handleClickConversation = () => {
    if (_id && selectedConversation?._id !== _id) {
      dispatch(selectConversation(conversation));
      const newPath = `/chat/${conversation?._id}`;
      history.pushState(null, "", newPath);
      const hiddenChatLayer = document.getElementById("chat-hidden-layer");
      if (onSelect) {
        onSelect(conversation);
      }
      if (hiddenChatLayer) {
        hiddenChatLayer.style.opacity = "1";
        hiddenChatLayer.style.visibility = "visible";
      }
    }
  };

  return (
    <Flex
      id={`conversation_${conversation?._id}`}
      gap={4}
      alignItems={"center"}
      p={2}
      _hover={{
        cursor: "pointer",
        bg: "gray",
        color: "white",
      }}
      bg={_id === selectedConversation?._id ? "gray" : ""}
      borderRadius={"md"}
      onClick={() => {
        handleClickConversation();
      }}
    >
      <WrapItem>
        <Avatar
          size={{ base: "md", sm: "sm", md: "md" }}
          src={participant?.avatar}
        >
          <AvatarBadge boxSize={"1em"} bg={"green.500"} />
        </Avatar>
      </WrapItem>
      <Stack direction={"column"} fontSize={isMobile ? "md" : "sm"}>
        <Text fontWeight={"700"} display={"flex"} alignItems={"center"}>
          {participant?.username}
        </Text>
        <Container
          p={0}
          m={0}
          fontSize={isMobile ? "md" : "xs"}
          display={"flex"}
          alignItems={"center"}
          gap={1}
          maxWidth={"100%"}
          color={isSeen ? "lightgray" : "white"}
        >
          {handleLastMsgInfo()}
        </Container>
      </Stack>
    </Flex>
  );
};

export default ConversationBar;
