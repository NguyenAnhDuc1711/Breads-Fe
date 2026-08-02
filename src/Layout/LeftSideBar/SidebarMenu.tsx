import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsBrightnessHigh } from "react-icons/bs";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiMenuAlt4 } from "react-icons/hi";
import { MdOutlineBrightness2 } from "react-icons/md";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch } from "../../hooks/redux";
import { openPopup } from "../../store/ReportSlice";
import { logout } from "../../store/UserSlice/asyncThunk";
import { showToast } from "../../store/UtilSlice";
import ClickOutsideComponent from "../../util/ClickoutCPN";

const SidebarMenu = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isSubMenuOpen1, setIsSubMenuOpen1] = useState(false);
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();
  const bgk = {
    bg: colorMode === "dark" ? "#0a0a0a" : "#ffffff",
    color: "100",
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };
  const menuItems = [
    {
      style: { ...bgk, justifyContent: "space-between" },
      onClick: () => {
        setIsSubMenuOpen(true);
        setIsSubMenuOpen1(false);
      },
      name: t("interface"),
    },
    {
      style: { ...bgk, justifyContent: "space-between" },
      onClick: () => {
        setIsSubMenuOpen1(true);
        setIsSubMenuOpen(false);
      },
      name: t("language"),
    },
    // {
    //   style: { ...bgk },
    //   onClick: () => {
    //     navigate("/" + PageConstant.SETTING.DEFAULT);
    //   },
    //   name: t("settings"),
    // },
    {
      style: { ...bgk },
      onClick: () => {
        dispatch(openPopup());
        handleCloseMenu();
      },
      name: t("report_issue"),
    },
    {
      style: { ...bgk },
      onClick: () => {
        handleLogout();
      },
      name: t("logout"),
    },
  ];

  const themeBtns = [
    {
      name: "Light",
      icon: <BsBrightnessHigh />,
      boxShadowFocus: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      onClick: () => setColorMode("light"),
    },
    {
      name: "Dark",
      icon: <MdOutlineBrightness2 />,
      boxShadowFocus: "0 0 0 3px rgba(72, 187, 120, 0.6)",
      onClick: () => setColorMode("dark"),
    },
    {
      name: t("automatic"),
      boxShadowFocus: "0 0 0 3px rgba(229, 62, 62, 0.6)",
      onClick: () => {},
    },
  ];

  const languageBtns = [
    {
      name: t("english"),
      boxShadowFocus: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      onClick: () => handleLanguageChange("en"),
    },
    {
      name: t("vietnamese"),
      boxShadowFocus: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      onClick: () => handleLanguageChange("vn"),
    },
  ];

  const handleLogout = async () => {
    try {
      dispatch(logout());
      router.push(`${PageConstant.LOGIN}`);
    } catch (error: any) {
      dispatch(
        showToast({
          title: "Error",
          description: error.message,
          status: "error",
        }),
      );
    }
  };

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
    setIsSubMenuOpen(false);
    setIsSubMenuOpen1(false);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setIsSubMenuOpen(false);
    setIsSubMenuOpen1(false);
  };

  return (
    <Box>
      {!isMenuOpen && (
        <Button
          onClick={handleMenuOpen}
          bg={"none"}
          color={colorMode === "dark" ? "#f3f5f7" : "#a0a0a0"}
          _hover={{ color: colorMode === "dark" ? "#f3f5f7" : "#000000" }}
          _focus={{
            color: colorMode === "dark" ? "#f3f5f7" : "#000000",
          }}
        >
          <HiMenuAlt4 size={24} />
        </Button>
      )}
      {isMenuOpen && !isSubMenuOpen && !isSubMenuOpen1 && (
        <ClickOutsideComponent onClose={handleCloseMenu}>
          <Menu isOpen={isMenuOpen}>
            <MenuButton as={Box} onClick={handleCloseMenu} py={2} px={4}>
              <HiMenuAlt4 size={24} />
            </MenuButton>
            <MenuList
              {...bgk}
              bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
            >
              {menuItems.map((item) => (
                <React.Fragment key={item.name}>
                  {(item.name === "Báo cáo sự cố" ||
                    item.name === "Report a problem") && <MenuDivider />}
                  <MenuItem
                    {...item.style}
                    onClick={item.onClick}
                    bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
                    color={colorMode === "dark" ? "gray.white" : "gray.dark"}
                    ml={"0.5rem"}
                    width={"calc(100% - 1rem)"}
                    padding={"12px"}
                    borderRadius="10px"
                    _hover={{
                      bg: colorMode === "dark" ? "#171717" : "#f0f0f0",
                      borderRadius: "10px",
                    }}
                  >
                    {item.name === "Giao diện" ||
                    item.name === "Ngôn ngữ" ||
                    item.name === "Interface" ||
                    item.name === "Language" ? (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Box>{item.name}</Box>
                        <FaChevronRight />
                      </Box>
                    ) : (
                      item.name
                    )}
                  </MenuItem>
                </React.Fragment>
              ))}
            </MenuList>
          </Menu>
        </ClickOutsideComponent>
      )}
      {isSubMenuOpen && (
        <ClickOutsideComponent onClose={handleCloseMenu}>
          <Menu isOpen={isSubMenuOpen}>
            <MenuButton as={Box} onClick={handleCloseMenu} py={2} px={4}>
              <HiMenuAlt4 size={24} />
            </MenuButton>
            <MenuList
              {...bgk}
              bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
              px={3}
            >
              <MenuItem
                {...bgk}
                onClick={() => setIsSubMenuOpen(false)}
                bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
                color={colorMode === "dark" ? "gray.100" : "gray.dark"}
                mb={"4px"}
              >
                <FaChevronLeft />
                <Box width={"100%"} textAlign={"center"}>
                  {t("interface")}
                </Box>
              </MenuItem>
              <ButtonGroup isAttached ml={1}>
                {themeBtns.map((btn) => (
                  <Button
                    key={btn.name}
                    flex={1}
                    onClick={btn.onClick}
                    width={"80px"}
                    _focus={{
                      boxShadow: btn.boxShadowFocus,
                      outline: "none",
                    }}
                  >
                    {btn?.icon ? (
                      btn.icon
                    ) : (
                      <Box
                        boxSizing="border-box"
                        padding={"0 16px"}
                        fontSize={"12px"}
                      >
                        {btn.name}
                      </Box>
                    )}
                  </Button>
                ))}
              </ButtonGroup>
            </MenuList>
          </Menu>
        </ClickOutsideComponent>
      )}
      {isSubMenuOpen1 && (
        <ClickOutsideComponent onClose={handleCloseMenu}>
          <Menu isOpen={isSubMenuOpen1}>
            <MenuButton as={Box} onClick={handleCloseMenu} py={2} px={4}>
              <HiMenuAlt4 size={24} />
            </MenuButton>
            <MenuList
              {...bgk}
              bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
              px={3}
            >
              <MenuItem
                {...bgk}
                onClick={() => setIsSubMenuOpen1(false)}
                bg={colorMode === "dark" ? "#0a0a0a" : "#ffffff"}
                color={colorMode === "dark" ? "gray.100" : "gray.dark"}
                mb={"4px"}
              >
                <FaChevronLeft />
                <Box width={"100%"} textAlign={"center"}>
                  {t("language")}
                </Box>
              </MenuItem>
              <ButtonGroup isAttached ml={1}>
                {languageBtns.map((btn) => (
                  <Button
                    key={btn.name}
                    flex={1}
                    onClick={btn.onClick}
                    width={"120px"}
                    _focus={{
                      boxShadow: btn.boxShadowFocus,
                      outline: "none",
                    }}
                  >
                    <Box padding={"0 16px"} fontSize={"12px"}>
                      {btn.name}
                    </Box>
                  </Button>
                ))}
              </ButtonGroup>
            </MenuList>
          </Menu>
        </ClickOutsideComponent>
      )}
    </Box>
  );
};

export default SidebarMenu;
