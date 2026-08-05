import { Flex, Image, Text, useColorMode, Link } from "@chakra-ui/react";

const LinkBox = ({ link, color = "" }: { link: any; color?: string }) => {
  const { colorMode } = useColorMode();

  return (
    <Link
      href={link.url}
      width={"100%"}
      borderRadius={4}
      isExternal
      _hover={{
        textDecoration: "none",
        backgroundColor: "gray",
      }}
    >
      <Flex
        p={2}
        pr={4}
        gap={2}
        alignItems={"center"}
        width={"100%"}
        cursor={"pointer"}
      >
        <Image
          src={link.image}
          width={"36px"}
          height={"36px"}
          borderRadius={3}
          alt={link.title ? `${link.title} thumbnail` : "Link preview"}
        />
        <Flex
          flexDir={"column"}
          alignItems={"center"}
          width={"calc(100% - 40px)"}
        >
          <Text
            fontWeight={600}
            fontSize={"12px"}
            textOverflow={"ellipsis"}
            maxW={"100%"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            color={color ? color : ""}
          >
            {link.title}
          </Text>
          <Text
            fontWeight={400}
            color={"blue"}
            fontSize={"10px"}
            textOverflow={"ellipsis"}
            maxW={"100%"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
          >
            {link.url}
          </Text>
        </Flex>
      </Flex>
    </Link>
  );
};

export default LinkBox;
