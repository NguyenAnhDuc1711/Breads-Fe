import { ViewIcon, ViewOffIcon } from "../../assests/chakraIcons";
import { Button, Input, Text, useColorMode } from "../ui/primitives";
import {
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "../ui/primitives";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { POST, PUT } from "../../config/API";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { showToast } from "../../store/UtilSlice";
import "./changePWModal.css";

export const handleUpdatePW = async ({
  currentPWValue,
  newPWValue,
  endAction,
  userId,
  dispatch,
}: {
  currentPWValue: string;
  newPWValue: string;
  endAction: Function;
  userId: string;
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
      path: Route.USER + USER_PATH.CHANGE_PW.replace(":id", userId),
      payload: {
        currentPW: currentPWValue,
        newPW: newPWValue,
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

export const handleConfirmResetPW = async ({
  userId,
  code,
  newPWValue,
  endAction,
  dispatch,
}: {
  userId: string;
  code: string;
  newPWValue: string;
  endAction: Function;
  dispatch: any;
}) => {
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
  const result = await POST({
    path: Route.USER + USER_PATH.PW_RESET_CONFIRM,
    payload: { userId, code, newPW: newPWValue },
  });
  if (result?.status === "error") {
    dispatch(
      showToast({
        title: "Error",
        description: result?.message || "Invalid or expired code",
        status: "error",
      })
    );
    return;
  }
  dispatch(
    showToast({ title: "Success", description: "Update success", status: "success" })
  );
  endAction();
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

  const titleColor = getButtonColor(
    currentPage === PageConstant.ACTIVITY,
    colorMode
  );

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
        className="change-pw-modal"
        style={{ width: "clamp(420px, 90vw, 460px)", maxWidth: "620px" }}
        id="modal"
      >
        <div className="change-pw-modal__spacer"></div>
        <Text className="change-pw-modal__title" style={{ color: titleColor }}>
          {t("changePassword")}
        </Text>
        <ModalCloseButton
          className="change-pw-modal__close"
          style={{ color: titleColor }}
        />
        <ModalBody>
          <FormControl>
            <FormLabel>Current password</FormLabel>
            <div className="change-pw-modal__field">
              <Input
                className="change-pw-modal__input"
                placeholder="Your current password"
                type={passwordInfo.currentPW.hidden ? "password" : "text"}
                value={passwordInfo.currentPW.value}
                onChange={(e) => updateFieldValue(e.target.value, true)}
              />
              {passwordInfo.currentPW.hidden ? (
                <ViewIcon
                  className="change-pw-modal__eye-icon"
                  onClick={() => visiblePW(true)}
                />
              ) : (
                <ViewOffIcon
                  className="change-pw-modal__eye-icon"
                  onClick={() => visiblePW(true)}
                />
              )}
            </div>
          </FormControl>
          <FormControl>
            <FormLabel>New password</FormLabel>
            <div className="change-pw-modal__field">
              <Input
                className="change-pw-modal__input"
                placeholder="New password"
                type={passwordInfo.newPW.hidden ? "password" : "text"}
                value={passwordInfo.newPW.value}
                onChange={(e) => updateFieldValue(e.target.value, false)}
              />
              {passwordInfo.newPW.hidden ? (
                <ViewIcon
                  className="change-pw-modal__eye-icon"
                  onClick={() => visiblePW(false)}
                />
              ) : (
                <ViewOffIcon
                  className="change-pw-modal__eye-icon"
                  onClick={() => visiblePW(false)}
                />
              )}
            </div>
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
