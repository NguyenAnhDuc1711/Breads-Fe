import { Button, Container, Flex, Image, Text } from "@chakra-ui/react";
import { addEvent, FILE_TYPES } from "../../../../../../../util";
import { formatItemDate } from "../../../../../../../util";
import { FaFileDownload } from "react-icons/fa";

const FileMsg = ({
  file,
  inMsgTab = false,
  bg = "",
  color = "",
}: {
  file: any;
  inMsgTab?: boolean;
  bg?: string;
  color?: string;
}) => {
  const { word, excel, powerpoint, pdf, text } = FILE_TYPES;
  const fileType = file.contentType;

  const getImgByType = () => {
    switch (fileType) {
      case word:
        return "../../../../../../../../FileImgs/word.svg";
      case excel:
        return "../../../../../../../../FileImgs/excel.svg";
      case powerpoint:
        return "../../../../../../../../FileImgs/powerpoint.svg";
      case pdf:
        return "../../../../../../../../FileImgs/pdf.png";
      case text:
        return "../../../../../../../../FileImgs/text.png";
    }
    return "";
  };

  const getLinkByType = () => {
    const url = file?.url;
    switch (fileType) {
      case word:
        return "ms-word:ofe|u|" + url;
      case excel:
        return "ms-excel:ofe|u|" + url;
      case powerpoint:
        return "ms-powerpoint:ofe|u|" + url;
      case pdf:
      case text:
        return url;
    }
    return "";
  };

  const fileDisplay = () => {
    return (
      <Container
        position={"relative"}
        border={"1px solid gray"}
        borderRadius={3}
        padding={3}
        cursor={"pointer"}
        bg={bg ? bg : ""}
        color={color ? color : ""}
        _hover={{
          opacity: 0.8,
        }}
      >
        <Flex gap={3}>
          <Image src={getImgByType()} width="32px" height="32px" alt={`${fileType ?? "file"} icon`} />
          <Text
            fontWeight={500}
            fontSize={"14px"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            flex={1}
          >
            {file.name}
          </Text>
          {/* <Button
            onClick={(e) => {
              e.stopPropagation();
              const link = getLinkByType();
              const a = document.createElement("a");
              a.href = link;
              a.download = `${file.name}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              console.log("install");
            }}
          >
            <FaFileDownload />
          </Button> */}
        </Flex>
        {inMsgTab && (
          <Text
            position={"absolute"}
            bottom={"8px"}
            right={"12px"}
            fontSize={"11px"}
          >
            {formatItemDate(file?.createdAt)}
          </Text>
        )}
      </Container>
    );
  };

  const fileWrapperByType = () => {
    const linkType = getLinkByType();
    switch (fileType) {
      case word:
      case excel:
      case powerpoint:
        return (
          <a
            href={linkType}
            target="_self"
            style={{
              width: inMsgTab ? "100%" : "",
            }}
            onClick={() => {
              addEvent({
                event: "open_file",
                payload: {
                  url: linkType,
                },
              });
            }}
          >
            {fileDisplay()}
          </a>
        );
      case text:
      case pdf:
        return (
          <a
            href={linkType}
            target="_self"
            style={{
              width: inMsgTab ? "100%" : "",
            }}
            onClick={() => {
              addEvent({
                event: "open_file",
                payload: {
                  url: linkType,
                },
              });
            }}
          >
            {fileDisplay()}
          </a>
        );
    }
  };

  return <>{fileWrapperByType()}</>;
};

export default FileMsg;
