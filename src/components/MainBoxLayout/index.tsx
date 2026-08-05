"use client";

import { Container, Flex, useColorMode } from "@chakra-ui/react";
import { HeaderHeight } from "../../Layout";

export const containerBoxWidth = "640px";

const ContainerLayout = ({ children }) => {
  const { colorMode } = useColorMode();

  return (
    <Flex
      position={"sticky"}
      justifyContent={"center"}
      width={"calc(100vw-12px)"}
      margin={"0"}
      height={"fit-content"}
    >
      <Container
        bg={colorMode === "dark" ? "#181818" : "#fafafa"}
        minHeight={`calc(100vh - ${HeaderHeight + 24}px)`}
        height={"fit-content"}
        mt={`${HeaderHeight + 12}px`}
        mb={"12px"}
        borderRadius={"2xl"}
        width={containerBoxWidth}
        maxWidth={containerBoxWidth}
        padding={"16px"}
        boxShadow={"0px 0px 8px -3px rgba(0,0,0,0.53)"}
        display={"flex"}
        flexDirection={"column"}
      >
        {children}
      </Container>
    </Flex>
  );
};

export default ContainerLayout;
