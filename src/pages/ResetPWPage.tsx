"use client";

import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "../components/ui/primitives";
import { FormControl, FormErrorMessage } from "../components/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { decodeString } from "../Breads-Shared/util";
import { handleUpdatePW } from "../components/UpdateUser/changePWModal";
import { useAppDispatch } from "../hooks/redux";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import ErrorPage from "./ErrorPage";
import "./ResetPWPage.css";

const ResetPWPage = ({
  userId,
  code,
}: {
  userId: string;
  code: string;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  // localStorage is only readable client-side — start false (SSR-safe
  // default) and resolve for real once mounted, rather than reading it
  // directly in the render body.
  const [isTrueCode, setIsTrueCode] = useState(false);

  useEffect(() => {
    const encodedCode = localStorage.getItem("encodedCode");
    setIsTrueCode(decodeString(encodedCode ?? "") === code);
  }, [code]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
    passwordsMatch: true,
  });
  const [errors, setErrors] = useState<any>();

  useEffect(() => {
    dispatch(changePage({ nextPage: PageConstant.RESET_PW }));
    addEvent({
      event: "see_page",
      payload: {
        page: "reset_password",
      },
    });
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async () => {
    const { password, confirmPassword } = passwordData;
    if (password === confirmPassword) {
      setPasswordData({ ...passwordData, passwordsMatch: true });
      if (userId) {
        await handleUpdatePW({
          currentPWValue: "",
          newPWValue: passwordData.password,
          userId: userId,
          forgotPW: true,
          endAction: () => {
            const objectIdRegex = /^[a-fA-F0-9]{24}$/;
            if (userId && objectIdRegex.test(userId)) {
              localStorage.setItem("userId", userId);
              localStorage.removeItem("encodedCode");
              setTimeout(() => {
                router.push("/");
              }, 100);
            }
          },
          dispatch,
        });
      }
    } else {
      setPasswordData({ ...passwordData, passwordsMatch: false });
    }
  };

  const validateInputs = (): any => {
    const validationErrors: any = {};
    if (!passwordData.password) {
      validationErrors.password = t("passwordRequired2");
    } else if (passwordData.password.length < 6) {
      validationErrors.password = t("minPassWarning");
    }
    if (
      passwordData.confirmPassword !== passwordData.password &&
      !!passwordData.password.trim()
    ) {
      validationErrors.confirmPW = t("confirmWarning");
    }
    return validationErrors;
  };

  const handleBlur = (field) => {
    const validate: any = validateInputs();
    let newErrors: any = { ...errors };
    if (field === "password") {
      newErrors.password = validate.password || "";
    }
    if (field == "confirmPassword") {
      newErrors.confirmPW = validate.confirmPW || "";
    }
    setErrors(newErrors);
  };

  return (
    <>
      {isTrueCode ? (
        <div className="reset-pw-page">
          <div>
            <Text className="reset-pw-page__title">{t("changePW")}</Text>
            <Text className="reset-pw-page__label">{t("newPW")}</Text>
            <FormControl
              className="reset-pw-page__field"
              isInvalid={!!errors?.password}
            >
              <InputGroup>
                <Input
                  fontSize={16}
                  placeholder={t("passwordRequired2")}
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  onBlur={() => handleBlur("password")}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => handleClickShowPassword()}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors?.password}</FormErrorMessage>
            </FormControl>
            <Text className="reset-pw-page__label--spaced">
              {t("confirmPW")}
            </Text>
            <FormControl
              className="reset-pw-page__field"
              isInvalid={!!errors?.confirmPW}
            >
              <InputGroup>
                <Input
                  fontSize={16}
                  placeholder={t("confirmPWRequired")}
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => handleClickShowPassword()}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors?.confirmPW}</FormErrorMessage>
            </FormControl>
            <div className="reset-pw-page__submit-row">
              <Button className="btn-subtle" onClick={handleSubmit}>{t("submit")}</Button>
            </div>
          </div>
        </div>
      ) : (
        <ErrorPage />
      )}
    </>
  );
};

export default ResetPWPage;
