import { Image, Text } from "../../../../../../ui/primitives";
import { addEvent, FILE_TYPES } from "../../../../../../../util";
import { formatItemDate } from "../../../../../../../util";
import "./index.css";

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
      <div
        className="msg-file"
        style={{ backgroundColor: bg || undefined, color: color || undefined }}
      >
        <div className="msg-file__row">
          <Image src={getImgByType()} width="32px" height="32px" alt={`${fileType ?? "file"} icon`} />
          <Text className="msg-file__name">{file.name}</Text>
        </div>
        {inMsgTab && (
          <Text className="msg-file__date">
            {formatItemDate(file?.createdAt)}
          </Text>
        )}
      </div>
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
