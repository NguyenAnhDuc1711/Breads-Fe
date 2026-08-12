import { SearchIcon } from "../../../../../../assests/chakraIcons";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { memo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";
import { ACTIONS, iconStyle } from "..";
import { replaceEmojis } from "../../../../../../util";
import IconWrapper from "../IconWrapper";
import EmojiBox from "./EmojiBox";

const EmojiMsgBtn = ({
  popup,
  closeTooltip,
  onClose,
  onOpen,
  inputRef,
  setContent,
  color = "",
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleAddEmojiToInput = (emojiIcon) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      const newText = text.slice(0, start) + emojiIcon + text.slice(end);
      setContent(replaceEmojis(newText));
      setTimeout(() => {
        input.focus();
        input.selectionStart = input.selectionEnd = start + emojiIcon.length;
      }, 0);
    }
  };

  return (
    <IconWrapper
      label={closeTooltip ? "" : ACTIONS.EMOJI}
      icon={
        <Popover
          isOpen={popup === ACTIONS.EMOJI}
          placement="top"
          onClose={() => onClose()}
        >
          <PopoverTrigger>
            <Button
              padding={0}
              style={{ ...iconStyle, width: "fit-content" }}
              bg={"transparent"}
              _hover={{
                bg: "transparent",
              }}
              onClick={() => onOpen(ACTIONS.EMOJI)}
            >
              <MdEmojiEmotions
                style={{
                  ...iconStyle,
                  width: "fit-content",
                  color: color ? color : "",
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent width={"fit-content"}>
            <PopoverHeader
              fontWeight="semibold"
              textAlign={"center"}
              padding={"8px 4px"}
            >
              <Flex alignItems={"center"} justifyContent={"space-between"}>
                <InputGroup maxWidth={"160px"} height={"32px"}>
                  <InputLeftElement pointerEvents="none" height={"32px"}>
                    <SearchIcon
                      color="gray.300"
                      height={"16px"}
                      width={"16px"}
                    />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search emoji"
                    height={"32px"}
                    fontSize={"14px"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </InputGroup>
                <IconWrapper icon={<IoMdClose onClick={() => onClose()} />} />
              </Flex>
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody padding={"8px 4px"} width={"fit-content"}>
              <EmojiBox
                searchValue={searchValue}
                onClick={(emojiIcon) => handleAddEmojiToInput(emojiIcon)}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      }
    />
  );
};

export default memo(EmojiMsgBtn);
