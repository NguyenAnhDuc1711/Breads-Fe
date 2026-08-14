import { SearchIcon } from "../../../assests/chakraIcons";
import { Button, Input, Text } from "../../ui/primitives";
import Conversations from "./Conversations";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";

const LeftSideBarMsg = ({
  onSelectConversation,
}: {
  onSelectConversation: Function;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  return (
    <div className="msg-sidebar">
      <div className="msg-sidebar__list">
        <Text className="msg-sidebar__title"> {t("Yourconversations")}</Text>
        <form>
          <div className="msg-sidebar__search-row">
            <Input
              className="msg-sidebar__search-input"
              placeholder={t("Searchforuser")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button className="msg-sidebar__search-btn">
              <SearchIcon />{" "}
            </Button>
          </div>
        </form>
        <Conversations
          searchValue={searchValue}
          onSelect={onSelectConversation}
        />
      </div>
    </div>
  );
};

export default LeftSideBarMsg;
