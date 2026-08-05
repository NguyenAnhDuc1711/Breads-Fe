import { CloseIcon } from "@chakra-ui/icons";
import { Flex, Image, Text } from "@chakra-ui/react";

const ItemUploadDisplay = ({ item, imgSrc, onClick, isPost = false }) => {
  return (
    <Flex
      key={item?.name}
      height={isPost ? "50px" : "100%"}
      minWidth={"72px"}
      width={"fit-content"}
      p={"6px"}
      border={"1px solid gray"}
      margin={0}
      flexDirection={isPost ? "row" : "column"}
      justifyContent={item?.name ? "space-between" : "center"}
      alignItems={"center"}
      position={"relative"}
      gap={isPost ? "6px" : ""}
    >
      <CloseIcon
        position={"absolute"}
        top={"-7px"}
        right={"-7px"}
        width={"14px"}
        height={"14px"}
        borderRadius={"50%"}
        bg={"gray"}
        p={"2px"}
        cursor={"pointer"}
        _hover={{
          opacity: 0.8,
        }}
        onClick={() => {
          onClick();
        }}
      />
      <Image
        src={imgSrc}
        width={isPost ? "fit-content" : "60px"}
        maxHeight={item?.name && !isPost ? "calc(100% - 16px)" : "100%"}
        objectFit={"cover"}
        alt={item?.name ? `Preview of ${item.name}` : "Upload preview"}
      />
      {item?.name && (
        <Text
          maxWidth={"120px"}
          fontSize={"11px"}
          textOverflow={"ellipsis"}
          overflow={"hidden"}
          whiteSpace={"nowrap"}
        >
          {item?.name}
        </Text>
      )}
    </Flex>
  );
};

export default ItemUploadDisplay;
