import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "../ui/primitives";
import { useAppDispatch } from "../../hooks/redux";
import Login from "../../pages/Login";
import { openLoginPopupAction } from "../../store/UtilSlice";
import "./index.css";

const LoginPopupScreen = () => {
  const dispatch = useAppDispatch();
  const onClose = () => {
    dispatch(openLoginPopupAction());
  };

  return (
    <Modal closeOnOverlayClick={true} isOpen={true} onClose={() => onClose()}>
      <ModalOverlay />
      <ModalContent
        className="login-popup__content"
        onClick={() => {
          onClose();
        }}
      >
        <ModalBody className="login-popup__body">
          <Login />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginPopupScreen;
