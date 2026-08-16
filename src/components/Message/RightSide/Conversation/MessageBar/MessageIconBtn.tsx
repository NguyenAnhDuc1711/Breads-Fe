import { iconStyle } from ".";
import { useAppSelector } from "../../../../../hooks/redux";
import { AppState } from "../../../../../store";
import { getEmojiIcon } from "../../../../../util";

const MessageIconBtn = ({ handleSendMsg }) => {
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const emoji = selectedConversation?.emoji;
  const iconStr = getEmojiIcon(emoji);

  return (
    <div
      style={{
        ...iconStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        lineHeight: 1,
      }}
      onClick={() => {
        handleSendMsg({ sendIcon: iconStr });
      }}
    >
      {iconStr}
    </div>
  );
};

export default MessageIconBtn;
