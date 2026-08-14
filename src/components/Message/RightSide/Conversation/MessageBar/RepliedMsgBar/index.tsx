import { CloseIcon } from "../../../../../../assests/chakraIcons";
import { Text } from "../../../../../ui/primitives";
import { MdOutlineAttachFile, MdOutlineReply } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import { selectMsg } from "../../../../../../store/MessageSlice";
import { getCurrentTheme } from "../../../../../../util/Themes";
import "./index.css";

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
        <div className="replied-msg-bar__attach-row">
          <MdOutlineAttachFile />
          <Text ml={1}>Attached {media?.length ? media[0].type : "file"}</Text>
        </div>
      );
    }
    return (
      <Text className="replied-msg-bar__content-text">
        {selectedMsg?.content}
      </Text>
    );
  };

  return (
    <div
      className="replied-msg-bar"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <MdOutlineReply />
      <div className="replied-msg-bar__content-col">
        <Text>
          Reply to{" "}
          <span className="replied-msg-bar__username">
            {participant?.username}
          </span>
        </Text>
        {handleMsgContent()}
      </div>
      <CloseIcon
        className="replied-msg-bar__close"
        onClick={() => {
          dispatch(selectMsg(null));
        }}
      />
    </div>
  );
};

export default RepliedMsgBar;
