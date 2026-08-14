import { useBreakpointValue } from "../../ui/primitives";
import { useState } from "react";
import ConversationScreen from "./Conversation";
import DetailConversationTab from "./DetailTab";
import "./index.css";

const RightSideMsg = ({
  onBack,
  onDetailBack,
}: {
  onBack: Function;
  onDetailBack: Function;
}) => {
  const [openDetailTab, setOpenDetailTab] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <div
      className="msg-right-side"
      style={{ flex: isMobile ? 1 : 70 }}
    >
      {!isMobile || !openDetailTab ? (
        <ConversationScreen
          openDetailTab={openDetailTab}
          setOpenDetailTab={setOpenDetailTab}
          onBack={onBack}
        />
      ) : null}
      {openDetailTab && (
        <div className="msg-right-side__detail-wrap">
          <DetailConversationTab
            openDetailTab={openDetailTab}
            setOpenDetailTab={setOpenDetailTab}
          />
        </div>
      )}
    </div>
  );
};

export default RightSideMsg;
