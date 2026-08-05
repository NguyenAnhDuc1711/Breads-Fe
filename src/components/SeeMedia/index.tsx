import { ArrowBackIcon, ArrowForwardIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Constants } from "../../Breads-Shared/Constants";
import { useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updateSeeMedia } from "../../store/UtilSlice";
import { addEvent } from "../../util";

const SeeMedia = () => {
  const dispatch = useDispatch();
  const seeMediaInfo = useAppSelector(
    (state: AppState) => state.util.seeMediaInfo
  );
  const { colorMode } = useColorMode();
  const currentMedia = seeMediaInfo.media?.[seeMediaInfo.currentMediaIndex];

  useEffect(() => {
    addEvent({
      event: "see_media",
      payload: {
        media: seeMediaInfo?.media,
      },
    });
  }, []);

  useEffect(() => {
    if (seeMediaInfo?.media.length > 1) {
      const listenKeyDown = (e) => {
        e.preventDefault();
        if (e.keyCode === 39) {
          handleChangeCurrentMedia(1);
        } else if (e.keyCode === 37) {
          handleChangeCurrentMedia(-1);
        }
      };
      window.addEventListener("keydown", listenKeyDown);
      return () => {
        window.removeEventListener("keydown", listenKeyDown);
      };
    }
  }, [seeMediaInfo.currentMediaIndex]);

  const handleClose = () => {
    dispatch(
      updateSeeMedia({
        open: false,
        media: [],
        currentMediaIndex: -1,
      })
    );
  };

  const handleChangeCurrentMedia = (addStep) => {
    const addStepIndex = seeMediaInfo.currentMediaIndex + addStep;
    let nextIndex = -1;
    switch (addStepIndex) {
      case seeMediaInfo.media.length:
        nextIndex = 0;
        break;
      case -1:
        nextIndex = seeMediaInfo.media.length - 1;
        break;
      default:
        nextIndex = addStepIndex;
        break;
    }
    dispatch(
      updateSeeMedia({
        ...seeMediaInfo,
        currentMediaIndex: nextIndex,
      })
    );
  };

  const moveBtn = (addStep) => {
    return (
      <Button
        position={"fixed"}
        top={"50%"}
        width={"40px"}
        height={"40px"}
        left={addStep === -1 ? "12px" : ""}
        right={addStep === 1 ? "12px" : ""}
        borderRadius={"50%"}
        bg={"gray"}
        opacity={"0.3"}
        _hover={{
          opacity: "0.6",
        }}
        onClick={() => {
          handleChangeCurrentMedia(addStep);
        }}
      >
        {addStep === -1 ? (
          <ArrowBackIcon width={"32px"} height={"32px"} />
        ) : (
          <ArrowForwardIcon width={"32px"} height={"32px"} />
        )}
      </Button>
    );
  };

  if (!seeMediaInfo?.open) return null;

  return (
    <>
      <CloseIcon
        position={"fixed"}
        top={"24px"}
        left={"24px"}
        width={"40px"}
        height={"40px"}
        boxSizing="border-box"
        padding={"8px"}
        borderRadius={"50%"}
        cursor={"pointer"}
        zIndex={5000}
        _hover={{
          bg: "gray",
        }}
        onClick={handleClose}
      />
      <Modal isOpen={seeMediaInfo.open} onClose={handleClose}>
        <ModalOverlay bg={"black"} />
        <ModalContent
          margin="0"
          width={"100vw"}
          height={"100vh"}
          bg={"transparent"}
        >
          {seeMediaInfo?.media?.length > 1 && (
            <>
              {moveBtn(-1)}
              {moveBtn(1)}
            </>
          )}
          <Flex
            justifyContent={"center"}
            height={"100vh"}
            bg={colorMode === "dark" ? "#0a0a0a" : "#fafafa"}
          >
            {currentMedia.type === Constants.MEDIA_TYPE.VIDEO ? (
              <video
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="auto"
                maxWidth={{ base: "80%", md: "80vw" }}
                height={{ base: "80%", md: "100vh" }}
                width="fit-content"
                objectFit="cover"
                src={currentMedia?.url}
                controls
                autoPlay
              />
            ) : (
              <Image
                src={currentMedia?.url}
                height={{ base: "80%", md: "100vh" }}
                maxWidth={{ base: "80%", md: "80vw" }}
                width="fit-content"
                objectFit="cover"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="auto"
                alt="Media viewer"
              />
            )}
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SeeMedia;
