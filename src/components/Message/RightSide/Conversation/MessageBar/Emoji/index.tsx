import { SearchIcon } from "../../../../../../assests/chakraIcons";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "../../../../../ui/primitives";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "../../../../../ui/primitives";
import { memo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdEmojiEmotions } from "react-icons/md";
import { ACTIONS, iconStyle } from "..";
import { replaceEmojis } from "../../../../../../util";
import IconWrapper from "../IconWrapper";
import EmojiBox from "./EmojiBox";
import "./index.css";

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
              type="button"
              className="emoji-btn-trigger"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpen(ACTIONS.EMOJI);
              }}
            >
              <MdEmojiEmotions
                style={{
                  ...iconStyle,
                  width: "fit-content",
                  color: color ? color : undefined,
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="emoji-popover-content">
            <PopoverHeader className="emoji-popover-header">
              <div className="emoji-popover-header-row">
                <InputGroup className="emoji-search-group">
                  <InputLeftElement pointerEvents="none" height={"32px"}>
                    <SearchIcon
                      color="gray.300"
                      height={"16px"}
                      width={"16px"}
                    />
                  </InputLeftElement>
                  <Input
                    className="emoji-search-input"
                    type="text"
                    placeholder="Search emoji"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </InputGroup>
                <IconWrapper icon={<IoMdClose onClick={() => onClose()} />} />
              </div>
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody className="emoji-popover-body">
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
