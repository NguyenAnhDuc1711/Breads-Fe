"use client";

import { useBreakpointValue } from "../components/ui/primitives";
import { useEffect, useRef, useState } from "react";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import LeftSideBarMsg from "../components/Message/LeftSideBar";
import RightSideMsg from "../components/Message/RightSide";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { HeaderHeight } from "../Layout";
import { AppState } from "../store";
import { selectConversation } from "../store/MessageSlice";
import { getConversationById } from "../store/MessageSlice/asyncThunk";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import "./ChatPage.css";

const ChatPage = ({ conversationId }: { conversationId?: string }) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const init = useRef(true);
  const [showRightSide, setShowRightSide] = useState<boolean>(false);
  const isMobile: boolean | undefined = useBreakpointValue({
    base: true,
    md: false,
  });

  useEffect(() => {
    addEvent({
      event: "see_page",
      payload: {
        page: "chat",
      },
    });
  }, []);

  useEffect(() => {
    if (!!conversationId) {
      if (
        !selectedConversation ||
        selectedConversation?._id !== conversationId
      ) {
        dispatch(getConversationById(conversationId));
      }
      if (isMobile) {
        setShowRightSide(true);
      }
    }
    if (init.current) {
      dispatch(changePage({ nextPage: PageConstant.CHAT }));
      init.current = false;
    }
  }, [conversationId, isMobile]);

  const handleBackToLeft = (): void => {
    setShowRightSide(false);
    dispatch(selectConversation(null));
  };

  return (
    <div
      className="chat-page"
      id={"chat-page"}
      style={{ top: `${HeaderHeight + 12}px` }}
    >
      {!isMobile || !showRightSide ? (
        <div
          className={`${
            isMobile ? "chat-page__pane--left-full" : "chat-page__pane--left-partial"
          }${
            showRightSide && isMobile ? " chat-page__pane--hidden" : " chat-page__pane--visible"
          }`}
        >
          <LeftSideBarMsg onSelectConversation={() => setShowRightSide(true)} />
        </div>
      ) : null}

      {!isMobile || showRightSide ? (
        <div
          className={`chat-page__pane--right${
            !showRightSide && isMobile ? " chat-page__pane--hidden" : " chat-page__pane--visible"
          }`}
        >
          <RightSideMsg
            onBack={handleBackToLeft}
            onDetailBack={() => setShowRightSide(true)}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ChatPage;
