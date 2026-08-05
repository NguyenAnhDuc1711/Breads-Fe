import {
  Container,
  Flex,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MESSAGE_PATH, Route } from "../../../../../Breads-Shared/APIConfig";
import { Constants } from "../../../../../Breads-Shared/Constants";
import { POST } from "../../../../../config/API";
import { useAppDispatch, useAppSelector } from "../../../../../hooks/redux";
import { updateSeeMedia } from "../../../../../store/UtilSlice";
import { addEvent } from "../../../../../util";
import { getCurrentTheme } from "../../../../../util/Themes";
import FileMsg from "../../Conversation/Body/Message/Files";
import LinkBox from "../../Conversation/Body/Message/Links";
import ConversationTabHeader from "../tabHeader";

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
      const query = (subPath) => {
        return {
          path: Route.MESSAGE + subPath,
          payload: {
            conversationId: selectedConversation?._id,
          },
        };
      };
      switch (tab) {
        case TABS.MEDIA:
          data = await POST(query(MESSAGE_PATH.GET_CONVERSATION_MEDIA));
          break;
        case TABS.FILES:
          data = await POST(query(MESSAGE_PATH.GET_CONVERSATION_FILES));
          break;
        case TABS.LINKS:
          data = await POST(query(MESSAGE_PATH.GET_CONVERSATION_LINKS));
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
    <Container margin={0} padding={2} height={"70vh"}>
      <ConversationTabHeader
        setItemSelected={setItemSelected}
        color={textColor}
      />
      <Tabs w={"full"} index={tabIndex} onChange={handleTabsChange}>
        <TabList w={"full"}>
          {Object.entries(TABS).map(([_, value]) => (
            <Tab
              flex={1}
              borderBottom={"1.5px solid white"}
              justifyContent={"center"}
              pb={3}
              cursor={"pointer"}
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

        <TabPanels overflowY={"auto"} maxHeight={"calc(70vh - 120px)"} pr={2}>
          <TabPanel p={0} mt={4}>
            <Flex gap={2} wrap={"wrap"}>
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
                      key={url}
                      src={url}
                      w={"30%"}
                      objectFit={"cover"}
                      cursor={"pointer"}
                      alt={`Shared media ${index + 1}`}
                      onClick={() => handleSeeMedia(index)}
                    />
                  );
                }
              })}
            </Flex>
          </TabPanel>
          <TabPanel p={0} mt={4}>
            <Flex gap={2} wrap={"wrap"}>
              {tabData?.map((item) => (
                <FileMsg file={item} inMsgTab={true} />
              ))}
            </Flex>
          </TabPanel>
          <TabPanel p={0} mt={4}>
            <Flex gap={2} wrap={"wrap"}>
              {tabData?.map((item) => (
                <LinkBox link={item} color={textColor} />
              ))}
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ConversationDataTab;
