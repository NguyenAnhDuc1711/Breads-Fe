import { Button } from "../ui/primitives";
import { useRouter } from "next/navigation";
import { MESSAGE_PATH, Route } from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { POST } from "../../config/API";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import {
  selectConversation,
  ConversationResponse,
} from "../../store/MessageSlice";
import { IUser } from "../../store/UserSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";
import { openLoginPopupAction } from "../../store/UtilSlice";
import "./index.css";

const ConversationBtn = ({ user }: { user: IUser }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const handleClickChat = async () => {
    try {
      if (!userInfo?._id) {
        dispatch(openLoginPopupAction());
        return;
      }
      const data = await POST({
        path: Route.MESSAGE + MESSAGE_PATH.GET_CONVERSATION_BY_USERS_ID,
        payload: {
          anotherId: user?._id,
        },
      });
      if (!!data) {
        const normalized = new ConversationResponse(data);
        dispatch(changePage({ nextPage: PageConstant.CHAT }));
        dispatch(selectConversation(normalized));
        router.push(`/chat/${data._id}`);
      }
    } catch (err) {
      console.error("handleClickChat: ", err);
    }
  };


  return (
    <Button
      className="conversation-btn btn-subtle"
      size={"md"}
      onClick={() => handleClickChat()}
    >
      Chat
    </Button>
  );
};

export default ConversationBtn;
