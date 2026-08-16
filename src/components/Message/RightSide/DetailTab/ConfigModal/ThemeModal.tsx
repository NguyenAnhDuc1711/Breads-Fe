import { Text } from "../../../../ui/primitives";
import { IoCloseOutline, IoCheckmarkCircle } from "react-icons/io5";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import Socket from "../../../../../socket";
import { AppState } from "../../../../../store";
import {
  addNewMsg,
  updateConversations,
  updateSelectedConversation,
} from "../../../../../store/MessageSlice";
import { addEvent } from "../../../../../util";
import { messageThemes } from "../../../../../util/Themes/index";
import "./ThemeModal.css";

const ThemeModal = ({ setItemSelected }: { setItemSelected: Function }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );

  const handleChangeTheme = async (theme: string) => {
    addEvent({
      event: "change_conversation_theme",
      payload: {
        theme: theme,
        conversationId: selectedConversation?._id,
      },
    });
    const socket = Socket.getInstant();
    socket.emit(
      Route.MESSAGE + MESSAGE_PATH.CONFIG_CONVERSATION,
      {
        key: "theme",
        value: theme,
        conversationId: selectedConversation?._id,
        userId: userInfo?._id,
        recipientId: selectedConversation?.participant?._id,
        changeSettingContent: "has change conversation's theme into " + theme,
      },
      ({ data }) => {
        const conversationInfo = data?.conversationInfo;
        const msgs = data?.msgs;
        if (msgs?.length) {
          dispatch(addNewMsg(msgs));
          dispatch(
            updateSelectedConversation({
              key: "theme",
              value: theme,
            })
          );
          dispatch(updateConversations([conversationInfo]));
        }
      }
    );
    setItemSelected("");
  };

  return (
    <div className="theme-modal">
      <div className="theme-modal__header">
        <Text className="theme-modal__title">Select your theme</Text>
        <button
          type="button"
          className="theme-modal__close-btn"
          onClick={() => setItemSelected("")}
          aria-label="Close"
        >
          <IoCloseOutline size={22} />
        </button>
      </div>
      <div className="theme-modal__list-wrap">
        <div className="theme-modal__list">
          {Object.keys(messageThemes).map((theme) => {
            const themeInfo = messageThemes[theme];
            const themeName = themeInfo.name;
            const themeBg = themeInfo.conversationBackground.backgroundImage;
            const textColor = themeInfo.user1Message.color;
            const borderColor = themeInfo.user1Message.borderColor;
            const isSelected = (selectedConversation?.theme || "default") === theme;

            return (
              <div
                className={`theme-modal__item${
                  isSelected ? " theme-modal__item--selected" : ""
                }`}
                key={theme}
                style={{
                  backgroundImage: themeBg ? `url(${themeBg})` : undefined,
                  backgroundColor: !themeBg
                    ? themeInfo.conversationBackground.backgroundColor || "#1e1e1e"
                    : undefined,
                  borderColor: isSelected ? (borderColor || "#3b82f6") : undefined,
                }}
                onClick={() => {
                  handleChangeTheme(theme);
                }}
              >
                {isSelected && (
                  <div className="theme-modal__selected-badge">
                    <IoCheckmarkCircle size={20} color="#3b82f6" />
                  </div>
                )}
                <div className="theme-modal__item-overlay">
                  <span className="theme-modal__item-name">
                    {themeName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
