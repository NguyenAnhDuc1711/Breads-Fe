"use client";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import CodePopup from "../components/CodePopup";
import { useAppDispatch } from "../hooks/redux";
import { signUp, validateEmailByCode } from "../store/UserSlice/asyncThunk";
import { showToast } from "../store/UtilSlice";

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

  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

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
    // else if (!/[A-Z]/.test(password)) {
    //   validationErrors.password =
    //     "Mật khẩu phải chứa ít nhất một chữ cái viết hoa!";
    // } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   validationErrors.password =
    //     "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!";
    // }

    return validationErrors;
  };

  const handleValidateCode = async () => {
    try {
    } catch (err) {
      console.error("handleValidateCode err: ", err);
    }
  };

  const handleSignup = async () => {
    const validationErrors = validateInputs();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const result = await dispatch(signUp(inputs));

      if (result?.meta?.requestStatus === "fulfilled") {
        setOpenCodePopup(true);
        // showToast("Success", t("signupsuccess"), "success");
        // setTimeout(() => {
        //   dispatch(
        //     changePage({
        //       nextPage: PageConstant.LOGIN,
        //       currentPage: PageConstant.SIGNUP,
        //     })
        //   );
        // }, 500)
      } else {
        const { errorType, error } = result.payload;

        // Set specific errors based on errorType
        if (errorType === "USERNAME_EXISTS") {
          dispatch(
            showToast({
              title: "Error",
              description: t("usernameexsists"),
              status: "error",
            })
          );
        }
        if (errorType === "EMAIL_EXISTS") {
          dispatch(
            showToast({
              title: "Error",
              description: t("emailexsists"),
              status: "error",
            })
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
        })
      );
    }
  };

  const handleValidateEmail = async (code: string) => {
    try {
      const result = await dispatch(
        validateEmailByCode({
          email: inputs.email,
          code,
        })
      );
      if (result?.meta?.requestStatus === "fulfilled") {
        dispatch(
          showToast({
            title: "Success",
            description: t("signupsuccess"),
            status: "success",
          })
        );
        setTimeout(() => {
          router.push(`/${PageConstant.AUTH}/${PageConstant.LOGIN}`);
        }, 500);
      } else {
        const { errorType, error } = result.payload;
        if (errorType === "INCORRECT_CODE") {
          dispatch(
            showToast({
              title: "Error",
              description: error,
              status: "error",
            })
          );
        }
        if (errorType === "EXPIRED_CODE") {
          dispatch(
            showToast({
              title: "Error",
              description: error,
              status: "error",
            })
          );
        }
      }
    } catch (err) {
      console.error("handleValidateEmail err: ", err);
    }
  };

  const handleKeyDown = (e, nextField?: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextField?.current?.focus();
    }
  };

  const handleBlur = (field) => {
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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setInputs({ ...inputs, password: newPassword });

    const validationErrors = validateInputs();
    setErrors(validationErrors);
  };

  return (
    <Flex align={"center"} justify={"center"} height="100vh">
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            {t("SignUp")}
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <HStack spacing={4}>
              <Box flex="1">
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel>{t("fullName")}</FormLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                    value={inputs.name}
                    onKeyDown={(e) => handleKeyDown(e, usernameRef)}
                    onBlur={() => handleBlur("name")}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
              </Box>
              <Box flex="1">
                <FormControl isRequired isInvalid={!!errors.username}>
                  <FormLabel>{t("loginName")}</FormLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                    value={inputs.username}
                    onKeyDown={(e) => handleKeyDown(e, emailRef)}
                    onBlur={() => handleBlur("username")}
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>
              </Box>
            </HStack>
            <FormControl id="email" isRequired isInvalid={!!errors.email}>
              <FormLabel>{t("email")}</FormLabel>
              <Input
                type="email"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                onBlur={() => handleBlur("email")}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl id="password" isRequired isInvalid={!!errors.password}>
              <FormLabel>{t("password")}</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordChange}
                  value={inputs.password}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onBlur={() => handleBlur("password")}
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{ bg: useColorModeValue("gray.700", "gray.800") }}
                onClick={() => handleSignup()}
              >
                {t("SignUp")}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                {t("hadAccount")}{" "}
                <Link
                  color={"blue.400"}
                  onClick={() => router.push(`/${PageConstant.AUTH}/${PageConstant.LOGIN}`)}
                >
                  {t("SignIn")}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <CodePopup
        isOpen={openCodePopup}
        title="Validate Your Email"
        description="Using the code sent into your email to create your new account"
        onClose={() => setOpenCodePopup(false)}
        onSubmit={(code) => handleValidateEmail(code)}
      />
    </Flex>
  );
};

export default Signup;
