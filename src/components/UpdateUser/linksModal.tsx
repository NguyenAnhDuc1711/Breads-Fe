import { AddIcon, DeleteIcon } from "../../assests/chakraIcons";
import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

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
        position={"relative"}
        boxSizing="border-box"
        width="460px"
        maxWidth={"620px"}
        bg={"white"}
        color={"gray"}
        borderRadius={"16px"}
        id="modal"
        padding={"4px 8px"}
      >
        <Box p={1}></Box>
        <Text
          position={"absolute"}
          top={"-36px"}
          left={"50%"}
          transform={"translateX(-50%)"}
          color={"white"}
          zIndex={4000}
          textTransform={"capitalize"}
          fontWeight={600}
          fontSize={"18px"}
        >
          Add links
        </Text>
        <ModalCloseButton
          position={"absolute"}
          top={"-36px"}
          left={"0"}
          color={"white"}
        />
        <ModalBody>
          <Flex mt={"10px"} flexDirection={"column"} gap={"8px"}>
            {inputs.links.map((link, index) => (
              <Flex key={`link-${index}`} gap={"12px"} alignItems={"center"}>
                <Input
                  placeholder="Your link"
                  _placeholder={{ color: "gray.500" }}
                  type="text"
                  border={"1px solid gray"}
                  value={link}
                  height={"36px"}
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
                  border={"1px solid gray"}
                  borderRadius={"6px"}
                  width={"36px"}
                  height={"36px"}
                  padding={"8px"}
                  cursor={"pointer"}
                  _hover={{
                    color: "red",
                  }}
                  onClick={() => {
                    handleDeleteLink(index);
                  }}
                />
              </Flex>
            ))}
            <Flex
              alignItems={"center"}
              justifyContent={"center"}
              gap="12px"
              mt={3}
              border={"1px solid gray"}
              borderRadius={"10px"}
              padding={"6px"}
              cursor={"pointer"}
              onClick={() => handleAddMoreLink()}
            >
              <AddIcon />
              <Text>Add more links</Text>
            </Flex>
          </Flex>
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
