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
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import CodePopup from "../components/CodePopup";
import { useAppDispatch } from "../hooks/redux";
import { signUp, validateEmailByCode } from "../store/UserSlice/asyncThunk";
import { showToast } from "../store/UtilSlice";
import "./SignUp.css";

const Signup = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [openCodePopup, setOpenCodePopup] = useState(false);
  const [errors, setErrors] = useState<any>({});
  // Fix #7: Add loading state so the button properly shows spinner
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fix #11: Properly typed refs
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validateInputs = () => {
    const validationErrors: any = {};
    const { name, username, email, password } = inputs;

    if (!name) validationErrors.name = t("addName");

    if (!username) validationErrors.username = t("loginNameRequired");

    if (!email) {
      validationErrors.email = t("emailRequired2");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = t("invalidEmail");
    }

    if (!password) {
      validationErrors.password = t("passwordRequired2");
    } else if (password.length < 6) {
      validationErrors.password = t("minPassWarning");
    }

    return validationErrors;
  };

  // Fix #2: Removed dead handleValidateCode function (empty body, never called)

  const handleSignup = async () => {
    const validationErrors = validateInputs();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Fix #7: Set loading state around API call
    setIsLoading(true);
    try {
      const result = await dispatch(signUp(inputs));

      if (result?.meta?.requestStatus === "fulfilled") {
        setOpenCodePopup(true);
      } else {
        const { errorType, error } = result.payload;

        if (errorType === "USERNAME_EXISTS") {
          dispatch(
            showToast({
              title: "Error",
              description: t("usernameexsists"),
              status: "error",
            }),
          );
        }
        if (errorType === "EMAIL_EXISTS") {
          dispatch(
            showToast({
              title: "Error",
              description: t("emailexsists"),
              status: "error",
            }),
          );
        }
      }
    } catch (error: any) {
      console.error("Error in handleSignup:", error.message);
      dispatch(
        showToast({
          title: "Error",
          description: error.message || t("signupfail"),
          status: "error",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateEmail = async (code: string) => {
    try {
      const result = await dispatch(
        validateEmailByCode({
          email: inputs.email,
          code,
        }),
      );
      if (result?.meta?.requestStatus === "fulfilled") {
        dispatch(
          showToast({
            title: "Success",
            description: t("signupsuccess"),
            status: "success",
          }),
        );
        setTimeout(() => {
          // Fix #1: Route to /login not /auth/login
          router.push(`/${PageConstant.LOGIN}`);
        }, 500);
      } else {
        const { errorType, error } = result.payload;
        if (errorType === "INCORRECT_CODE") {
          dispatch(
            showToast({
              title: "Error",
              description: error,
              status: "error",
            }),
          );
        }
        if (errorType === "EXPIRED_CODE") {
          dispatch(
            showToast({
              title: "Error",
              description: error,
              status: "error",
            }),
          );
        }
      }
    } catch (err) {
      console.error("handleValidateEmail err: ", err);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextField?: React.RefObject<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextField?.current?.focus();
    }
  };

  const handleBlur = (field: string) => {
    if (!inputs[field]) {
      let errMsg = "";
      switch (field) {
        case "username":
          errMsg = t("loginNameRequired");
          break;
        case "name":
          errMsg = t("nameRequired");
          break;
        case "email":
          errMsg = t("emailRequired2");
          break;
        default:
          errMsg = t("passwordRequired2");
          break;
      }
      setErrors((prev) => ({
        ...prev,
        [field]: errMsg,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password") {
      const passwordErrors = validateInputs();
      setErrors((prev) => ({
        ...prev,
        password: passwordErrors.password || "",
      }));
    }
  };

  // Fix #6: Validate password against the new value directly (not stale state)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setInputs((prev) => ({ ...prev, password: newPassword }));

    // Validate against newPassword directly — avoids stale state issue
    if (newPassword.length > 0 && newPassword.length < 6) {
      setErrors((prev) => ({ ...prev, password: t("minPassWarning") }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-page__container">
        <div className="signup-page__card">
          <div className="signup-page__header">
            <Heading className="signup-page__heading">{t("SignUp")}</Heading>
            <Text className="signup-page__subtitle">
              Join Breads — share your thoughts
            </Text>
          </div>

          <div className="signup-page__form-stack">
            <div className="signup-page__name-row">
              <div className="signup-page__name-field">
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel className="signup-page__label">
                    {t("fullName")}
                  </FormLabel>
                  <Input
                    className="signup-page__input"
                    type="text"
                    placeholder="John Doe"
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                    value={inputs.name}
                    onKeyDown={(e) => handleKeyDown(e, usernameRef)}
                    onBlur={() => handleBlur("name")}
                  />
                  <FormErrorMessage className="signup-page__error-msg">
                    {errors.name}
                  </FormErrorMessage>
                </FormControl>
              </div>
              <div className="signup-page__name-field">
                <FormControl isRequired isInvalid={!!errors.username}>
                  <FormLabel className="signup-page__label">
                    {t("loginName")}
                  </FormLabel>
                  <Input
                    ref={usernameRef}
                    className="signup-page__input"
                    type="text"
                    placeholder="@username"
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                    value={inputs.username}
                    onKeyDown={(e) => handleKeyDown(e, emailRef)}
                    onBlur={() => handleBlur("username")}
                  />
                  <FormErrorMessage className="signup-page__error-msg">
                    {errors.username}
                  </FormErrorMessage>
                </FormControl>
              </div>
            </div>

            <FormControl id="email" isRequired isInvalid={!!errors.email}>
              <FormLabel className="signup-page__label">{t("email")}</FormLabel>
              <Input
                ref={emailRef}
                className="signup-page__input"
                type="email"
                placeholder="name@example.com"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                onBlur={() => handleBlur("email")}
              />
              <FormErrorMessage className="signup-page__error-msg">
                {errors.email}
              </FormErrorMessage>
            </FormControl>

            <FormControl id="password" isRequired isInvalid={!!errors.password}>
              <FormLabel className="signup-page__label">
                {t("password")}
              </FormLabel>
              <InputGroup>
                <Input
                  ref={passwordRef}
                  className="signup-page__input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  onChange={handlePasswordChange}
                  value={inputs.password}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onBlur={() => handleBlur("password")}
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    className="signup-page__eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
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
              <FormErrorMessage className="signup-page__error-msg">
                {errors.password}
              </FormErrorMessage>
            </FormControl>

            <div className="signup-page__submit-stack">
              <Button
                className="signup-page__submit-btn"
                isLoading={isLoading}
                loadingText="Creating account..."
                size="lg"
                onClick={() => handleSignup()}
              >
                {t("SignUp")}
              </Button>
            </div>

            <div className="signup-page__footer">
              <Text className="signup-page__footer-text">
                {t("hadAccount")}{" "}
                <span
                  className="signup-page__link"
                  onClick={() => router.push(`/${PageConstant.LOGIN}`)}
                >
                  {t("SignIn")}
                </span>
              </Text>
            </div>
          </div>
        </div>
      </div>
      <CodePopup
        isOpen={openCodePopup}
        title="Validate Your Email"
        description="Using the code sent into your email to create your new account"
        onClose={() => setOpenCodePopup(false)}
        onSubmit={(code) => handleValidateEmail(code)}
      />
    </div>
  );
};

export default Signup;
