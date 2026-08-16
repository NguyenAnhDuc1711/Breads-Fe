import { Button, useColorMode } from "../../components/ui/primitives";
import {
  ButtonGroup,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "../../components/ui/primitives";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsBrightnessHigh } from "react-icons/bs";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiMenuAlt4 } from "react-icons/hi";
import { MdOutlineBrightness2 } from "react-icons/md";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { openPopup } from "../../store/ReportSlice";
import { logout } from "../../store/UserSlice/asyncThunk";
import { openLoginPopupAction, showToast } from "../../store/UtilSlice";
import "./SidebarMenu.css";

const SidebarMenu = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isSubMenuOpen1, setIsSubMenuOpen1] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<string>("top-start");
  const { setColorMode } = useColorMode();

  useEffect(() => {
    const updatePlacement = () => {
      setMenuPlacement(window.innerWidth < 768 ? "top-end" : "top-start");
    };
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, []);

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
      spread: true,
      onClick: () => {
        setIsSubMenuOpen(true);
        setIsSubMenuOpen1(false);
      },
      name: t("interface"),
    },
    {
      spread: true,
      onClick: () => {
        setIsSubMenuOpen1(true);
        setIsSubMenuOpen(false);
      },
      name: t("language"),
    },
    {
      onClick: () => {
        dispatch(openPopup());
        handleCloseMenu();
      },
      name: t("report_issue"),
    },
    ...(userInfo?._id
      ? [
          {
            onClick: () => {
              handleLogout();
            },
            name: t("logout"),
          },
        ]
      : [
          {
            onClick: () => {
              dispatch(openLoginPopupAction());
              handleCloseMenu();
            },
            name: t("SignIn"),
          },
        ]),
  ];

  const themeBtns = [
    {
      name: "Light",
      icon: <BsBrightnessHigh />,
      focusClass: "sidebar-menu__theme-btn--blue",
      onClick: () => setColorMode("light"),
    },
    {
      name: "Dark",
      icon: <MdOutlineBrightness2 />,
      focusClass: "sidebar-menu__theme-btn--green",
      onClick: () => setColorMode("dark"),
    },
    {
      name: "Auto",
      focusClass: "sidebar-menu__theme-btn--red",
      onClick: () => {},
    },
  ];

  const languageBtns = [
    {
      name: t("english"),
      focusClass: "sidebar-menu__theme-btn--blue",
      onClick: () => handleLanguageChange("en"),
    },
    {
      name: t("vietnamese"),
      focusClass: "sidebar-menu__theme-btn--blue",
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
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!isMenuOpen && (
        <Button className="sidebar-menu__toggle" onClick={handleMenuOpen}>
          <HiMenuAlt4 size={24} />
        </Button>
      )}
      {isMenuOpen && !isSubMenuOpen && !isSubMenuOpen1 && (
        <Menu isOpen={isMenuOpen} placement={menuPlacement}>
          <MenuButton
            className="sidebar-menu__toggle"
            onClick={handleCloseMenu}
          >
            <HiMenuAlt4 size={24} />
          </MenuButton>
          <MenuList
            className="sidebar-menu__list"
            bg={colorMode === "dark" ? "#121212" : "#ffffff"}
          >
            {menuItems.map((item) => (
              <React.Fragment key={item.name}>
                {(item.name === "Báo cáo sự cố" ||
                  item.name === "Report a problem") && <MenuDivider />}
                <MenuItem
                  className={`sidebar-menu__item${
                    item.spread ? " sidebar-menu__item--spread" : ""
                  }`}
                  onClick={item.onClick}
                >
                  {item.name === "Giao diện" ||
                  item.name === "Ngôn ngữ" ||
                  item.name === "Interface" ||
                  item.name === "Language" ? (
                    <div className="sidebar-menu__item-row">
                      <div>{item.name}</div>
                      <FaChevronRight />
                    </div>
                  ) : (
                    item.name
                  )}
                </MenuItem>
              </React.Fragment>
            ))}
          </MenuList>
        </Menu>
      )}
      {isSubMenuOpen && (
        <Menu isOpen={isSubMenuOpen} placement={menuPlacement}>
          <MenuButton
            className="sidebar-menu__toggle"
            onClick={handleCloseMenu}
          >
            <HiMenuAlt4 size={24} />
          </MenuButton>
          <MenuList
            className="sidebar-menu__list sidebar-menu__list--sub"
            bg={colorMode === "dark" ? "#121212" : "#ffffff"}
          >
            <MenuItem
              className="sidebar-menu__back-item"
              onClick={() => setIsSubMenuOpen(false)}
            >
              <FaChevronLeft />
              <div className="sidebar-menu__back-label">{t("interface")}</div>
            </MenuItem>
            <ButtonGroup isAttached className="sidebar-menu__theme-group">
              {themeBtns.map((btn) => (
                <Button
                  key={btn.name}
                  className={`sidebar-menu__theme-btn ${btn.focusClass}`}
                  onClick={btn.onClick}
                >
                  {btn?.icon ? (
                    btn.icon
                  ) : (
                    <div className="sidebar-menu__theme-btn-label">
                      {btn.name}
                    </div>
                  )}
                </Button>
              ))}
            </ButtonGroup>
          </MenuList>
        </Menu>
      )}
      {isSubMenuOpen1 && (
        <Menu isOpen={isSubMenuOpen1} placement={menuPlacement}>
          <MenuButton
            className="sidebar-menu__toggle"
            onClick={handleCloseMenu}
          >
            <HiMenuAlt4 size={24} />
          </MenuButton>
          <MenuList
            className="sidebar-menu__list sidebar-menu__list--sub"
            bg={colorMode === "dark" ? "#121212" : "#ffffff"}
          >
            <MenuItem
              className="sidebar-menu__back-item"
              onClick={() => setIsSubMenuOpen1(false)}
            >
              <FaChevronLeft />
              <div className="sidebar-menu__back-label">{t("language")}</div>
            </MenuItem>
            <ButtonGroup isAttached className="sidebar-menu__theme-group">
              {languageBtns.map((btn) => (
                <Button
                  key={btn.name}
                  className={`sidebar-menu__theme-btn--lang ${btn.focusClass}`}
                  onClick={btn.onClick}
                >
                  <div className="sidebar-menu__theme-btn-label">
                    {btn.name}
                  </div>
                </Button>
              ))}
            </ButtonGroup>
          </MenuList>
        </Menu>
      )}
    </div>
  );
};

export default SidebarMenu;
