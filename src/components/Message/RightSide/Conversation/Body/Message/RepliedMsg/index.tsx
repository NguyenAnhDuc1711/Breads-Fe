import { Text } from "../../../../../../ui/primitives";
import { useEffect, useState } from "react";
import { MdOutlineAttachFile, MdOutlineReply } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  MESSAGE_PATH,
  Route,
} from "../../../../../../../Breads-Shared/APIConfig";
import Socket from "../../../../../../../socket";
import {
  IMessage,
  updateCurrentPageMsg,
} from "../../../../../../../store/MessageSlice";
import { getMsgs } from "../../../../../../../store/MessageSlice/asyncThunk";
import { getCurrentTheme } from "../../../../../../../util/Themes";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../../hooks/redux";
import { AppState } from "../../../../../../../store";
import "./index.css";

const RepliedMsg = ({
  msg,
  repliedMsg,
}: {
  msg: IMessage;
  repliedMsg: IMessage;
}) => {
  const dispatch = useAppDispatch();
  const { selectedConversation, loadingMsgs, currentPageMsg } = useAppSelector(
    (state: AppState) => state.message
  );
  const msgEle = document.getElementById(`msg_${repliedMsg?._id}`);
  const participant = selectedConversation?.participant;
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const { sender, content, media, file } = repliedMsg;
  const { user1Message, user2Message } = getCurrentTheme(
    selectedConversation?.theme
  );
  const ownRepliedMessage = userInfo?._id === sender;
  const ownMessage = msg?.sender === userInfo?._id;
  const msgStyle = ownMessage ? user1Message : user2Message;
  const msgColor = msgStyle?.color;
  const borderColor = msgStyle?.borderColor;
  const bubbleDynamicStyle = {
    color: msgColor,
    border: borderColor ? `1px solid ${borderColor}` : undefined,
  };
  const [startScroll, setStartScroll] = useState(false);

  useEffect(() => {
    if (startScroll && msgEle && !loadingMsgs) {
      msgEle.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    setStartScroll(false);
  }, [loadingMsgs, startScroll]);

  const clickSeeDetailMsg = () => {
    if (!msgEle) {
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.GET_MSGS_BY_SEARCH,
        {
          userId: userInfo._id,
          conversationId: selectedConversation?._id,
          limit: 30,
          searchMsgId: msg._id,
          currentPage: currentPageMsg,
        },
        ({ data, page }) => {
          if (data?.length) {
            dispatch(
              getMsgs({
                msgs: data,
                isNew: false,
              })
            );
            dispatch(updateCurrentPageMsg(page));
          }
        }
      );
      setTimeout(() => {
        setStartScroll(true);
      }, 1500);
    } else {
      setStartScroll(true);
    }
  };

  return (
    <div
      className="replied-msg"
      onClick={() => {
        clickSeeDetailMsg();
      }}
    >
      <div
        className={`replied-msg__header${
          ownMessage ? " replied-msg__header--own" : " replied-msg__header--other"
        }`}
        style={{ color: msgColor }}
      >
        <MdOutlineReply />{" "}
        <span className="replied-msg__header-text">
          Reply to {ownRepliedMessage ? "yourself" : participant?.username}
        </span>
      </div>
      {content?.trim() ? (
        <Text
          className={`replied-msg__bubble${
            ownMessage ? " replied-msg__bubble--own" : " replied-msg__bubble--other"
          }`}
          style={bubbleDynamicStyle}
        >
          {content}
        </Text>
      ) : (
        <>
          {(media?.length || file?._id) && (
            <div
              className={`replied-msg__attach-row replied-msg__bubble${
                ownMessage ? " replied-msg__bubble--own" : " replied-msg__bubble--other"
              }`}
              style={bubbleDynamicStyle}
            >
              <MdOutlineAttachFile />
              <Text ml={1}>
                Attached {media?.length ? media[0].type : "file"}
              </Text>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RepliedMsg;
