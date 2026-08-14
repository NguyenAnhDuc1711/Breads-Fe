import { CloseIcon } from "../../assests/chakraIcons";
import { Button, useColorModeValue } from "../ui/primitives";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { openNewPostNotify, showToast } from "../../store/UtilSlice";
import { useEffect } from "react";
import "./NotificationPost.css";

const NotificationCreatePost = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const bgColor = useColorModeValue("ccl.light", "#444");
  const textColor = useColorModeValue("ccl.dark", "ccl.light");
  const openNotify = useAppSelector(
    (state: AppState) => state.util.newPostNotify
  );

  useEffect(() => {
    if (openNotify) {
      dispatch(
        showToast({
          title: "",
          description: t("toastCreadtedPost"),
          status: "info",
        })
      );
      const timeOut = setTimeout(() => {
        handleCloseToast();
      }, 3000);
      return () => {
        clearTimeout(timeOut);
      };
    }
  }, [openNotify]);

  const handleCloseToast = () => {
    dispatch(openNewPostNotify());
  };

  return <></>;

  return (
    <>
      {openNotify && (
        <div className="notification-post" style={{ backgroundColor: bgColor }}>
          <div className="notification-post__row">
            <p className="notification-post__text" style={{ color: textColor }}>
              {t("toastCreadtedPost")}
            </p>

            <Button
              className="notification-post__close-btn"
              size="sm"
              bg={bgColor}
              onClick={() => handleCloseToast()}
              variant="unstyled"
              _hover={{
                backgroundColor: bgColor,
              }}
              boxShadow={useColorModeValue(
                "0px 2px 4px rgba(255, 255, 255, 0.3)",
                "0px 2px 4px rgba(0, 0, 0, 0.2)"
              )}
            >
              <CloseIcon boxSize="8px" color={textColor} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCreatePost;
