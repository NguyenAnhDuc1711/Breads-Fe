import { Image } from "../../../../../ui/primitives";
import { memo } from "react";
import { MESSAGE_PATH, Route } from "../../../../../../Breads-Shared/APIConfig";
import {
  Constants,
  gif,
} from "../../../../../../Breads-Shared/Constants/index";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import Socket from "../../../../../../socket";
import { AppState } from "../../../../../../store";
import {
  addNewMsg,
  defaulMessageInfo,
  updateConversations,
} from "../../../../../../store/MessageSlice";
import "./GifMsgBox.css";

const GifMsgBox = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const participant = useAppSelector(
    (state: AppState) => state.message.selectedConversation?.participant
  );
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);

  const handleSendMsg = async (gifUrl) => {
    const socket = Socket.getInstant();
    const msgPayload = {
      recipientId: participant?._id,
      senderId: userInfo._id,
      message: {
        ...defaulMessageInfo,
        media: [
          {
            url: gifUrl,
            type: Constants.MEDIA_TYPE.GIF,
          },
        ],
      },
    };
    socket.emit(Route.MESSAGE + MESSAGE_PATH.CREATE, msgPayload, ({ data }) => {
      const conversationInfo = data?.conversationInfo;
      const msgs = data?.msgs;
      dispatch(addNewMsg(msgs));
      dispatch(updateConversations([conversationInfo]));
    });
    onClose();
  };

  return (
    <div className="gif-msg-box">
      <div className="gif-msg-box__grid">
        {gif.map((link, index) => (
          <Image
            className="gif-msg-box__item"
            loading="lazy"
            key={link}
            src={link}
            alt={`GIF ${index + 1}`}
            onClick={() => {
              handleSendMsg(link);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(GifMsgBox);
