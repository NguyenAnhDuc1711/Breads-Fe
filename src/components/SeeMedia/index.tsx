import { ArrowBackIcon, ArrowForwardIcon, CloseIcon } from "../../assests/chakraIcons";
import { Button, Image } from "../ui/primitives";
import { Modal, ModalContent, ModalOverlay } from "../ui/primitives";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
        className={`see-media__nav-btn ${
          addStep === -1 ? "see-media__nav-btn--prev" : "see-media__nav-btn--next"
        }`}
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
      <CloseIcon className="see-media__close" onClick={handleClose} />
      <Modal isOpen={seeMediaInfo.open} onClose={handleClose}>
        <ModalOverlay bg={"black"} />
        <ModalContent className="see-media__modal-content">
          {seeMediaInfo?.media?.length > 1 && (
            <>
              {moveBtn(-1)}
              {moveBtn(1)}
            </>
          )}
          <div className="see-media__stage">
            {currentMedia.type === Constants.MEDIA_TYPE.VIDEO ? (
              <video
                className="see-media__video"
                src={currentMedia?.url}
                controls
                autoPlay
              />
            ) : (
              <Image
                className="see-media__image"
                src={currentMedia?.url}
                alt="Media viewer"
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SeeMedia;
