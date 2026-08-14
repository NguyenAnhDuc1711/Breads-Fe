import { CloseIcon } from "../../../../../../../assests/chakraIcons";
import { Text } from "../../../../../../ui/primitives";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "../../../../../../ui/primitives";
import { useState } from "react";
import { getEmojiIcon } from "../../../../../../../util";
import IconWrapper from "../../../MessageBar/IconWrapper";
import UserReactItem from "./UserReactItem";
import "./index.css";

const MessageReactsBox = ({
  reacts,
  msgId,
}: {
  reacts: any;
  msgId: string;
}) => {
  const [openDetailBox, setOpenDetailBox] = useState(false);
  const setEmoji = [...new Set(reacts?.map(({ react }) => react))];

  const headerTabs = () => {
    let headerEmj = [...setEmoji];
    headerEmj = headerEmj?.map((emoji) => {
      const count = reacts?.filter(({ react }) => react === emoji)?.length;
      return {
        emoji: emoji,
        count: count,
      };
    });
    headerEmj.unshift({
      emoji: "All",
    });
    return (
      <TabList>
        {headerEmj.map((item: any, index) => (
          <Tab key={`tab-${index}`}>
            {index === 0 ? item.emoji : getEmojiIcon(item.emoji) + item?.count}
          </Tab>
        ))}
      </TabList>
    );
  };

  const tabItems = () => {
    const tabInfo = ["All", ...setEmoji];
    return (
      <TabPanels>
        {tabInfo?.map((tab, index) => {
          const userReacts = reacts.filter(({ react }) => react === tab);
          const displayList = index === 0 ? reacts : userReacts;
          return (
            <TabPanel p={0} mt={3} key={`tab-${tab}`}>
              {displayList?.map(({ userId, react }) => (
                <UserReactItem
                  key={`user-react-${userId}`}
                  userId={userId}
                  react={react}
                  msgId={msgId}
                />
              ))}
            </TabPanel>
          );
        })}
      </TabPanels>
    );
  };

  tabItems();

  return (
    <>
      <div className="reacts-summary" onClick={() => setOpenDetailBox(true)}>
        <div className="reacts-summary__icons">
          {setEmoji?.map((react) => (
            <div key={`react-${react}`}>
              <Text fontSize={"12px"}>{getEmojiIcon(react)}</Text>
            </div>
          ))}
        </div>
        <Text fontSize={"12px"} fontWeight={600} color={"black"}>
          {reacts?.length}
        </Text>
      </div>
      <Modal isOpen={openDetailBox} onClose={() => setOpenDetailBox(false)}>
        <ModalOverlay />
        <ModalContent className="reacts-detail-modal">
          <ModalHeader className="reacts-detail-modal__header">
            <div className="reacts-detail-modal__header-row">
              <Text>Message reactions</Text>
              <div className="reacts-detail-modal__close-wrap">
                <IconWrapper
                  icon={
                    <CloseIcon
                      width={"20px"}
                      height={"20px"}
                      p={1}
                      onClick={() => setOpenDetailBox(false)}
                    />
                  }
                />
              </div>
            </div>
          </ModalHeader>
          <ModalBody maxHeight={"520px"} overflowY={"auto"}>
            <Tabs>
              {headerTabs()}
              {tabItems()}
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MessageReactsBox;
