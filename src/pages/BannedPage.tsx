"use client";

import { Button, Container, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const BannedPage = () => {
  const { t } = useTranslation();

  const handleGoBack = (): void => {
    localStorage.removeItem("userId");
    window.location.reload();
  };

  return (
    <Container
      maxW="container.md"
      textAlign="center"
      py={10}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <VStack spacing={4}>
        <Text fontSize="4xl" fontWeight="bold" color="red.500">
          {t("bannedTitle")}
        </Text>
        <Text fontSize="lg" color="gray.600">
          {t("bannedMsg")}
        </Text>
        <Button onClick={handleGoBack}>{t("goBack")}</Button>
      </VStack>
    </Container>
  );
};

export default BannedPage;
