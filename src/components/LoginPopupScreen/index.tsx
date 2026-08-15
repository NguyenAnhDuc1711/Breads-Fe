import {
  Modal,
  ModalContent,
  ModalOverlay,
} from "../ui/primitives";
import { useAppDispatch } from "../../hooks/redux";
import Login from "../../pages/Login";
import { closeLoginPopupAction } from "../../store/UtilSlice";
import "./index.css";

const LoginPopupScreen = () => {
  const dispatch = useAppDispatch();
  const onClose = () => {
    dispatch(closeLoginPopupAction());
  };

  return (
    <Modal
      closeOnOverlayClick={true}
      isOpen={true}
      onClose={onClose}
      isCentered={true}
    >
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        className="login-popup__content"
        bg="transparent"
        boxShadow="none"
        borderRadius="24px"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="login-popup__form-wrap">
          <button
            type="button"
            className="login-popup__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
          <Login isPopup={true} />
        </div>
      </ModalContent>
    </Modal>
  );
};

export default LoginPopupScreen;
