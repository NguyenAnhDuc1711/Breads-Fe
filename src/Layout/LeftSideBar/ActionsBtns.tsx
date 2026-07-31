"use client";

import { Button, useColorMode } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { FaFacebookMessenger, FaRegHeart } from "react-icons/fa";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { getCurrentPage } from "../../util/route";

export const BtnLike = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const currentPage = getCurrentPage(pathname);

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  const handleClick = (): void => {
    router.push("/" + PageConstant.ACTIVITY);
  };

  return (
    <Button
      bg="transparent"
      _hover={{ bg: "transparent" }}
      color={getButtonColor(currentPage === PageConstant.ACTIVITY, colorMode)}
      onClick={handleClick}
      width="60px"
      height="60px"
      minW="60px"
      minH="60px"
      display={["block", "block", "none"]}
    >
      <FaRegHeart size={24} />
    </Button>
  );
};

export const BtnMess = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const currentPage = getCurrentPage(pathname);

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  const handleClick = () => {
    router.push("/" + PageConstant.CHAT);
  };

  return (
    <Button
      bg="transparent"
      _hover={{ bg: "transparent" }}
      color={getButtonColor(currentPage === PageConstant.CHAT, colorMode)}
      onClick={handleClick}
      width="60px"
      height="60px"
      minW="60px"
      minH="60px"
      display={["block", "block", "none"]}
    >
      <FaFacebookMessenger size={24} />
    </Button>
  );
};
