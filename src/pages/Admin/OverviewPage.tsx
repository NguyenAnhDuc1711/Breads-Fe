"use client";

import { Container, Flex } from "@chakra-ui/react";
import LeftSideBarOverview from "../../components/Admin/Overview/LeftSideBar";
import RightSideContentOverview from "../../components/Admin/Overview/RightSideContent";

const OverviewPage = () => {
  return (
    <Flex>
      <LeftSideBarOverview />
      <Container flex={1} margin={0} p={0} maxWidth={"100vw"}>
        <RightSideContentOverview />
      </Container>
    </Flex>
  );
};

export default OverviewPage;
