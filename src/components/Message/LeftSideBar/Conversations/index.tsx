"use client";

import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyContentSvg } from "../../../../assests/icons";
import { MESSAGE_PATH, Route } from "../../../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import Socket from "../../../../socket";
import { AppState } from "../../../../store";
import {
  selectConversation,
  updateCurrentPageConversation,
} from "../../../../store/MessageSlice";
import { getConversations } from "../../../../store/MessageSlice/asyncThunk";
import { addEvent } from "../../../../util";
import InfiniteScroll from "../../../InfiniteScroll";
import ConversationBar from "./ConversationBar";
import ConversationSkeleton from "./ConversationBar/skeleton";

const Conversations = ({
  searchValue,
  onSelect,
}: {
  searchValue: string;
  onSelect: Function;
}) => {
  const conversationId = useParams<{ conversationId?: string }>()
    ?.conversationId;
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const currentPage = useAppSelector(
    (state: AppState) => state.util.currentPage
  );
  const {
    conversations,
    selectedConversation,
    loadingConversations,
    limitConversation,
    currentPageConversation,
  } = useAppSelector((state: AppState) => state.message);
  const [init, setInit] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (userInfo._id) {
      setInit(false);
    }
    if (selectedConversation?._id) {
      const timeout = setTimeout(() => {
        const conversationHtml = document.getElementById(
          `conversation_${selectedConversation?._id}`
        );
        // conversationHtml?.scrollIntoView();
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [userInfo._id, selectedConversation?._id]);

  useEffect(() => {
    if (!init) {
      handleGetConversations({ page: 1 });
      addEvent({
        event: "search_conversations",
        payload: {
          searchValue: searchValue,
        },
      });
    }
  }, [searchValue]);

  const handleGetConversations = async ({ page }) => {
    const socket = Socket.getInstant();
    socket.emit(
      Route.MESSAGE + MESSAGE_PATH.GET_CONVERSATIONS,
      {
        userId: userInfo._id,
        page: page,
        limit: limitConversation,
        searchValue,
      },
      (res) => {
        const { data } = res;
        if (data) {
          dispatch(
            getConversations({
              data: data,
              isLoadNew: page === 1 ? true : false,
            })
          );
          dispatch(updateCurrentPageConversation(page));
          if (!selectedConversation && !conversationId && !isMobile) {
            dispatch(selectConversation(data[0]));
          }
        }
      }
    );
  };

  return (
    <>
      {conversations?.length !== 0 || !init ? (
        <>
          <InfiniteScroll
            queryFc={(page) => {
              handleGetConversations({
                page,
              });
            }}
            data={conversations}
            cpnFc={(conversation) => (
              <ConversationBar
                key={conversation?._id}
                conversation={conversation}
                onSelect={onSelect}
              />
            )}
            condition={!init}
            deps={[userInfo._id, currentPage]}
            skeletonCpn={<ConversationSkeleton />}
            preloadIndex={1}
            updatePageValue={currentPageConversation}
          />
        </>
      ) : (
        <>
          {loadingConversations ? (
            <Flex
              gap={"12px"}
              flexDirection={"column"}
              justifyContent={"center"}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <ConversationSkeleton key={`skeleton-conversation-${num}`} />
              ))}
            </Flex>
          ) : (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <EmptyContentSvg />
            </Flex>
          )}
        </>
      )}
    </>
  );
};

export default Conversations;
