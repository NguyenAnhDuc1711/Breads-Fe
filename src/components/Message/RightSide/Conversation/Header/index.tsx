"use client";

import { InfoIcon } from "../../../../../assests/chakraIcons";
import { Avatar, Text, useBreakpointValue } from "../../../../ui/primitives";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { useAppSelector } from "../../../../../hooks/redux";
import { AppState } from "../../../../../store";
import { addEvent } from "../../../../../util";
import { getCurrentTheme } from "../../../../../util/Themes";
import "./index.css";

const ConversationHeader = ({
  openDetailTab,
  setOpenDetailTab,
  onBack,
}: {
  openDetailTab: boolean;
  setOpenDetailTab: Function;
  onBack: Function;
}) => {
  const router = useRouter();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const participant = selectedConversation?.participant;
  const { conversationBackground, user1Message } = getCurrentTheme(
    selectedConversation?.theme
  );
  const borderColor = user1Message?.borderColor;
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <div
      className={`conv-header${isMobile ? " conv-header--mobile" : ""}`}
      style={{
        backgroundColor: conversationBackground?.backgroundColor,
        backgroundBlendMode: conversationBackground?.backgroundBlendMode,
        color: borderColor || undefined,
      }}
    >
      <div className="conv-header__user">
        {isMobile && (
          <div
            className="conv-header__back"
            onClick={() => {
              onBack();
            }}
          >
            <IoIosArrowBack />
          </div>
        )}

        <Avatar
          src={participant?.avatar}
          size={"sm"}
          onClick={() => {
            router.push(`/users/${participant?._id}`);
          }}
        />
        <Text className="conv-header__username">
          {participant?.username}{" "}
        </Text>
      </div>
      <InfoIcon
        className="conv-header__info-icon"
        onClick={() => {
          addEvent({
            event: "open_detail_chat_tab",
            payload: {},
          });
          setOpenDetailTab(!openDetailTab);
        }}
      />
    </div>
  );
};

export default ConversationHeader;
