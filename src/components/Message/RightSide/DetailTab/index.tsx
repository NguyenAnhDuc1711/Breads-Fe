"use client";

import { LinkIcon } from "../../../../assests/chakraIcons";
import { Avatar, Box, Text, useBreakpointValue } from "../../../ui/primitives";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Modal,
  ModalContent,
  ModalOverlay,
} from "../../../ui/primitives";
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
import "./index.css";

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
    (state: AppState) => state.message.selectedConversation,
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
    selectedConversation?.theme,
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
        return (
          <Modal isOpen={true} onClose={() => setItemSelected("")}>
            <ModalOverlay />
            <ModalContent
              className="detail-tab__modal-content"
              style={{ width: "fit-content" }}
            >
              <EmojiModal setItemSelected={setItemSelected} />
            </ModalContent>
          </Modal>
        );
      case THEME:
        return (
          <Modal isOpen={true} onClose={() => setItemSelected("")} size="xl">
            <ModalOverlay />
            <ModalContent
              className="detail-tab__theme-modal-content"
              style={{
                maxWidth: "540px",
                width: "92vw",
                borderRadius: "16px",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <ThemeModal setItemSelected={setItemSelected} />
            </ModalContent>
          </Modal>
        );
      default:
        return <></>;
    }
  };
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <div
      className="detail-tab"
      style={{
        border: `1px solid ${borderColor ? borderColor : "gray"}`,
        backgroundColor: conversationBackground?.backgroundColor,
        backgroundBlendMode: conversationBackground?.backgroundBlendMode,
        color: borderColor || undefined,
      }}
    >
      {displaySubTab()}
      {(!itemSelected || [EMOJI, THEME].includes(itemSelected)) && (
        <>
          <div
            className={`detail-tab__profile${
              isMobile
                ? " detail-tab__profile--mobile"
                : " detail-tab__profile--desktop"
            }`}
          >
            {isMobile && (
              <div className="detail-tab__back-row">
                <IoIosArrowBack
                  onClick={() => {
                    setOpenDetailTab(!openDetailTab);
                    // onCloseTab();
                  }}
                />
              </div>
            )}

            <Avatar src={participant?.avatar} size={"xl"} />
            <Text className="detail-tab__username">
              {participant?.username}
            </Text>
            <div className="detail-tab__actions">
              {actions.map(({ name, icon, onClick }) => (
                <div
                  className="detail-tab__action-item"
                  key={name}
                  onClick={onClick}
                >
                  <IconWrapper label={name} icon={icon} />
                  <Text className="detail-tab__action-label">{name}</Text>
                </div>
              ))}
            </div>
          </div>
          <Accordion defaultIndex={isMobile ? [0, 1] : [0]} allowMultiple>
            {Object.keys(menu).map((itemName) => {
              const subItems = menu[itemName];
              return (
                <AccordionItem key={itemName}>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {itemName}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    className={`detail-tab__accordion-panel${
                      isMobile
                        ? " detail-tab__accordion-panel--mobile"
                        : " detail-tab__accordion-panel--desktop"
                    }`}
                  >
                    {subItems.map(({ name, icon }) => (
                      <div
                        className="detail-tab__menu-item"
                        key={name}
                        onClick={() => {
                          setItemSelected(name);
                        }}
                      >
                        <div>{icon}</div>
                        <Text>{name}</Text>
                      </div>
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </div>
  );
};

export default DetailConversationTab;
