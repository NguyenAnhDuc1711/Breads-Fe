"use client";

import { LinkIcon } from "../../../../assests/chakraIcons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Container,
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CgProfile } from "react-icons/cg";
import { FaFileAlt } from "react-icons/fa";
import { IoIosArrowBack, IoIosSearch, IoMdPhotos } from "react-icons/io";
import { MdColorLens } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../../../hooks/redux";
import { AppState } from "../../../../store";
import { getEmojiIcon } from "../../../../util";
import { getCurrentTheme } from "../../../../util/Themes";
import IconWrapper from "../Conversation/MessageBar/IconWrapper";
import EmojiModal from "./ConfigModal/EmojiModal";
import ThemeModal from "./ConfigModal/ThemeModal";
import ConversationDataTab from "./DataTab";
import ConversationSearchTab from "./SearchMsgTab";

export const useTabItems = () => {
  const { t } = useTranslation();
  return {
    SEARCH: t("search"),
    THEME: t("changetheme"),
    EMOJI: t("Changeemoji"),
    MEDIA: "Media",
    FILES: "Files",
    LINKS: "Links",
  };
};

const DetailConversationTab = ({
  openDetailTab,
  setOpenDetailTab,
}: {
  openDetailTab: boolean;
  setOpenDetailTab: Function;
}) => {
  const { t } = useTranslation();
  const { SEARCH, THEME, EMOJI, MEDIA, FILES, LINKS } = useTabItems();
  const router = useRouter();
  const selectedConversation = useAppSelector(
    (state: AppState) => state.message.selectedConversation
  );
  const [itemSelected, setItemSelected] = useState("");
  const participant = selectedConversation?.participant;
  const menu = {
    [t("Customizechat")]: [
      {
        name: THEME,
        icon: <MdColorLens />,
      },
      {
        name: EMOJI,
        icon: <Text>{getEmojiIcon(selectedConversation?.emoji)}</Text>,
      },
    ],
    "Media, files and links": [
      {
        name: MEDIA,
        icon: <IoMdPhotos />,
      },
      {
        name: FILES,
        icon: <FaFileAlt />,
      },
      {
        name: LINKS,
        icon: <LinkIcon />,
      },
    ],
  };
  const actions = [
    {
      name: t("profile"),
      icon: <CgProfile width={"24px"} height={"24px"} />,
      onClick: () => {
        router.push(`/users/${participant?._id}`);
      },
    },
    {
      name: SEARCH,
      icon: <IoIosSearch width={"24px"} height={"24px"} />,
      onClick: () => {
        setItemSelected(SEARCH);
      },
    },
  ];
  const { conversationBackground, user1Message } = getCurrentTheme(
    selectedConversation?.theme
  );
  const borderColor = user1Message?.borderColor;

  const displaySubTab = () => {
    switch (itemSelected) {
      case SEARCH:
        return <ConversationSearchTab setItemSelected={setItemSelected} />;
      case MEDIA:
      case FILES:
      case LINKS:
        return (
          <ConversationDataTab
            currentTab={itemSelected}
            setItemSelected={setItemSelected}
          />
        );
      case EMOJI:
      case THEME:
        return (
          <Modal isOpen={true} onClose={() => setItemSelected("")}>
            <ModalOverlay />
            <ModalContent width={"fit-content"} p={4}>
              {itemSelected === EMOJI ? (
                <EmojiModal setItemSelected={setItemSelected} />
              ) : (
                <ThemeModal setItemSelected={setItemSelected} />
              )}
            </ModalContent>
          </Modal>
        );
      default:
        return <></>;
    }
  };
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Container
      width={"100%"}
      p={0}
      margin={0}
      border={`1px solid ${borderColor ? borderColor : "gray"}`}
      height={"fit-content"}
      borderRadius={"12px"}
      bg={conversationBackground?.backgroundColor}
      backgroundBlendMode={conversationBackground?.backgroundBlendMode}
      color={borderColor ? borderColor : ""}
    >
      {displaySubTab()}
      {(!itemSelected || [EMOJI, THEME].includes(itemSelected)) && (
        <>
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
            p={isMobile ? 2 : 8}
            gap={3}
          >
            {isMobile && (
              <Flex width={"100%"} justifyContent={"start"} mt={2}>
                <IoIosArrowBack
                  onClick={() => {
                    setOpenDetailTab(!openDetailTab);
                    // onCloseTab();
                  }}
                />
              </Flex>
            )}

            <Avatar src={participant?.avatar} size={"xl"} />
            <Text fontWeight={"500"} fontSize={"20px"}>
              {participant?.username}
            </Text>
            <Flex gap={4} alignItems={"center"}>
              {actions.map(({ name, icon, onClick }) => (
                <Flex
                  key={name}
                  flexDir={"column"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap={1}
                  onClick={onClick}
                >
                  <IconWrapper label={name} icon={icon} />
                  <Text fontSize={"12px"} fontWeight={600}>
                    {name}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
          <Accordion defaultIndex={isMobile ? [0, 1] : [0]} allowMultiple>
            {Object.keys(menu).map((itemName) => {
              const subItems = menu[itemName];
              return (
                <AccordionItem key={itemName}>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {itemName}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel py={isMobile ? 0 : 1} px={4}>
                    {subItems.map(({ name, icon }) => (
                      <Flex
                        key={name}
                        py={2}
                        gap={2}
                        alignItems={"center"}
                        cursor={"pointer"}
                        _hover={{
                          bg: "lightgray",
                        }}
                        onClick={() => {
                          setItemSelected(name);
                        }}
                      >
                        <div>{icon}</div>
                        <Text>{name}</Text>
                      </Flex>
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </Container>
  );
};

export default DetailConversationTab;
