"use client";

import {
  Button,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "../components/ui/primitives";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "../components/ui/primitives";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH } from "../Breads-Shared/APIConfig";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import CodePopup from "../components/CodePopup";
import { POST } from "../config/API";
import { useAppDispatch } from "../hooks/redux";
import { login } from "../store/UserSlice/asyncThunk";
import { closeLoginPopupAction, showToast } from "../store/UtilSlice";
import "./Login.css";

type LoginInput = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Pick<LoginInput, "email" | "password">>;

const Login = ({ isPopup = false }: { isPopup?: boolean } = {}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [openCodeBox, setOpenCodeBox] = useState<boolean>(false);
  const [inputs, setInputs] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fix #4: Stable keydown listener — no longer depends on inputs (stale closure
  // avoided by reading the latest inputs via a ref)
  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  const handleLoginStable = useCallback(async () => {
    // Read latest inputs from ref so the listener is never stale
    await handleLoginWithInputs(inputsRef.current);
  }, []);

  useEffect(() => {
    const enterListener = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleLoginStable();
    };
    window.addEventListener("keydown", enterListener);
    return () => window.removeEventListener("keydown", enterListener);
  }, [handleLoginStable]); // stable ref — listener registered only once

  // Fix #10: validateField now only checks its own errors, not the whole object
  const validateField = (
    fieldName: keyof LoginErrors,
    value?: string,
  ): boolean => {
    const fieldValue = value ?? inputs[fieldName as keyof LoginInput];
    let errorMsg = "";

    if (fieldName === "email") {
      if (!fieldValue) {
        errorMsg = t("emailRequired");
      } else if (!/\S+@\S+\.\S+/.test(fieldValue as string)) {
        errorMsg = t("invalidEmail");
      }
    }

    if (fieldName === "password") {
      if (!fieldValue) {
        errorMsg = t("passwordRequired");
      } else if ((fieldValue as string).length < 6) {
        errorMsg = t("incorrectPassword");
      }
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMsg || undefined,
    }));

    return !errorMsg;
  };

  const validateAll = (): boolean => {
    const emailOk = validateField("email");
    const passwordOk = validateField("password");
    return emailOk && passwordOk;
  };

  // Extracted inner logic so the stable keydown handler can call it with a snapshot
  const handleLoginWithInputs = async (currentInputs: LoginInput) => {
    if (!validateAll()) return;

    // Fix #7: Set loading state around API call
    setIsLoading(true);
    try {
      const data: any = await dispatch(login(currentInputs));
      if (data?.meta?.requestStatus === "fulfilled") {
        if (data?.payload?.error) {
          dispatch(
            showToast({
              title: "Không thành công!",
              description: data?.payload?.error,
              status: "error",
            }),
          );
        } else {
          dispatch(
            showToast({
              title: t("success"),
              description: t("loginsuccess"),
              status: "success",
            }),
          );
          dispatch(closeLoginPopupAction());
          if (window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/signup")) {
            router.replace("/");
          }
        }
      }
    } catch (error: any) {
      dispatch(
        showToast({
          title: "Không thành công!",
          description: error?.error || t("checkagain"),
          status: "error",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    await handleLoginWithInputs(inputs);
  };

  // Bước 2 (access-control-hardening): toàn bộ việc SINH mã và DỰNG URL reset đã chuyển sang
  // server (`POST /users/password-reset/requests`). Ba thứ bị xoá khỏi đây:
  //   - `codeSend`/`encodedString(...)`: client tự sinh mã thì mã không chứng minh được gì.
  //   - `localStorage.setItem("encodedCode", ...)`: mã không còn được đối chiếu ở client.
  //   - tiền kiểm `CHECK_VALID_USER`: endpoint đó trả lời thẳng "email này có tài khoản không" —
  //     công cụ dò tài khoản. Server giờ LUÔN trả 200 nên UI cũng hiển thị cùng một thông báo bất
  //     kể email có tồn tại hay không (chủ đích, không phải thiếu sót).
  const handleForgotPassword = async () => {
    try {
      const email = inputs.email;
      if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
        setOpenCodeBox(true);
        dispatch(
          showToast({
            title: "",
            description: t("codesend"),
            status: "success",
          }),
        );
        await POST({
          path: Route.USER + USER_PATH.PW_RESET_REQUEST,
          payload: { email },
        });
      } else {
        dispatch(
          showToast({
            title: "",
            description: t("Invalidemail"),
            status: "error",
          }),
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          title: "Error",
          description: "Server error",
          status: "error",
        }),
      );
    }
  };

  // Đối chiếu mã do SERVER thực hiện. `userId` chỉ được trả về khi mã đúng — thay cho việc gọi
  // `GET_USER_ID_FROM_EMAIL` (endpoint công khai email -> userId) như trước.
  const handleSubmitCode = async (code) => {
    try {
      const result = await POST({
        path: Route.USER + USER_PATH.PW_RESET_VERIFY,
        payload: { email: inputs.email, code },
      });
      if (result?.userId) {
        router.push(`/reset-pw/${result.userId}/${code}`);
      } else {
        dispatch(
          showToast({
            title: "",
            description: t("wrongcode"),
            status: "error",
          }),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardContent = (
    <div className={`login-page__card ${isPopup ? "login-page__card--popup" : ""}`}>
      <div className="login-page__header">
        <Heading className="login-page__heading">{t("SignIn")}</Heading>
        <Text className="login-page__subtitle">Welcome back to Breads</Text>
      </div>

      <div className="login-page__form-stack">
        <FormControl isRequired isInvalid={!!errors?.email}>
          <FormLabel className="login-page__label">Email</FormLabel>
          <Input
            type="email"
            className="login-page__input"
            placeholder="name@example.com"
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, email: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            onBlur={() => validateField("email")}
            value={inputs.email}
          />
          <FormErrorMessage className="login-page__error-msg">
            {errors?.email}
          </FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors?.password}>
          <div className="login-page__password-header">
            <FormLabel className="login-page__label">
              {t("password")}
            </FormLabel>
            <span
              className="login-page__forgot-link"
              onClick={() => {
                handleForgotPassword();
              }}
            >
              {t("forgotPW")}
            </span>
          </div>
          <InputGroup className="login-page__input-group">
            <Input
              type={showPassword ? "text" : "password"}
              className="login-page__input"
              placeholder="••••••••"
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              onBlur={() => validateField("password")}
              value={inputs.password}
            />
            <InputRightElement h={"full"}>
              <Button
                variant={"ghost"}
                className="login-page__eye-btn"
                onClick={() =>
                  setShowPassword((showPassword) => !showPassword)
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage className="login-page__error-msg">
            {errors?.password}
          </FormErrorMessage>
        </FormControl>

        <div className="login-page__submit-stack">
          <Button
            className="login-page__submit-btn"
            isLoading={isLoading}
            loadingText="Logging in..."
            size="lg"
            onClick={() => handleLogin()}
          >
            {t("SignIn")}
          </Button>
        </div>

        <div className="login-page__footer">
          <Text className="login-page__footer-text">
            {t("dontHaveAccount")}{" "}
            <span
              className="login-page__link"
              onClick={() => {
                if (isPopup) {
                  dispatch(closeLoginPopupAction());
                }
                router.push(`/${PageConstant.SIGNUP}`);
              }}
            >
              {t("SignUp")}
            </span>
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isPopup ? (
        cardContent
      ) : (
        <div className="login-page">
          <div className="login-page__container">{cardContent}</div>
        </div>
      )}
      <CodePopup
        isOpen={openCodeBox}
        title={t("forgotCode")}
        description={t("forgotCodeDes")}
        onClose={() => setOpenCodeBox(false)}
        onSubmit={(code) => handleSubmitCode(code)}
      />
    </>
  );
};

export default Login;
