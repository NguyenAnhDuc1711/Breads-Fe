import { Text } from "../../../../../../ui/primitives";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaDeleteLeft } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { MdEmojiEmotions, MdOutlineReply } from "react-icons/md";
import {
  MESSAGE_PATH,
  Route,
} from "../../../../../../../Breads-Shared/APIConfig";
import { Constants } from "../../../../../../../Breads-Shared/Constants";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../../hooks/redux";
import Socket from "../../../../../../../socket";
import { AppState } from "../../../../../../../store";
import {
  selectMsg,
  updateMsg,
  updateMsgAction,
  updateSendNextBox,
} from "../../../../../../../store/MessageSlice";
import { addEvent, getEmojiIcon } from "../../../../../../../util";
import ClickOutsideComponent from "../../../../../../../util/ClickoutCPN";
import "./index.css";

const MessageAction = ({ ownMsg, msg, previousReact }) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [openBox, setOpenBox] = useState(false);
  const [displayReactBox, setDisplayReactBox] = useState(false);
  const defaultEmoji = ["<3", ":D", ":O", ":(", ":slang"];
  const msgId = msg?._id;
  const { SEND_NEXT, REPLY, RETRIEVE } = Constants.MSG_ACTION;

  const boxActions = [
    {
      onClick: () => {
        dispatch(selectMsg(msg));
        dispatch(updateMsgAction(REPLY));
        setOpenBox(false);
      },
      icon: <MdOutlineReply />,
      name: REPLY,
    },
    {
      onClick: () => {
        dispatch(
          updateSendNextBox({
            key: "open",
            value: true,
          })
        );
        dispatch(selectMsg(msg));
        dispatch(updateMsgAction(SEND_NEXT));
        setOpenBox(false);
      },
      icon: <IoMdSend />,
      name: SEND_NEXT,
    },
  ];
  if (ownMsg) {
    boxActions.push({
      onClick: () => {
        handleRetriveMsg();
        dispatch(updateMsgAction(RETRIEVE));
        setOpenBox(false);
      },
      icon: <FaDeleteLeft />,
      name: RETRIEVE,
    });
  }

  const handleRetriveMsg = async () => {
    try {
      addEvent({
        event: "retrieve_msg",
        payload: {
          msgId: msg?._id,
          conversationId: selectedConversation?._id,
        },
      });
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.RETRIEVE,
        {
          msgId: msgId,
          userId: userInfo?._id,
          participantId: selectedConversation?.participant?._id,
        },
        ({ data }) => {
          dispatch(updateMsg(data));
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactMsg = async (react) => {
    try {
      addEvent({
        event: "react_msg",
        payload: {
          msgId: msg?._id,
          conversationId: selectedConversation?._id,
          react: react,
        },
      });
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.REACT,
        {
          participantId: selectedConversation?.participant?._id,
          userId: userInfo?._id,
          msgId: msgId,
          react: react,
        },
        ({ data }) => {
          setDisplayReactBox(false);
          if (data?._id) {
            dispatch(updateMsg(data));
          }
        }
      );
    } catch (err) {
      console.error("handleReactMsg: ", err);
    }
  };

  return (
    <div className={`msg-action${ownMsg ? " msg-action--own" : " msg-action--other"}`}>
      <ClickOutsideComponent
        onClose={() => {
          setOpenBox(false);
        }}
      >
        <div
          className="msg-action__btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpenBox(!openBox);
          }}
          title="More actions"
        >
          <BsThreeDots />
        </div>
        <div
          className={`msg-action__menu${openBox ? " msg-action__menu--open" : ""}${
            ownMsg ? " msg-action__menu--own" : " msg-action__menu--other"
          }`}
        >
          {boxActions.map(({ icon, name, onClick }) => (
            <div
              className="msg-action__menu-item"
              key={name}
              onClick={(e) => {
                e.stopPropagation();
                !!onClick && onClick();
              }}
            >
              {icon}
              <Text textTransform={"capitalize"}>{name}</Text>
            </div>
          ))}
        </div>
      </ClickOutsideComponent>

      <ClickOutsideComponent onClose={() => setDisplayReactBox(false)}>
        <div
          className={`msg-action__btn${displayReactBox ? " msg-action__btn--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setDisplayReactBox(!displayReactBox);
          }}
          title="React to message"
        >
          <MdEmojiEmotions />
        </div>
        {displayReactBox && (
          <div
            className={`msg-action__emoji-box${
              ownMsg ? " msg-action__emoji-box--own" : " msg-action__emoji-box--other"
            }`}
          >
            {defaultEmoji.map((emjStr) => (
              <div
                key={`emj-${emjStr}`}
                className={`msg-action__emoji-item${
                  previousReact === emjStr ? " msg-action__emoji-item--active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactMsg(emjStr);
                }}
              >
                {getEmojiIcon(emjStr)}
              </div>
            ))}
          </div>
        )}
      </ClickOutsideComponent>
    </div>
  );
};

export default MessageAction;
