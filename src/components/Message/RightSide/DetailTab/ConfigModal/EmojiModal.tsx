import { SearchIcon } from "../../../../../assests/chakraIcons";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import Socket from "../../../../../socket";
import { AppState } from "../../../../../store";
import {
  addNewMsg,
  updateSelectedConversation,
} from "../../../../../store/MessageSlice";
import {
  addEvent,
  getEmojiIcon,
  getEmojiNameFromIcon,
} from "../../../../../util";
import EmojiBox from "../../Conversation/MessageBar/Emoji/EmojiBox";
import IconWrapper from "../../Conversation/MessageBar/IconWrapper";

const EmojiModal = ({ setItemSelected }) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [searchEmojiValue, setSearchEmojiValue] = useState("");

  const handleChangeEmoji = async (emojiStr) => {
    try {
      addEvent({
        event: "change_conversation_emoji",
        payload: {
          emojiStr: emojiStr,
          conversationId: selectedConversation?._id,
        },
      });
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.CONFIG_CONVERSATION,
        {
          key: "emoji",
          value: emojiStr,
          conversationId: selectedConversation?._id,
          userId: userInfo?._id,
          recipientId: selectedConversation?.participant?._id,
          changeSettingContent:
            "has change conversation's emoji into " + getEmojiIcon(emojiStr),
        },
        ({ data }) => {
          const msgs = data?.msgs;
          const conversationInfo = data?.conversationInfo;
          if (msgs) {
            dispatch(addNewMsg(msgs));
            dispatch(
              updateSelectedConversation({
                key: "emoji",
                value: emojiStr,
              })
            );
          }
        }
      );
      setItemSelected("");
    } catch (err) {
      console.error("handleChangeEmoji: ", err);
    }
  };

  return (
    <>
      <Flex alignItems={"center"} justifyContent={"space-between"} mb={3}>
        <InputGroup maxWidth={"160px"} height={"32px"}>
          <InputLeftElement pointerEvents="none" height={"32px"}>
            <SearchIcon color="gray.300" height={"16px"} width={"16px"} />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search emoji"
            height={"32px"}
            fontSize={"14px"}
            value={searchEmojiValue}
            onChange={(e) => setSearchEmojiValue(e.target.value)}
          />
        </InputGroup>
        <IconWrapper icon={<IoMdClose onClick={() => setItemSelected("")} />} />
      </Flex>
      <EmojiBox
        searchValue={searchEmojiValue}
        currentEmoji={getEmojiIcon(selectedConversation?.emoji)}
        onClick={(emojiIcon) =>
          handleChangeEmoji(getEmojiNameFromIcon(emojiIcon))
        }
      />
    </>
  );
};

export default EmojiModal;
