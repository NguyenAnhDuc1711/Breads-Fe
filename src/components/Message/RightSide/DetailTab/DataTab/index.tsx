import { Image, Text } from "../../../../ui/primitives";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "../../../../ui/primitives";
import { useEffect, useState } from "react";
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

const ConversationDataTab = ({ currentTab, setItemSelected }) => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(
    (state) => state.message.selectedConversation
  );
  const [tabData, setTabData] = useState([]);
  const [tabIndex, setTabIndex] = useState(
    Object.values(TABS).findIndex((tabValue) => tabValue === currentTab)
  );
  const { user1Message } = getCurrentTheme(selectedConversation?.theme);
  const textColor = user1Message?.color;

  useEffect(() => {
    if (currentTab && selectedConversation?._id) {
      handleGetDataByTab(currentTab);
      setTabIndex(
        Object.values(TABS).findIndex((tabValue) => tabValue === currentTab)
      );
    }
  }, [currentTab, selectedConversation?._id]);

  const handleTabsChange = async (index) => {
    setTabIndex(index);
    const tab = Object.values(TABS)[index];
    await handleGetDataByTab(tab);
    addEvent({
      event: "change_conversation_data_tab",
      payload: {
        tab: tab,
      },
    });
  };

  const handleGetDataByTab = async (tab) => {
    try {
      let data = [];
      // Task 021 (D-1): POST /messages/conversation/media|files|links (conversationId trong body)
      // -> GET /messages/conversations/:conversationId/media|files|links (id trong path, T012).
      const query = (constant) => ({
        path:
          Route.MESSAGE +
          constant.replace(":conversationId", selectedConversation?._id),
      });
      switch (tab) {
        case TABS.MEDIA:
          data = await GET(query(MESSAGE_PATH.GET_CONVERSATION_MEDIA));
          break;
        case TABS.FILES:
          data = await GET(query(MESSAGE_PATH.GET_CONVERSATION_FILES));
          break;
        case TABS.LINKS:
          data = await GET(query(MESSAGE_PATH.GET_CONVERSATION_LINKS));
          break;
        default:
          data = [];
          break;
      }
      setTabData(data);
    } catch (err) {
      console.error("handleGetDataByTab: ", err);
    }
  };

  const handleSeeMedia = (index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: tabData,
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

        <TabPanels className="data-tab__panels">
          <TabPanel p={0} mt={4}>
            <div className="data-tab__grid">
              {tabData?.map((item: any, index) => {
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
              {tabData?.map((item, index) => (
                <FileMsg key={index} file={item} inMsgTab={true} />
              ))}
            </div>
          </TabPanel>
          <TabPanel p={0} mt={4}>
            <div className="data-tab__grid">
              {tabData?.map((item, index) => (
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
