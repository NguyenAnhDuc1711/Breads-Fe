import { SearchIcon } from "../../../assests/chakraIcons";
import { Button, Flex, Input, Text, useColorModeValue } from "@chakra-ui/react";
import Conversations from "./Conversations";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LeftSideBarMsg = ({
  onSelectConversation,
}: {
  onSelectConversation: Function;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  return (
    <Flex
      gap={4}
      flexDirection={{
        base: "column",
        md: "row",
      }}
      width={{
        base: "100%",
        md: "full",
      }}
      maxW={{
        sm: "480px",
        md: "full",
      }}
      pr={{ base: 0, md: 3 }}
      mx={"auto"}
      maxHeight={`85vh`}
      overflowY={"scroll"}
    >
      <Flex
        flex={30}
        gap={3}
        flexDirection={"column"}
        width={{
          base: "100%",
          md: "250px",
        }}
        mx={"auto"}
      >
        <Text
          fontWeight={700}
          color={useColorModeValue("gray.600", "gray.400")}
        >
          {" "}
          {t("Yourconversations")}
        </Text>
        <form>
          <Flex alignItems={"center"} gap={2}>
            <Input
              fontSize={{
                base: "lg",
                md: "md",
              }}
              placeholder={t("Searchforuser")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button size={"sm"}>
              <SearchIcon />{" "}
            </Button>
          </Flex>
        </form>
        <Conversations
          searchValue={searchValue}
          onSelect={onSelectConversation}
        />
      </Flex>
    </Flex>
  );
};

export default LeftSideBarMsg;
