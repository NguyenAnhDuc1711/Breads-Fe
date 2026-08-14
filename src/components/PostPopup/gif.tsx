import { Image } from "../ui/primitives";
import {
  Fade,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "../ui/primitives";
import { Constants, gif } from "../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updatePostInfo } from "../../store/PostSlice";
import { addEvent } from "../../util";
import "./gif.css";

const GifBox = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);

  const handleAddGif = (url: string) => {
    addEvent({
      event: "add_post_gif",
      payload: {
        gif: url,
      },
    });
    dispatch(
      updatePostInfo({
        ...postInfo,
        media: [
          {
            url: url,
            type: Constants.MEDIA_TYPE.GIF,
          },
        ],
      })
    );
    onClose();
  };

  return (
    <Fade in={isOpen}>
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          className="gif-modal"
          style={{ width: "620px", maxWidth: "620px" }}
          id="modal"
        >
          <div className="gif-modal__spacer-top"></div>
          <div className="gif-modal__title">Chọn file Gif</div>
          <ModalCloseButton className="gif-modal__close" />

          <ModalBody className="gif-modal__body">
            <div className="gif-modal__grid">
              {gif.map((link, index) => (
                <Image
                  className="gif-modal__item"
                  loading="lazy"
                  key={link}
                  src={link}
                  alt={`GIF ${index + 1}`}
                  onClick={() => handleAddGif(link)}
                />
              ))}
            </div>
          </ModalBody>
          <div className="gif-modal__spacer-bottom"></div>
        </ModalContent>
      </Modal>
    </Fade>
  );
};

export default GifBox;
