import { Input } from "../../../../ui/primitives";
import { useEffect, useState } from "react";
import { EmptyContentSvg } from "../../../../../assests/icons";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { POST } from "../../../../../config/API";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import useDebounce from "../../../../../hooks/useDebounce";
import { AppState } from "../../../../../store";
import { updateHasMoreData } from "../../../../../store/UtilSlice";
import { getCurrentTheme } from "../../../../../util/Themes";
import InfiniteScroll from "../../../../InfiniteScroll";
import ConversationTabHeader from "../tabHeader";
import MessageSearchItem from "./msgSearch";
import "./index.css";

const ConversationSearchTab = ({
  setItemSelected,
}: {
  setItemSelected: Function;
}) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const { user1Message } = getCurrentTheme(selectedConversation?.theme);
  const textColor = user1Message?.color;
  const borderColor = user1Message?.borderColor;
  const [data, setData] = useState<any>([]);
  const [searchValue, setSearchValue] = useState("");
  const debounceValue = useDebounce(searchValue);

  useEffect(() => {
    if (debounceValue.trim()) {
      handleSearch({ page: 1 });
    }
  }, [debounceValue]);

  const handleSearch = async ({ page }) => {
    try {
      const data = await POST({
        path: Route.MESSAGE + MESSAGE_PATH.SEARCH,
        payload: {
          conversationId: selectedConversation?._id,
          value: debounceValue,
          page: page,
          limit: 15,
        },
      });
      if (page === 1) {
        setData(data);
      } else {
        if (data?.length) {
          setData((prev) => [...prev, ...data]);
        } else {
          dispatch(updateHasMoreData(false));
        }
      }
    } catch (err) {
      console.error("handleSearch: ", err);
      setData([]);
    }
  };

  return (
    <div className="search-tab">
      <ConversationTabHeader
        setItemSelected={setItemSelected}
        color={textColor}
      />
      <div className="search-tab__form">
        <Input
          placeholder="Search a message"
          style={{ border: borderColor ? `1px solid ${borderColor}` : undefined }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {data?.length > 0 ? (
          <div className="search-tab__results">
            <InfiniteScroll
              queryFc={(page) => {
                handleSearch({ page: page });
              }}
              data={data}
              cpnFc={(msg) => <MessageSearchItem msg={msg} />}
              condition={!!debounceValue.trim()}
              reloadPageDeps={[debounceValue]}
            />
          </div>
        ) : (
          <EmptyContentSvg />
        )}
      </div>
    </div>
  );
};

export default ConversationSearchTab;
