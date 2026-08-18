import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaAngleDown } from "react-icons/fa";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { Constants } from "../../../../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import useSocket from "../../../../../hooks/useSocket";
import Socket from "../../../../../socket";
import { AppState } from "../../../../../store";
import {
  addNewMsg,
  updateConversations,
  updateCurrentPageMsg,
  updateMsg,
  updateSelectedConversation,
} from "../../../../../store/MessageSlice";
import { getMsgs } from "../../../../../store/MessageSlice/asyncThunk";
import { updateUserInfo } from "../../../../../store/UserSlice";
import {
  formatDateToDDMMYYYY,
  getEmojiNameFromIcon,
} from "../../../../../util";
import { getCurrentTheme } from "../../../../../util/Themes";
import InfiniteScroll from "../../../../InfiniteScroll";
import { Button, Text } from "../../../../ui/primitives";
import "./index.css";
import Message from "./Message";
import SendNextBox from "./SendNextBox";

const ConversationBody = ({ openDetailTab }: { openDetailTab: boolean }) => {
  const currentDateFormat = formatDateToDDMMYYYY(new Date());
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { selectedConversation, messages, currentPageMsg } = useAppSelector(
    (state: AppState) => state.message,
  );
  const lastMsg = selectedConversation?.lastMsg;
  const [scrollText, setScrollText] = useState("Move to current");
  const [noticeNewMsgBox, setNoticeNewMsgBox] = useState(false);
  const conversationScreenRef = useRef<any>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const { conversationBackground, user1Message } = getCurrentTheme(
    selectedConversation?.theme,
  );
  const participant = selectedConversation?.participant;

  const lastUserSeen = useMemo(() => {
    const allMsg = Object.values(messages)?.flat(Infinity);
    const participantSeen = allMsg?.filter((msg: any) =>
      msg?.usersSeen?.some(
        (u: any) => String(u?._id || u) === String(participant?._id),
      ),
    );
    return participantSeen?.[participantSeen?.length - 1];
  }, [messages, participant?._id]);

  useEffect(() => {
    if (selectedConversation?._id && userInfo?._id) {
      setFirstLoad(true);
      handleGetMsgs({ page: 1 });
    }
  }, [selectedConversation?._id, userInfo]);

  useSocket((socket) => {
    const handleGetMessage = (data: any) => {
      const conversationInfo = data?.conversationInfo;
      const msgs = data?.msgs;
      if (msgs) {
        const msgDate = formatDateToDDMMYYYY(new Date(msgs[0]?.createdAt));
        const isValid = messages[msgDate]?.find(
          ({ _id }) => msgs[0]?._id === _id,
        );
        if (!isValid) {
          dispatch(addNewMsg(msgs));
          dispatch(updateConversations([conversationInfo]));
          setScrollText("New message");
          if (conversationInfo?._id !== selectedConversation?._id) {
            dispatch(
              updateUserInfo({
                key: "hasNewMsg",
                value: true,
              }),
            );
          }
          if (msgs?.[0]?.type === Constants.MSG_TYPE.SETTING) {
            const splitContent = msgs[0].content.split(" ");
            const value = splitContent[splitContent?.length - 1];
            if (splitContent?.includes("theme")) {
              dispatch(
                updateSelectedConversation({
                  key: "theme",
                  value: value,
                }),
              );
            }
            if (splitContent?.includes("emoji")) {
              dispatch(
                updateSelectedConversation({
                  key: "emoji",
                  value: getEmojiNameFromIcon(value),
                }),
              );
            }
          }
        }
      }
    };

    const handleUpdateMsg = (data: any) => {
      if (data) {
        dispatch(updateMsg(data));
        if (data?._id === lastMsg?._id) {
          dispatch(
            updateSelectedConversation({
              key: "lastMsg",
              value: data,
            }),
          );
        }
      }
    };

    socket.on(Route.MESSAGE + MESSAGE_PATH.GET_MESSAGE, handleGetMessage);
    socket.on(Route.MESSAGE + MESSAGE_PATH.UPDATE_MSG, handleUpdateMsg);

    return () => {
      socket.off(Route.MESSAGE + MESSAGE_PATH.GET_MESSAGE, handleGetMessage);
      socket.off(Route.MESSAGE + MESSAGE_PATH.UPDATE_MSG, handleUpdateMsg);
    };
  }, []);

  useEffect(() => {
    const conversationTag = document.getElementById("conversation-body");
    if (conversationTag) {
      const listener = () => {
        const { scrollTop, clientHeight, scrollHeight } = conversationTag;
        if (scrollTop + clientHeight < scrollHeight) {
          setNoticeNewMsgBox(true);
        } else {
          setNoticeNewMsgBox(false);
        }
      };
      conversationTag.addEventListener("scroll", listener);
      return () => {
        conversationTag.removeEventListener("scroll", listener);
      };
    }
  }, []);

  useLayoutEffect(() => {
    if (firstLoad && Object.keys(messages)?.length > 0) {
      scrollToBottom(true);
      setFirstLoad(false);
    }
  }, [messages, firstLoad]);

  useEffect(() => {
    if (!firstLoad && !!lastMsg) {
      scrollToBottom(false);
    }
    if (
      lastMsg?._id &&
      userInfo?._id &&
      !lastMsg?.usersSeen?.includes(userInfo?._id)
    ) {
      handleUpdateLastSeen();
    }
  }, [lastMsg?._id, firstLoad, userInfo?._id, selectedConversation?._id]);

  const handleUpdateLastSeen = () => {
    try {
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.SEEN_MSGS,
        {
          userId: userInfo?._id,
          lastMsg: lastMsg,
          recipientId: selectedConversation?.participant?._id,
        },
        ({ data }) => {
          dispatch(updateMsg(data));
          dispatch(
            updateSelectedConversation({
              key: "lastMsg",
              value: data,
            }),
          );
        },
      );
    } catch (err) {
      console.error("handleUpdateLastSeen: ", err);
    }
  };

  const scrollToBottom = (isInstant = false) => {
    if (conversationScreenRef?.current) {
      const listMsgEle = document.getElementById("list-msg");
      conversationScreenRef.current.scrollTo({
        top: listMsgEle?.scrollHeight,
        behavior: isInstant ? "auto" : "smooth",
      });
    }
  };

  const handleGetMsgs = async ({ page }) => {
    try {
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.GET_MESSAGES,
        {
          userId: userInfo._id,
          conversationId: selectedConversation?._id,
          page: page,
          limit: 30,
        },
        (res) => {
          const isNew = page === 1;
          const { data } = res;
          if (data.length) {
            dispatch(
              getMsgs({
                isNew: isNew ? true : false,
                msgs: data,
              }),
            );
            dispatch(updateCurrentPageMsg(page));
          }
        },
      );
    } catch (err) {
      console.error("handleGetMsgs: ", err);
    }
  };

  return (
    <>
      <div
        id="conversation-body"
        className="conversation-body"
        ref={conversationScreenRef}
        style={{
          backgroundBlendMode: conversationBackground?.backgroundBlendMode,
          backgroundImage: `url(${conversationBackground?.backgroundImage})`,
        }}
      >
        <div className="conversation-body__list" id="list-msg">
          <InfiniteScroll
            queryFc={(page) => {
              handleGetMsgs({ page: page });
            }}
            data={Object.keys(messages)}
            cpnFc={(date) => {
              const msgs = messages[date] || [];
              const brStyle = {
                backgroundColor: user1Message?.backgroundColor,
              };
              const participantMsgsIndex: number[] = [];
              msgs.forEach((msg: any, index: number) => {
                const senderId =
                  typeof msg?.sender === "object" && msg?.sender !== null
                    ? msg?.sender?._id || msg?.sender?.id || String(msg?.sender)
                    : msg?.sender;
                if (String(senderId) !== String(userInfo?._id)) {
                  participantMsgsIndex.push(index);
                }
              });
              const displayAvaIndex: number[] = [];
              for (let i = 0; i < participantMsgsIndex.length; i++) {
                if (
                  participantMsgsIndex[i - 1]
                    ? participantMsgsIndex[i - 1] != participantMsgsIndex[i] - 1
                    : true
                ) {
                  displayAvaIndex.push(participantMsgsIndex[i]);
                }
              }
              return (
                <Fragment key={date}>
                  <div className="conversation-body__date-row">
                    <div
                      className="conversation-body__date-line"
                      style={brStyle}
                    />
                    <Text px={2} color={user1Message?.backgroundColor}>
                      {date === currentDateFormat ? "Today" : date}
                    </Text>
                    <div
                      className="conversation-body__date-line"
                      style={brStyle}
                    />
                  </div>
                  {msgs.map((msg, index) => (
                    <Message
                      key={msg?._id ?? index}
                      msg={msg}
                      isLastSeen={lastUserSeen?._id === msg?._id}
                      displayUserAva={displayAvaIndex.includes(index)}
                    />
                  ))}
                </Fragment>
              );
            }}
            condition={!!userInfo?._id && selectedConversation?._id}
            reverseScroll={true}
            elementId={"conversation-body"}
            updatePageValue={currentPageMsg}
          />
        </div>
      </div>
      {noticeNewMsgBox && (
        <Button
          className={`conversation-body__scroll-btn${
            openDetailTab
              ? " conversation-body__scroll-btn--detail"
              : " conversation-body__scroll-btn--full"
          }`}
          onClick={() => {
            scrollToBottom();
            setNoticeNewMsgBox(false);
            setScrollText("Move to current");
          }}
        >
          <div className="conversation-body__scroll-btn-inner">
            {scrollText}
            <FaAngleDown />
          </div>
        </Button>
      )}
      <SendNextBox />
    </>
  );
};

export default ConversationBody;
