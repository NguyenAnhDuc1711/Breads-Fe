import { Avatar, Text } from "../../../../ui/primitives";
import { useEffect, useState } from "react";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import Socket from "../../../../../socket";
import { AppState } from "../../../../../store";
import {
  IMessage,
  updateCurrentPageMsg,
} from "../../../../../store/MessageSlice";
import { getMsgs } from "../../../../../store/MessageSlice/asyncThunk";
import { formatItemDate } from "../../../../../util";
import "./msgSearch.css";

const MessageSearchItem = ({ msg }: { msg: IMessage }) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const { selectedConversation, currentPageMsg, loadingMsgs } = useAppSelector(
    (state: AppState) => state.message
  );
  const participant = selectedConversation?.participant;
  const isOwnMsg = msg?.sender === userInfo?._id;
  const userData = isOwnMsg ? userInfo : participant;
  const currentYear = new Date().getFullYear();
  const msgYear = msg?.createdAt
    ? new Date(msg?.createdAt).getFullYear()
    : new Date().getFullYear();
  const [startScroll, setStartScroll] = useState(false);
  const msgEle = document.getElementById(`msg_${msg?._id}`);

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
    <div className="msg-search-item" onClick={() => clickSeeDetailMsg()}>
      <div className="msg-search-item__row">
        <Avatar src={userData?.avatar} size={"sm"} />
        <div
          className={`msg-search-item__text-col${
            currentYear === msgYear
              ? " msg-search-item__text-col--wide"
              : " msg-search-item__text-col--narrow"
          }`}
        >
          <Text fontSize={"14px"} fontWeight={600}>
            {userData?.username}
          </Text>
          <Text fontSize={"11px"} fontWeight={400}>
            {msg?.content}
          </Text>
        </div>
      </div>
      <Text className="msg-search-item__date">
        {formatItemDate(msg?.createdAt)}
      </Text>
    </div>
  );
};

export default MessageSearchItem;
