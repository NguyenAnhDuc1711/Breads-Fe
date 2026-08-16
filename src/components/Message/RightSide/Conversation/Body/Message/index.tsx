import { Avatar, Image, Text } from "../../../../../ui/primitives";
import { Tooltip } from "../../../../../ui/primitives";
import dayjs from "../../../../../../util/dayjs";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Constants } from "../../../../../../Breads-Shared/Constants";
import { isDifferentDate } from "../../../../../../util";
import CustomLinkPreview from "../../../../../../util/CustomLinkPreview";
import { getCurrentTheme } from "../../../../../../util/Themes";
import { messageThemes } from "../../../../../../util/Themes/index";
import MessageAction from "./Actions";
import FileMsg from "./Files";
import MsgMediaLayout from "./MediaLayout";
import MessageReactsBox from "./ReactsBox";
import RepliedMsg from "./RepliedMsg";
import { IMessage } from "../../../../../../store/MessageSlice";
import { useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import "./index.css";

const Message = ({
  msg,
  isLastSeen = false,
  displayUserAva = false,
}: {
  msg: IMessage;
  isLastSeen?: boolean;
  displayUserAva?: boolean;
}) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation,
  );
  const participant = selectedConversation?.participant;
  const [displayAction, setDisplayAction] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const senderId =
    typeof msg?.sender === "object" && msg?.sender !== null
      ? msg?.sender?._id || msg?.sender?.id || String(msg?.sender)
      : msg?.sender;
  const ownMessage =
    !!userInfo?._id && !!senderId && String(senderId) === String(userInfo?._id);
  const {
    content,
    createdAt,
    file,
    media,
    links,
    reacts,
    isRetrieve,
    respondTo,
    updatedAt,
  } = msg;
  const previousReact = reacts?.find(
    ({ userId }: any) =>
      String(userId?._id || userId) === String(userInfo?._id),
  )?.react;
  const { user1Message, user2Message } = getCurrentTheme(
    selectedConversation?.theme,
  );
  const msgStyle = ownMessage ? user1Message : user2Message;
  const msgBg = msgStyle?.backgroundColor;
  const msgColor = msgStyle?.color;
  const borderColor = msgStyle?.borderColor;
  const isSettingMsg = msg?.type === Constants.MSG_TYPE.SETTING;

  const getTooltipTime = () => {
    // const createdLocalTime = convertUTCToLocalTime(createdAt);
    const currentDate = new Date();
    const createdAtDate = createdAt ? new Date(createdAt) : new Date();
    let format = "";
    const isDiffDate = isDifferentDate(createdAtDate, currentDate);
    if (isDiffDate) {
      format = "lll";
    } else {
      format = "LT";
    }
    return dayjs(createdAt).format(format);
  };

  const getUserSeenTooltip = () => {
    const currentDate = new Date();
    const updatedAtDate = updatedAt ? new Date(updatedAt) : new Date();
    let format = "";
    const isDiffDate = isDifferentDate(updatedAtDate, currentDate);
    if (isDiffDate) {
      format = "lll";
    } else {
      format = "LT";
    }
    return `Seen by ${participant?.username} at ${dayjs(createdAt).format(
      format,
    )}`;
  };

  const msgContent = () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const contentArr = content
      ?.split(urlRegex)
      ?.filter((part) => !!part.trim());

    const reactBox = () => {
      return (
        <div
          className={`message-reactbox-wrap${
            ownMessage
              ? " message-reactbox-wrap--own"
              : " message-reactbox-wrap--other"
          }`}
        >
          <MessageReactsBox reacts={reacts} msgId={msg?._id || ""} />
        </div>
      );
    };

    if (isRetrieve) {
      return (
        <div
          className="message-retrieved"
          style={{
            color: msgColor,
            border: borderColor ? `1px solid ${borderColor}` : undefined,
          }}
        >
          <Text>This message is retrieved</Text>
        </div>
      );
    }

    return (
      <div className="message-row" id={`msg_${msg?._id}`}>
        {ownMessage && displayAction && (
          <MessageAction
            ownMsg={ownMessage}
            msg={msg}
            previousReact={previousReact}
          />
        )}
        {!ownMessage && (
          <>
            {displayUserAva ? (
              <Avatar src={participant?.avatar} w={"32px"} h={"32px"} mr={2} />
            ) : (
              <div className="message-avatar-placeholder" />
            )}
          </>
        )}
        <div
          className={`message-content-col${
            ownMessage
              ? " message-content-col--own"
              : " message-content-col--other"
          }`}
        >
          {respondTo?._id && <RepliedMsg repliedMsg={respondTo} msg={msg} />}
          {content?.trim() && (
            <div
              className="message-bubble"
              style={{
                backgroundColor: msgBg,
                color: msgColor,
                border: borderColor ? `1px solid ${borderColor}` : undefined,
              }}
            >
              {contentArr.map((part, index) => {
                if (part.match(urlRegex)) {
                  return (
                    <span className="message-link-wrap" key={index}>
                      <a
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`message-link${
                          ownMessage
                            ? " message-link--own"
                            : " message-link--other"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {part}
                      </a>
                    </span>
                  );
                }
                return <span key={index}>{part}</span>;
              })}
              {reacts?.length > 0 &&
                !links?.length &&
                !media?.length &&
                !file?._id && <>{reactBox()}</>}
            </div>
          )}
          {links?.length > 0 && (
            <div className="message-link-preview-wrap">
              <CustomLinkPreview
                link={links[links?.length - 1]}
                bg={msgBg}
                color={msgColor}
                borderColor={borderColor}
              />
              {msg?.reacts?.length > 0 && !media?.length && !file?._id && (
                <>{reactBox()}</>
              )}
            </div>
          )}
          {media?.length > 0 && <MsgMediaLayout media={media} />}
          {file?._id && <FileMsg file={file} bg={msgBg} color={msgColor} />}
        </div>
        {!ownMessage && displayAction && (
          <MessageAction
            ownMsg={ownMessage}
            msg={msg}
            previousReact={previousReact}
          />
        )}
      </div>
    );
  };

  const handleSettingMsg = () => {
    const splitArr = msg?.content.split(" ");
    const lastWord = splitArr[splitArr.length - 1];
    const isTheme = lastWord in messageThemes;
    const bgImg =
      messageThemes?.[lastWord]?.conversationBackground?.backgroundImage;

    return (
      <>
        <Text textAlign={"center"} color={msgColor}>
          {ownMessage ? "You " : participant?.username + " "}
          {msg?.content}
        </Text>
        {isTheme && bgImg && (
          <Image className="message-setting__theme-img" src={bgImg} alt="" />
        )}
      </>
    );
  };

  const handleMouseEnter = () => {
    if (!isRetrieve) {
      setDisplayAction(true);
    }
  };

  const handleMouseLeave = () => {
    setDisplayAction(false);
  };

  return (
    <div
      className={`message-container${
        ownMessage ? " message-container--own" : " message-container--other"
      }`}
    >
      {isSettingMsg ? (
        <div className="message-setting" id={`msg_${msg?._id}`}>
          {handleSettingMsg()}
        </div>
      ) : (
        <div
          className={`message-wrap${
            ownMessage ? " message-wrap--own" : " message-wrap--other"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {msgContent()}
        </div>
      )}
      {showInfo && !isSettingMsg && (
        <div
          className={`message-info-row${
            ownMessage ? " message-info-row--own" : " message-info-row--other"
          }`}
        >
          <span className="message-info-text">{getTooltipTime()}</span>
        </div>
      )}
      {isLastSeen && ownMessage && (
        <div className="message-seen-row">
          <Tooltip label={getUserSeenTooltip()} placement={"top"}>
            <Avatar
              size="2xs"
              className="message-seen-avatar"
              src={participant?.avatar}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default Message;
