import { ArrowBackIcon } from "../../../../assests/chakraIcons";
import { Button } from "@chakra-ui/react";

const ConversationTabHeader = ({
  setItemSelected,
  color = "",
}: {
  setItemSelected: Function;
  color?: string;
}) => {
  return (
    <Button mb={3} padding={0} onClick={() => setItemSelected("")}>
      <ArrowBackIcon color={color ? color : ""} />
    </Button>
  );
};

export default ConversationTabHeader;
