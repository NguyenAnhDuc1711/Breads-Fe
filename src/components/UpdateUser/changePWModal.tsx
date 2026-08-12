import { ViewIcon, ViewOffIcon } from "../../assests/chakraIcons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { PUT } from "../../config/API";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { showToast } from "../../store/UtilSlice";

export const handleUpdatePW = async ({
  currentPWValue,
  newPWValue,
  endAction,
  userId,
  forgotPW = false,
  dispatch,
}: {
  currentPWValue: string;
  newPWValue: string;
  endAction: Function;
  userId: string;
  forgotPW?: boolean;
  dispatch: any;
}) => {
  // const { t } = useTranslation();
  try {
    if (newPWValue.trim().length < 6) {
      dispatch(
        showToast({
          title: "Error",
          description: "Password need at least 6 characters",
          status: "error",
        })
      );
      return;
    }
    await PUT({
      path: Route.USER + USER_PATH.CHANGE_PW + userId,
      payload: {
        currentPW: currentPWValue,
        newPW: newPWValue,
        forgotPW: forgotPW,
      },
    });
    dispatch(
      showToast({
        title: "Success",
        description: "Update success",
        status: "success",
      })
    );
    endAction();
  } catch (err) {
    console.error(err);
    endAction();
  }
};

const ChangePWModal = ({ setPopup }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { colorMode } = useColorMode();
  const { currentPage } = useAppSelector((state: AppState) => state.util);
  const [passwordInfo, setPasswordInfo] = useState({
    currentPW: {
      hidden: true,
      value: "",
    },
    newPW: {
      hidden: true,
      value: "",
    },
  });

  const updateFieldValue = (value, isCurrentPW) => {
    const cloneState = { ...passwordInfo };
    if (isCurrentPW) {
      cloneState.currentPW.value = value;
    } else {
      cloneState.newPW.value = value;
    }
    setPasswordInfo(cloneState);
  };

  const visiblePW = (isCurrentPW) => {
    const cloneState = { ...passwordInfo };
    if (isCurrentPW) {
      cloneState.currentPW.hidden = !cloneState.currentPW.hidden;
    } else {
      cloneState.newPW.hidden = !cloneState.newPW.hidden;
    }
    setPasswordInfo(cloneState);
  };

  const getButtonColor = (isActive, colorMode) => {
    if (isActive) {
      return colorMode === "dark" ? "#f3f5f7" : "#000000";
    }
    return colorMode === "dark" ? "#4d4d4d" : "#a0a0a0";
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setPopup({
          isOpen: false,
          type: "",
        });
      }}
    >
      <ModalOverlay />
      <ModalContent
        position={"relative"}
        boxSizing="border-box"
        width={["420px", "460px"]}
        maxWidth={"620px"}
        borderRadius={"16px"}
        id="modal"
        padding={"4px 8px"}
      >
        <Box p={1}></Box>
        <Text
          position={"absolute"}
          top={"-36px"}
          left={"50%"}
          transform={"translateX(-50%)"}
          color={getButtonColor(
            currentPage === PageConstant.ACTIVITY,
            colorMode
          )}
          zIndex={4000}
          textTransform={"capitalize"}
          fontWeight={600}
          fontSize={"18px"}
        >
          {t("changePassword")}
        </Text>
        <ModalCloseButton
          position={"absolute"}
          top={"-36px"}
          left={"0"}
          color={getButtonColor(
            currentPage === PageConstant.ACTIVITY,
            colorMode
          )}
        />
        <ModalBody>
          <FormControl>
            <FormLabel>Current password</FormLabel>
            <Flex
              alignItems={"center"}
              gap={"6px"}
              border={"1px solid gray"}
              borderRadius={"6px"}
              padding={"0 12px"}
            >
              <Input
                placeholder="Your current password"
                _placeholder={{ color: "gray.500" }}
                padding="0"
                border={"none"}
                outline={"none"}
                _focus={{
                  boxShadow: "none",
                }}
                type={passwordInfo.currentPW.hidden ? "password" : "text"}
                value={passwordInfo.currentPW.value}
                onChange={(e) => updateFieldValue(e.target.value, true)}
              />
              {passwordInfo.currentPW.hidden ? (
                <ViewIcon
                  width={"24px"}
                  height={"18px"}
                  cursor={"pointer"}
                  onClick={() => visiblePW(true)}
                />
              ) : (
                <ViewOffIcon
                  width={"24px"}
                  height={"18px"}
                  cursor={"pointer"}
                  onClick={() => visiblePW(true)}
                />
              )}
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel>New password</FormLabel>
            <Flex
              alignItems={"center"}
              gap={"6px"}
              border={"1px solid gray"}
              borderRadius={"6px"}
              padding={"0 12px"}
            >
              <Input
                placeholder="New password"
                _placeholder={{ color: "gray.500" }}
                padding="0"
                border={"none"}
                outline={"none"}
                _focus={{
                  boxShadow: "none",
                }}
                type={passwordInfo.newPW.hidden ? "password" : "text"}
                value={passwordInfo.newPW.value}
                onChange={(e) => updateFieldValue(e.target.value, false)}
              />
              {passwordInfo.newPW.hidden ? (
                <ViewIcon
                  width={"24px"}
                  height={"18px"}
                  cursor={"pointer"}
                  onClick={() => visiblePW(false)}
                />
              ) : (
                <ViewOffIcon
                  width={"24px"}
                  height={"18px"}
                  cursor={"pointer"}
                  onClick={() => visiblePW(false)}
                />
              )}
            </Flex>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              setPopup({
                isOpen: false,
                type: "",
              });
            }}
          >
            Close
          </Button>
          <Button
            variant=""
            onClick={() => {
              if (userInfo?._id) {
                handleUpdatePW({
                  currentPWValue: passwordInfo.currentPW.value,
                  newPWValue: passwordInfo.newPW.value,
                  userId: userInfo._id,
                  endAction: () => {
                    setPopup({
                      isOpen: false,
                      type: "",
                    });
                  },
                  dispatch,
                });
              }
            }}
          >
            Update password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangePWModal;
