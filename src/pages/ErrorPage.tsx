"use client";

import { Container, Text, Button, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const ErrorPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoBack = (): void => {
    router.push("/");
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
          {t("errOops")}
        </Text>
        <Text fontSize="lg" color="gray.600">
          {t("errMsg")}
        </Text>
        <Button onClick={handleGoBack}>{t("goBack")}</Button>
      </VStack>
    </Container>
  );
};

export default ErrorPage;
