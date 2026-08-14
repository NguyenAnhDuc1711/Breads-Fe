import { useBreakpointValue } from "../../../ui/primitives";
import { Constants } from "../../../../Breads-Shared/Constants";
import { useAppSelector } from "../../../../hooks/redux";
import { HeaderHeight } from "../../../../Layout";
import { AppState } from "../../../../store";
import ConversationBody from "./Body";
import ConversationHeader from "./Header";
import MessageInput from "./MessageBar";
import RepliedMsgBar from "./MessageBar/RepliedMsgBar";
import UploadDisplay from "./MessageBar/UploadDisplay";
import "./index.css";

const ConversationScreen = ({
  openDetailTab,
  setOpenDetailTab,
  onBack,
}: {
  openDetailTab: boolean;
  setOpenDetailTab: Function;
  onBack: Function;
}) => {
  const { msgInfo, selectedMsg, msgAction } = useAppSelector(
    (state: AppState) => state.message
  );
  const { files, media } = msgInfo;
  const footerOffset = useBreakpointValue({ base: 75, md: 24 });

  return (
    <div
      className="conv-screen"
      style={{ height: `calc(100vh - ${HeaderHeight}px - ${footerOffset}px)` }}
    >
      <ConversationHeader
        openDetailTab={openDetailTab}
        setOpenDetailTab={setOpenDetailTab}
        onBack={onBack}
      />
      <ConversationBody openDetailTab={openDetailTab} />
      {selectedMsg?._id && msgAction === Constants.MSG_ACTION.REPLY && (
        <RepliedMsgBar />
      )}
      {((!!files && files?.length !== 0) || media?.length !== 0) && (
        <UploadDisplay />
      )}
      <div className="conv-screen__input-wrap">
        <MessageInput />
      </div>
    </div>
  );
};

export default ConversationScreen;
