import { Button, Text } from "../../../../../ui/primitives";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "../../../../../ui/primitives";
import { IoMdClose } from "react-icons/io";
import { RiFileGifLine } from "react-icons/ri";
import { ACTIONS, iconStyle } from "..";
import IconWrapper from "../IconWrapper";
import GifMsgBox from "./GifMsgBox";
import "./index.css";

const GifMsgBtn = ({ popup, onClose, onOpen, color = "" }) => {
  return (
    <Popover
      isOpen={popup === ACTIONS.GIF}
      placement="top-start"
      onClose={() => onClose()}
    >
      <PopoverTrigger>
        <Button
          type="button"
          className="gif-btn-trigger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen(ACTIONS.GIF);
          }}
        >
          <RiFileGifLine
            style={{
              ...iconStyle,
              color: color ? color : undefined,
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader className="gif-popover-header">
          <div className="gif-popover-header-row">
            <Text>Chọn file Gif</Text>
            <IconWrapper icon={<IoMdClose onClick={() => onClose()} />} />
          </div>
        </PopoverHeader>
        <PopoverArrow />
        <PopoverBody className="gif-popover-body">
          <GifMsgBox onClose={onClose} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default GifMsgBtn;
