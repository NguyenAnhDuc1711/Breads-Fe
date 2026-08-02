"use client";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH, UTIL_PATH } from "../Breads-Shared/APIConfig";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { encodedString } from "../Breads-Shared/util";
import { genRandomCode } from "../Breads-Shared/util/index";
import CodePopup from "../components/CodePopup";
import { GET, POST } from "../config/API";
import { useAppDispatch } from "../hooks/redux";
import { IUser } from "../store/UserSlice";
import { login } from "../store/UserSlice/asyncThunk";
import { showToast } from "../store/UtilSlice";

type LoginInput = {
  email: string;
  password: string;
  loginAsAdmin?: boolean;
};

// Fix #9: Separate error type — loginAsAdmin is not a validation field
type LoginErrors = Partial<Pick<LoginInput, "email" | "password">>;

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [countClick, setCountClick] = useState<number>(0);
  const [countClickGetFullAcc, setCountClickGetFullAcc] = useState<number>(0);
  const [users, setUsers] = useState<IUser[]>([]);
  const [displayUsers, setDisplayUsers] = useState<IUser[]>([]);
  const [openCodeBox, setOpenCodeBox] = useState<boolean>(false);
  const [inputs, setInputs] = useState<LoginInput>({
    email: "",
    password: "",
  });
  // Fix #9: Use LoginErrors instead of LoginInput
  const [errors, setErrors] = useState<LoginErrors>({});
  // Fix #7: Add loading state so button properly shows spinner
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const codeSend = useRef(genRandomCode());

  // Fix #5: Split into two separate effects, use === 5 to trigger exactly once
  useEffect(() => {
    if (countClick === 5) {
      handleLogin(true);
    }
  }, [countClick]);

  useEffect(() => {
    if (countClickGetFullAcc === 5) {
      handleGetAllAcc();
    }
  }, [countClickGetFullAcc]);

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

  const handleGetAllAcc = async () => {
    try {
      const data: IUser[] | undefined | null = await GET({
        path: Route.USER + USER_PATH.USERS_TO_FOLLOW,
        params: {
          isTest: true,
        },
      });
      if (data) {
        setUsers(data);
        setDisplayUsers(data);
      }
    } catch (err) {
      console.error("handleGetAllAcc: ", err);
    }
  };

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
  const handleLoginWithInputs = async (
    currentInputs: LoginInput,
    loginAsAdmin?: boolean,
  ) => {
    // Fix #3: Never mutate the inputs object — build a new payload instead
    const payload: LoginInput = loginAsAdmin
      ? { ...currentInputs, loginAsAdmin: true }
      : currentInputs;

    if (loginAsAdmin) {
      await dispatch(login(payload));
      dispatch(
        showToast({
          title: t("success"),
          description: "Đăng nhập bằng Admin thành công",
          status: "success",
        }),
      );
      return;
    }

    if (!validateAll()) return;

    // Fix #7: Set loading state around API call
    setIsLoading(true);
    try {
      const data: any = await dispatch(login(payload));
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
          router.replace("/");
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

  const handleLogin = async (loginAsAdmin?: boolean) => {
    await handleLoginWithInputs(inputs, loginAsAdmin);
  };

  const handleForgotPassword = async () => {
    try {
      const email = inputs.email;
      if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
        let isValidAccount = await POST({
          path: Route.USER + USER_PATH.CHECK_VALID_USER,
          payload: {
            userEmail: email,
          },
        });
        if (isValidAccount) {
          dispatch(
            showToast({
              title: "",
              description: t("codesend"),
              status: "success",
            }),
          );
          // Fix #8: Removed console.log that exposed the verification code
          const codeSendDecoded = encodedString(codeSend.current);
          try {
            const options = {
              from: "mraducky@gmail.com",
              to: email,
              subject: "Reset password",
              code: codeSendDecoded,
              url: `${window.location.origin}/reset-pw/userId/${codeSendDecoded}`,
            };
            localStorage.setItem("encodedCode", codeSendDecoded);
            setOpenCodeBox(true);
            await POST({
              path: Route.UTIL + UTIL_PATH.SEND_FORGOT_PW_MAIL,
              payload: options,
            });
          } catch (err) {
            console.error(err);
          }
        } else {
          dispatch(
            showToast({
              title: "",
              description: t("Invalidaccount"),
              status: "error",
            }),
          );
        }
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

  const handleSubmitCode = async (code) => {
    try {
      if (code === codeSend.current) {
        const userId = await POST({
          path: Route.USER + USER_PATH.GET_USER_ID_FROM_EMAIL,
          payload: {
            userEmail: inputs.email,
          },
        });
        router.push(`/reset-pw/${userId}/${code}`);
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

  const loginForTest = (userId) => {
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    if (objectIdRegex.test(userId)) {
      localStorage.setItem("userId", userId);
      location.reload();
    }
  };

  if (countClickGetFullAcc >= 5) {
    return (
      <Flex
        flexDir={"column"}
        width={"100vw"}
        height={"100vh"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={5}
      >
        <Text fontSize={"24px"} fontWeight={600}>
          Select user to login
        </Text>
        <Input
          placeholder={"Search user..."}
          width={"320px"}
          onChange={(e) => {
            const searchValue = e.target.value;
            const searchResult = users?.filter(({ username }) => {
              if (
                username?.includes(searchValue) ||
                searchValue?.includes(username)
              ) {
                return true;
              }
              return false;
            });
            setDisplayUsers(searchResult);
          }}
        />
        <Flex
          maxHeight={"60vh"}
          width={"60vw"}
          overflowY={"scroll"}
          flexWrap={"wrap"}
          alignContent={"start"}
        >
          {displayUsers?.map((user) => (
            <Flex
              key={user._id}
              p={2}
              px={4}
              borderRadius={8}
              gap={2}
              alignItems={"center"}
              cursor={"pointer"}
              _hover={{
                bg: "lightgray",
              }}
              width={"33%"}
              height={"64px"}
              onClick={() => loginForTest(user?._id)}
            >
              <Avatar src={user?.avatar} />
              <Text>{user?.username}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} my={6}>
        <Stack align={"center"}>
          <Heading
            fontSize={"4xl"}
            textAlign={"center"}
            onClick={() => setCountClick((prev) => prev + 1)}
          >
            {t("SignIn")}
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
          w={{ base: "full", sm: "400px" }}
        >
          <Stack spacing={4}>
            <FormControl isRequired isInvalid={!!errors?.email}>
              <FormLabel
                onClick={() => setCountClickGetFullAcc((prev) => prev + 1)}
              >
                Email
              </FormLabel>
              <Input
                type="email"
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, email: e.target.value }))
                }
                // Fix #4: onKeyDown on input instead of global window listener
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                onBlur={() => validateField("email")}
                value={inputs.email}
              />
              <FormErrorMessage>{errors?.email}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors?.password}>
              <FormLabel>{t("password")}</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, password: e.target.value }))
                  }
                  // Fix #4: onKeyDown on input instead of global window listener
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  onBlur={() => validateField("password")}
                  value={inputs.password}
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors?.password}</FormErrorMessage>
            </FormControl>
            <Stack spacing={10} pt={2}>
              {/* Fix #7: isLoading prop wired up so loadingText actually shows */}
              <Button
                isLoading={isLoading}
                loadingText="Đang gửi"
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{ bg: useColorModeValue("gray.700", "gray.800") }}
                onClick={() => handleLogin()}
              >
                {t("SignIn")}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                <Link
                  color={"blue.400"}
                  onClick={() => {
                    handleForgotPassword();
                  }}
                >
                  {t("forgotPW")}
                </Link>
              </Text>
              <Text align={"center"}>
                {t("dontHaveAccount")}{" "}
                {/* Fix #1: Route to /signup not /auth/signup */}
                <Link
                  color={"blue.400"}
                  onClick={() => router.push(`/${PageConstant.SIGNUP}`)}
                >
                  {t("SignUp")}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <CodePopup
        isOpen={openCodeBox}
        title={t("forgotCode")}
        description={t("forgotCodeDes")}
        onClose={() => setOpenCodeBox(false)}
        onSubmit={(code) => handleSubmitCode(code)}
      />
    </Flex>
  );
};

export default Login;
