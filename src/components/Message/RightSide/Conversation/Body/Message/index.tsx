import {
  Avatar,
  Container,
  Flex,
  Image,
  Link,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import moment from "moment";
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
    (state: AppState) => state.message.selectedConversation
  );
  const participant = selectedConversation?.participant;
  const [displayAction, setDisplayAction] = useState(false);
  const ownMessage = msg?.sender === userInfo?._id;
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
    ({ userId }) => userId === userInfo?._id
  )?.react;
  const { user1Message, user2Message } = getCurrentTheme(
    selectedConversation?.theme
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
    return moment(createdAt).format(format);
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
    return `Seen by ${participant?.username} at ${moment(createdAt).format(
      format
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
          style={{
            position: "absolute",
            right: ownMessage ? "" : "-16px",
            bottom: "-10px",
            left: ownMessage ? "-16px" : "",
            zIndex: 2000,
          }}
        >
          <MessageReactsBox reacts={reacts} msgId={msg?._id || ""} />
        </div>
      );
    };

    if (isRetrieve) {
      return (
        <Container
          py={1}
          px={3}
          borderRadius={"16px"}
          color={msgColor}
          border={borderColor ? `1px solid ${borderColor}` : ""}
          bg={"lightgray"}
        >
          <Text>This message is retrieved</Text>
        </Container>
      );
    }

    return (
      <Flex
        id={`msg_${msg?._id}`}
        width={"fit-content"}
        alignItems={"center"}
        pos={"relative"}
      >
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
              <Container w={"32px"} h={"32px"} mr={2} />
            )}
          </>
        )}
        <Flex
          flexDir={"column"}
          alignItems={ownMessage ? "flex-end" : "flex-start"}
        >
          {respondTo?._id && <RepliedMsg repliedMsg={respondTo} msg={msg} />}
          {content?.trim() && (
            <Container
              m={0}
              pos={"relative"}
              maxW={"30vw"}
              bg={msgBg}
              py={1}
              px={3}
              borderRadius={"16px"}
              color={msgColor}
              border={borderColor ? `1px solid ${borderColor}` : ""}
              width={"fit-content"}
            >
              {contentArr.map((part, index) => {
                if (part.match(urlRegex)) {
                  return (
                    <span key={index} style={{ marginRight: "4px" }}>
                      <Link
                        href={part}
                        color={ownMessage ? "white" : "black"}
                        isExternal
                        _hover={{ textDecoration: "underline" }}
                        _focus={{ boxShadow: "none" }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {part}
                      </Link>
                    </span>
                  );
                }
                return <span key={index}>{part}</span>;
              })}
              {reacts?.length > 0 &&
                !links?.length &&
                !media?.length &&
                !file?._id && <>{reactBox()}</>}
            </Container>
          )}
          {links?.length > 0 && (
            <div
              style={{
                position: "relative",
              }}
            >
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
        </Flex>
        {!ownMessage && displayAction && (
          <MessageAction
            ownMsg={ownMessage}
            msg={msg}
            previousReact={previousReact}
          />
        )}
      </Flex>
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
          <Image
            src={bgImg}
            width={"20px"}
            height={"20px"}
            borderRadius={"50%"}
          />
        )}
      </>
    );
  };

  const settingMsgProp = {
    _id: `msg_$msg?._id}`,
    width: "100%",
    height: "fit-content",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  };

  const messageProp = {
    pos: "relative",
    flexDir: ownMessage ? "column" : "",
    gap: 2,
    alignSelf: ownMessage ? "flex-end" : "flex-start",
    width: "fit-content",
    onMouseEnter: () => {
      if (!isRetrieve) {
        setDisplayAction(true);
      }
    },
    onMouseLeave: () => {
      setDisplayAction(false);
    },
  };

  return (
    <>
      <Tooltip
        label={!isSettingMsg && getTooltipTime()}
        placement={ownMessage ? "left" : "right"}
      >
        <Flex {...(isSettingMsg ? settingMsgProp : (messageProp as any))}>
          {isSettingMsg ? handleSettingMsg() : msgContent()}
        </Flex>
      </Tooltip>
      {isLastSeen && msg?.sender === userInfo?._id && (
        <Flex justifyContent={"end"}>
          <Tooltip label={getUserSeenTooltip()} placement={"top"}>
            <Avatar width={"16px"} height={"16px"} src={participant?.avatar} />
          </Tooltip>
        </Flex>
      )}
    </>
  );
};

export default Message;
