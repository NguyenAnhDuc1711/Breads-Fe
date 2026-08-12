import { CloseIcon } from "../../../../../../../assests/chakraIcons";
import {
  Flex,
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
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { getEmojiIcon } from "../../../../../../../util";
import IconWrapper from "../../../MessageBar/IconWrapper";
import UserReactItem from "./UserReactItem";

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
      <Flex
        borderRadius={12}
        bg="lightgray"
        px={"6px"}
        gap={"2px"}
        onClick={() => setOpenDetailBox(true)}
        cursor={"pointer"}
        _hover={{
          bg: "#ebebeb",
        }}
      >
        <Flex>
          {setEmoji?.map((react) => (
            <div key={`react-${react}`}>
              <Text fontSize={"12px"}>{getEmojiIcon(react)}</Text>
            </div>
          ))}
        </Flex>
        <Text fontSize={"12px"} fontWeight={600} color={"black"}>
          {reacts?.length}
        </Text>
      </Flex>
      <Modal isOpen={openDetailBox} onClose={() => setOpenDetailBox(false)}>
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("gray.200", "#181818")}>
          <ModalHeader borderBottom={"1px solid gray"} pos={"relative"}>
            <Flex alignItems={"center"} justifyContent={"center"}>
              <Text>Message reactions</Text>
              <div
                style={{
                  position: "absolute",
                  right: "20px",
                }}
              >
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
            </Flex>
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
