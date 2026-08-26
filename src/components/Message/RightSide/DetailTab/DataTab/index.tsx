import { Image, Text } from "../../../../ui/primitives";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "../../../../ui/primitives";
import { useEffect, useRef, useState } from "react";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { Constants } from "../../../../../Breads-Shared/Constants";
import { GET } from "../../../../../config/API";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import { updateSeeMedia } from "../../../../../store/UtilSlice";
import { addEvent } from "../../../../../util";
import { getCurrentTheme } from "../../../../../util/Themes";
import FileMsg from "../../Conversation/Body/Message/Files";
import LinkBox from "../../Conversation/Body/Message/Links";
import ConversationTabHeader from "../tabHeader";
import "./index.css";

const TABS = {
  MEDIA: "Media",
  FILES: "Files",
  LINKS: "Links",
};

const PAGE_LIMIT = 20;
const LOAD_MORE_THRESHOLD_PX = 80;

const emptyTabState = () => ({
  data: [] as any[],
  page: 0,
  total: 0,
  isLoading: false,
});

const initialTabStateByTab = () => ({
  [TABS.MEDIA]: emptyTabState(),
  [TABS.FILES]: emptyTabState(),
  [TABS.LINKS]: emptyTabState(),
});

const ConversationDataTab = ({ currentTab, setItemSelected }) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state) => state.message.selectedConversation
  );
  const [tabStateByTab, setTabStateByTab] = useState(initialTabStateByTab());
  const [tabIndex, setTabIndex] = useState(
    Object.values(TABS).findIndex((tabValue) => tabValue === currentTab)
  );
  // Nguồn đọc "mới nhất" cho các guard trong handleGetDataByTab — tránh đọc
  // phải state cũ từ closure khi effect scroll không re-tạo lại hàm mỗi lần data đổi.
  const tabStateRef = useRef(tabStateByTab);
  tabStateRef.current = tabStateByTab;
  const currentConversationIdRef = useRef(selectedConversation?._id);
  const { user1Message } = getCurrentTheme(selectedConversation?.theme);
  const textColor = user1Message?.color;

  const handleGetDataByTab = async (tab, { loadMore = false } = {}) => {
    const current = tabStateRef.current[tab] || emptyTabState();
    if (current.isLoading) return;
    if (!loadMore && current.page > 0) return; // đã có sẵn (cache) -> không fetch lại
    if (loadMore && current.total > 0 && current.data.length >= current.total)
      return; // đã tải hết

    const nextPage = current.page + 1;
    const conversationId = selectedConversation?._id;

    setTabStateByTab((prev) => {
      const next = { ...prev, [tab]: { ...prev[tab], isLoading: true } };
      tabStateRef.current = next;
      return next;
    });

    try {
      const query = (constant) => ({
        path:
          Route.MESSAGE + constant.replace(":conversationId", conversationId),
        params: { page: nextPage, limit: PAGE_LIMIT },
      });
      let res: any = { data: [], total: 0 };
      switch (tab) {
        case TABS.MEDIA:
          res = await GET(query(MESSAGE_PATH.GET_CONVERSATION_MEDIA));
          break;
        case TABS.FILES:
          res = await GET(query(MESSAGE_PATH.GET_CONVERSATION_FILES));
          break;
        case TABS.LINKS:
          res = await GET(query(MESSAGE_PATH.GET_CONVERSATION_LINKS));
          break;
        default:
          break;
      }

      // Conversation đã đổi trong lúc chờ response -> bỏ qua, tránh ghi đè nhầm.
      if (conversationId !== currentConversationIdRef.current) return;

      setTabStateByTab((prev) => {
        const prevTab = prev[tab] || emptyTabState();
        const next = {
          ...prev,
          [tab]: {
            data: loadMore
              ? [...prevTab.data, ...(res?.data || [])]
              : res?.data || [],
            page: nextPage,
            total: res?.total ?? 0,
            isLoading: false,
          },
        };
        tabStateRef.current = next;
        return next;
      });
    } catch (err) {
      console.error("handleGetDataByTab: ", err);
      setTabStateByTab((prev) => {
        const next = { ...prev, [tab]: { ...prev[tab], isLoading: false } };
        tabStateRef.current = next;
        return next;
      });
    }
  };

  useEffect(() => {
    if (!currentTab || !selectedConversation?._id) return;

    if (currentConversationIdRef.current !== selectedConversation._id) {
      currentConversationIdRef.current = selectedConversation._id;
      const resetState = initialTabStateByTab();
      tabStateRef.current = resetState;
      setTabStateByTab(resetState);
    }

    setTabIndex(
      Object.values(TABS).findIndex((tabValue) => tabValue === currentTab)
    );
    handleGetDataByTab(currentTab);
  }, [currentTab, selectedConversation?._id]);

  useEffect(() => {
    const panelEl = document.getElementById("data-tab-panels");
    if (!panelEl) return;
    const listener = () => {
      const { scrollTop, clientHeight, scrollHeight } = panelEl;
      if (scrollTop + clientHeight >= scrollHeight - LOAD_MORE_THRESHOLD_PX) {
        handleGetDataByTab(currentTab, { loadMore: true });
      }
    };
    panelEl.addEventListener("scroll", listener);
    return () => panelEl.removeEventListener("scroll", listener);
  }, [currentTab]);

  const handleTabsChange = (index) => {
    setTabIndex(index);
    const tab = Object.values(TABS)[index];
    addEvent({
      event: "change_conversation_data_tab",
      payload: {
        tab: tab,
      },
    });
  };

  const handleSeeMedia = (index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: tabStateByTab[TABS.MEDIA]?.data || [],
        currentMediaIndex: index,
      })
    );
  };

  return (
    <div className="data-tab">
      <ConversationTabHeader
        setItemSelected={setItemSelected}
        color={textColor}
      />
      <Tabs w={"full"} index={tabIndex} onChange={handleTabsChange}>
        <TabList w={"full"}>
          {Object.entries(TABS).map(([_, value]) => (
            <Tab
              key={value}
              className="data-tab__tab"
              onClick={() => {
                setItemSelected(value);
              }}
            >
              <Text fontWeight={"bold"} fontSize={"14px"}>
                {value}
              </Text>
            </Tab>
          ))}
        </TabList>

        <TabPanels className="data-tab__panels" id="data-tab-panels">
          <TabPanel p={0} mt={4}>
            <div className="data-tab__grid">
              {tabStateByTab[TABS.MEDIA]?.data?.map((item: any, index) => {
                const type = item.type;
                const url = item.url;
                if (type === Constants.MEDIA_TYPE.VIDEO) {
                  return (
                    <video
                      src={url}
                      key={url}
                      onClick={() => handleSeeMedia(index)}
                    />
                  );
                } else {
                  return (
                    <Image
                      className="data-tab__media-item"
                      key={url}
                      src={url}
                      alt={`Shared media ${index + 1}`}
                      onClick={() => handleSeeMedia(index)}
                    />
                  );
                }
              })}
            </div>
          </TabPanel>
          <TabPanel p={0} mt={4}>
            <div className="data-tab__grid">
              {tabStateByTab[TABS.FILES]?.data?.map((item, index) => (
                <FileMsg key={index} file={item} inMsgTab={true} />
              ))}
            </div>
          </TabPanel>
          <TabPanel p={0} mt={4}>
            <div className="data-tab__grid">
              {tabStateByTab[TABS.LINKS]?.data?.map((item, index) => (
                <LinkBox key={index} link={item} color={textColor} />
              ))}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ConversationDataTab;
