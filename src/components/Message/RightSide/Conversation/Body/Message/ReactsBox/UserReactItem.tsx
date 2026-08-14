"use client";

import { Avatar, Text } from "../../../../../../ui/primitives";
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
import "./UserReactItem.css";

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
    <div className="user-react-item">
      <div className="user-react-item__main">
        <Avatar src={userDisplay?.avatar} width={"40px"} height={"40px"} />
        <div
          className="user-react-item__text-col"
          onClick={() => {
            if (isOwnReact) {
              handleRemoveReact();
            } else {
              handleSeeProfile();
            }
          }}
        >
          <Text fontWeight={600}>{userDisplay?.username}</Text>
          <Text className="user-react-item__hint">
            {isOwnReact ? "Remove react" : "See detail profile"}
          </Text>
        </div>
      </div>
      <Text>{getEmojiIcon(react)}</Text>
    </div>
  );
};

export default UserReactItem;
