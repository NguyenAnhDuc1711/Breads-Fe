"use client";

import { InfoIcon } from "../../../../../assests/chakraIcons";
import {
  Avatar,
  Box,
  Flex,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { useAppSelector } from "../../../../../hooks/redux";
import { AppState } from "../../../../../store";
import { addEvent } from "../../../../../util";
import { getCurrentTheme } from "../../../../../util/Themes";

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
    <Flex
      w={"full"}
      p={1}
      alignItems={"center"}
      justifyContent={"space-between"}
      height={"56px"}
      bg={conversationBackground?.backgroundColor}
      backgroundBlendMode={conversationBackground?.backgroundBlendMode}
      color={borderColor ? borderColor : ""}
    >
      <Flex
        width={"fit-content"}
        h={12}
        alignItems={"center"}
        gap={2}
        px={2}
        cursor={"pointer"}
      >
        {isMobile && (
          <Flex
            alignItems={"center"}
            onClick={() => {
              onBack();
            }}
          >
            <IoIosArrowBack />
            {/* <Box
              bg={"red"}
              borderRadius={"50%"}
              fontSize={"sm"}
              textAlign={"center"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"auto"}
              height={"auto"}
              minWidth={"24px"}
              minHeight={"24px"}
              padding={"1px"}
            >
              9
            </Box> */}
          </Flex>
        )}

        <Avatar
          src={participant?.avatar}
          size={"sm"}
          onClick={() => {
            router.push(`/users/${participant?._id}`);
          }}
        />
        <Text display={"flex"} alignItems={"center"}>
          {participant?.username}{" "}
        </Text>
      </Flex>
      <InfoIcon
        mr={5}
        width={"20px"}
        height={"20px"}
        cursor={"pointer"}
        onClick={() => {
          addEvent({
            event: "open_detail_chat_tab",
            payload: {},
          });
          setOpenDetailTab(!openDetailTab);
        }}
      />
    </Flex>
  );
};

export default ConversationHeader;
