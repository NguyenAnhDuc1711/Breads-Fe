"use client";

import { Avatar, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  MESSAGE_PATH,
  Route,
} from "../../../../../../../Breads-Shared/APIConfig";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../../hooks/redux";
import Socket from "../../../../../../../socket";
import { AppState } from "../../../../../../../store";
import { updateMsg } from "../../../../../../../store/MessageSlice";
import { getEmojiIcon } from "../../../../../../../util";

const UserReactItem = ({
  userId,
  react,
  msgId,
}: {
  userId: string;
  react: any;
  msgId: string;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const participant = useAppSelector(
    (state: AppState) => state.message.selectedConversation?.participant
  );
  const isOwnReact = userInfo?._id === userId;
  const userDisplay = isOwnReact ? userInfo : participant;

  const handleSeeProfile = () => {
    router.push(`/users/${participant?._id}`);
  };

  const handleRemoveReact = async () => {
    try {
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.REACT,
        {
          participantId: participant?._id,
          userId: userInfo?._id,
          msgId: msgId,
          react: react,
        },
        ({ data }) => {
          if (data?._id) {
            dispatch(updateMsg(data));
          }
        }
      );
    } catch (err) {
      console.error("handleRemoveReact: ", err);
    }
  };

  return (
    <Flex
      width={"100%"}
      height={"52px"}
      alignItems={"center"}
      justifyContent={"space-between"}
      p={2}
      cursor={"pointer"}
    >
      <Flex gap={2} alignItems={"center"}>
        <Avatar src={userDisplay?.avatar} width={"40px"} height={"40px"} />
        <Flex
          flexDir={"column"}
          ml={2}
          onClick={() => {
            if (isOwnReact) {
              handleRemoveReact();
            } else {
              handleSeeProfile();
            }
          }}
        >
          <Text fontWeight={600}>{userDisplay?.username}</Text>
          <Text fontSize={"12px"} color={"gray"}>
            {isOwnReact ? "Remove react" : "See detail profile"}
          </Text>
        </Flex>
      </Flex>
      <Text>{getEmojiIcon(react)}</Text>
    </Flex>
  );
};

export default UserReactItem;
