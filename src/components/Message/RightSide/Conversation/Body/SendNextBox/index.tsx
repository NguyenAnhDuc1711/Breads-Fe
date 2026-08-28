import { CloseIcon } from "../../../../../../assests/chakraIcons";
import { Button, Input, Text } from "../../../../../ui/primitives";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "../../../../../ui/primitives";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyContentSvg } from "../../../../../../assests/icons";
import { MESSAGE_PATH, Route } from "../../../../../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import Socket from "../../../../../../socket";
import { AppState } from "../../../../../../store";
import {
  updateConversations,
  updateSendNextBox,
} from "../../../../../../store/MessageSlice";
import InfiniteScroll from "../../../../../InfiniteScroll";
import IconWrapper from "../../MessageBar/IconWrapper";
import SendNextItem from "./SendNextItem/item";
import "./index.css";

const SendNextBox = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { selectedConversation, sendNextBox, selectedMsg } = useAppSelector(
    (state) => state.message
  );
  const [searchValue, setSearchValue] = useState("");
  const [selectedConversations, setSelectedConversations] = useState([]);
  const init = useRef(true);

  useEffect(() => {
    if (selectedConversation?._id) {
      handleGetConversations({ page: 1 });
    }
  }, [searchValue, selectedConversation?._id]);

  const handleGetConversations = async ({ page }: { page: number }) => {
    try {
      init.current = false;
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.GET_CONVERSATIONS,
        {
          userId: userInfo?._id,
          page: page,
          limit: 15,
          searchValue,
        },
        ({ data }) => {
          if (!!data && data?.length) {
            const listSendNext = data?.filter(
              (conversation) => conversation?._id !== selectedConversation?._id
            );
            dispatch(
              updateSendNextBox({
                key: "conversations",
                value:
                  page === 1
                    ? listSendNext
                    : [...sendNextBox.conversations, ...listSendNext],
              })
            );
          }
        }
      );
    } catch (err) {
      console.error("handleGetConversations: ", err);
    }
  };

  const handleCloseBox = () => {
    dispatch(
      updateSendNextBox({
        key: "open",
        value: false,
      })
    );
    setSelectedConversations([]);
  };

  const handleSendNext = async () => {
    try {
      const socket = Socket.getInstant();
      socket.emit(
        Route.MESSAGE + MESSAGE_PATH.SEND_NEXT,
        {
          conversationsInfo: selectedConversations,
          msgInfo: selectedMsg,
          userId: userInfo._id,
        },
        ({ data }) => {
          const msgs = data?.msgs;
          const listConversationInfo = data?.listConversationInfo;
          if (msgs) {
            dispatch(updateConversations(listConversationInfo));
          }
        }
      );
      dispatch(
        updateSendNextBox({
          key: "open",
          value: false,
        })
      );
      setSelectedConversations([]);
    } catch (err) {
      console.error("handleSendNext: ", err);
    }
  };

  return (
    <div className="send-next-box">
      <Modal isOpen={sendNextBox.open} onClose={() => handleCloseBox()}>
        <ModalOverlay />
        <ModalContent className="send-next-modal">
          <ModalHeader className="send-next-modal__header">
            <div className="send-next-modal__header-row">
              <Text>Send message to</Text>
              <div className="send-next-modal__close-wrap">
                <IconWrapper
                  icon={
                    <CloseIcon
                      width={"20px"}
                      height={"20px"}
                      p={1}
                      onClick={() => handleCloseBox()}
                    />
                  }
                />
              </div>
            </div>
          </ModalHeader>
          <ModalBody maxHeight={"440px"} overflowY={"auto"} px={4} my={2}>
            <Input
              className="send-next-modal__search"
              placeholder={t("Searchforuser")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {sendNextBox.conversations?.length !== 0 || !init.current ? (
              <InfiniteScroll
                queryFc={(page) => {
                  handleGetConversations({ page });
                }}
                data={sendNextBox.conversations}
                cpnFc={(conversation) => (
                  <SendNextItem
                    conversation={conversation}
                    selectedConversations={selectedConversations}
                    setSelectedConversations={setSelectedConversations}
                  />
                )}
                preloadIndex={5}
              />
            ) : (
              <div className="send-next-modal__empty">
                <EmptyContentSvg />
              </div>
            )}
          </ModalBody>
          {selectedConversations?.length !== 0 && (
            <ModalFooter borderTop={"1px solid gray"}>
              <Button className="btn-subtle" onClick={() => handleSendNext()}>Send</Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SendNextBox;
