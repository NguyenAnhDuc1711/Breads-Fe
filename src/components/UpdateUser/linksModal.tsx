import { AddIcon, DeleteIcon } from "../../assests/chakraIcons";
import { Button, Input, Text } from "../ui/primitives";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "../ui/primitives";
import "./linksModal.css";

const LinksModal = ({
  inputs,
  setInputs,
  setPopup,
  handleDeleteLink,
  handleAddMoreLink,
}: {
  inputs: {
    name: string;
    bio: string;
    links: string[];
    avatar: string;
  };
  setInputs: Function;
  setPopup: Function;
  handleDeleteLink: Function;
  handleAddMoreLink: Function;
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setPopup({
          isOpen: false,
          type: "",
        });
      }}
    >
      <ModalOverlay />
      <ModalContent
        className="links-modal"
        style={{ width: "460px", maxWidth: "620px" }}
        id="modal"
      >
        <div className="links-modal__spacer"></div>
        <Text className="links-modal__title">Add links</Text>
        <ModalCloseButton className="links-modal__close" />
        <ModalBody>
          <div className="links-modal__list">
            {inputs.links.map((link, index) => (
              <div className="links-modal__row" key={`link-${index}`}>
                <Input
                  className="links-modal__input"
                  placeholder="Your link"
                  type="text"
                  value={link}
                  onChange={(e) => {
                    const value = e.target.value;
                    inputs.links[index] = value;
                    const newLinks = [...inputs.links];
                    setInputs({
                      ...inputs,
                      links: newLinks,
                    });
                  }}
                />
                <DeleteIcon
                  className="links-modal__delete-icon"
                  onClick={() => {
                    handleDeleteLink(index);
                  }}
                />
              </div>
            ))}
            <div
              className="links-modal__add-row"
              onClick={() => handleAddMoreLink()}
            >
              <AddIcon />
              <Text>Add more links</Text>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={0}
            onClick={() => {
              setPopup({
                isOpen: false,
                type: "",
              });
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LinksModal;
