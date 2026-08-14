import { ArrowBackIcon } from "../../../../assests/chakraIcons";
import { Button } from "../../../ui/primitives";
import "./tabHeader.css";

const ConversationTabHeader = ({
  setItemSelected,
  color = "",
}: {
  setItemSelected: Function;
  color?: string;
}) => {
  return (
    <Button className="conv-tab-header-btn" onClick={() => setItemSelected("")}>
      <ArrowBackIcon color={color ? color : ""} />
    </Button>
  );
};

export default ConversationTabHeader;
