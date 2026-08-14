import { Button, Input, Text } from "../ui/primitives";
import { Modal, ModalBody, ModalContent, ModalOverlay } from "../ui/primitives";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";

const CodePopup = ({
  isOpen,
  title,
  description,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: (code: string) => void;
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent className="code-popup__content">
        <ModalBody className="code-popup__body">
          <div className="code-popup__form">
            <Text className="code-popup__title">{title}</Text>
            <Text className="code-popup__description">{description}</Text>
            <Input
              className="code-popup__input"
              placeholder="Type your code here ..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button className="btn-subtle" onClick={() => onSubmit(code)}>{t("submit")}</Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CodePopup;
