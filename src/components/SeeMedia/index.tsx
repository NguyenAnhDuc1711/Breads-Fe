import { ArrowBackIcon, ArrowForwardIcon } from "../../assests/chakraIcons";
import { Button, Image } from "../ui/primitives";
import { Modal, ModalContent, ModalOverlay } from "../ui/primitives";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IoClose } from "react-icons/io5";
import { Constants } from "../../Breads-Shared/Constants";
import { useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updateSeeMedia } from "../../store/UtilSlice";
import { addEvent } from "../../util";
import "./index.css";

const SeeMedia = () => {
  const dispatch = useDispatch();
  const seeMediaInfo = useAppSelector(
    (state: AppState) => state.util.seeMediaInfo
  );
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
    if (seeMediaInfo?.open) {
      const listenKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.keyCode === 27) {
          e.preventDefault();
          handleClose();
        } else if (seeMediaInfo?.media?.length > 1) {
          if (e.key === "ArrowRight" || e.keyCode === 39) {
            e.preventDefault();
            handleChangeCurrentMedia(1);
          } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
            e.preventDefault();
            handleChangeCurrentMedia(-1);
          }
        }
      };
      window.addEventListener("keydown", listenKeyDown);
      return () => {
        window.removeEventListener("keydown", listenKeyDown);
      };
    }
  }, [seeMediaInfo.open, seeMediaInfo.currentMediaIndex, seeMediaInfo.media]);

  const handleClose = () => {
    dispatch(
      updateSeeMedia({
        open: false,
        media: [],
        currentMediaIndex: -1,
      })
    );
  };

  const handleChangeCurrentMedia = (addStep: number) => {
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

  const moveBtn = (addStep: number) => {
    return (
      <Button
        className={`see-media__nav-btn ${
          addStep === -1 ? "see-media__nav-btn--prev" : "see-media__nav-btn--next"
        }`}
        onClick={(e: any) => {
          e.stopPropagation();
          handleChangeCurrentMedia(addStep);
        }}
      >
        {addStep === -1 ? (
          <ArrowBackIcon width={"28px"} height={"28px"} />
        ) : (
          <ArrowForwardIcon width={"28px"} height={"28px"} />
        )}
      </Button>
    );
  };

  if (!seeMediaInfo?.open || !currentMedia) return null;

  return (
    <Modal isOpen={seeMediaInfo.open} onClose={handleClose}>
      <ModalOverlay bg={"rgba(0, 0, 0, 0.85)"} onClick={handleClose} />
      <ModalContent className="see-media__modal-content">
        <button
          type="button"
          className="see-media__close-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close media viewer"
        >
          <IoClose size={26} />
        </button>
        {seeMediaInfo?.media?.length > 1 && (
          <>
            {moveBtn(-1)}
            {moveBtn(1)}
          </>
        )}
        <div className="see-media__stage" onClick={handleClose}>
          {currentMedia.type === Constants.MEDIA_TYPE.VIDEO ? (
            <video
              className="see-media__video"
              src={currentMedia?.url}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              className="see-media__image"
              src={currentMedia?.url}
              alt="Media viewer"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default SeeMedia;
