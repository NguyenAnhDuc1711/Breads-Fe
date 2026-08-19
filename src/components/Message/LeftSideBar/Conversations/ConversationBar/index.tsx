import { Avatar, AvatarBadge, Text } from "../../../../ui/primitives";
import { WrapItem } from "../../../../ui/primitives";
import dayjs from "../../../../../util/dayjs";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import { AppState } from "../../../../../store";
import { selectConversation } from "../../../../../store/MessageSlice";
import { formatUnreadBadge } from "../../../../../util";
import "./index.css";

const ConversationBar = ({
  conversation,
  onSelect,
}: {
  conversation: any;
  onSelect: Function;
}) => {
  const dispatch = useAppDispatch();
  const { _id, emoji, updatedAt, lastMsg, participant, unreadCount } =
    conversation;
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const selectedConversation = useAppSelector(
    (state) => state.message.selectedConversation
  );
  const isSeen = lastMsg?.usersSeen?.includes(userInfo?._id);

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
    return (
      <div className="conversation-bar__last-msg-row">
        <span className="conversation-bar__last-msg-text">
          {userPrefix + ": " + msgContent}
        </span>
        <span className="conversation-bar__last-msg-time">
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
    <div
      id={`conversation_${conversation?._id}`}
      className={`conversation-bar${
        _id === selectedConversation?._id ? " conversation-bar--selected" : ""
      }`}
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
      <div className="conversation-bar__stack">
        <Text className="conversation-bar__username">
          {participant?.username}
        </Text>
        <div
          className={`conversation-bar__last-msg${
            isSeen
              ? " conversation-bar__last-msg--seen"
              : " conversation-bar__last-msg--unseen"
          }`}
        >
          {handleLastMsgInfo()}
        </div>
      </div>
      {unreadCount > 0 && (
        <span className="conversation-bar__unread-badge">
          {formatUnreadBadge(unreadCount)}
        </span>
      )}
    </div>
  );
};

export default ConversationBar;
