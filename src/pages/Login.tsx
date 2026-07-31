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
import { useEffect, useRef, useState } from "react";
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
  const [errors, setErrors] = useState<LoginInput>();
  const codeSend = useRef(genRandomCode());

  useEffect(() => {
    if (countClick >= 5) {
      handleLogin(true);
    }
    if (countClickGetFullAcc >= 5) {
      handleGetAllAcc();
    }
  }, [countClick, countClickGetFullAcc]);

  useEffect(() => {
    const enterListener = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    };
    window.addEventListener("keydown", enterListener);
    return () => window.removeEventListener("keydown", enterListener);
  }, [inputs]);

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

  const validateField = (fieldName: string) => {
    const newErrors: any = { ...errors };
    const { email, password } = inputs;

    if (fieldName === "email") {
      if (!email) {
        newErrors.email = t("emailRequired");
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = t("invalidEmail");
      } else {
        delete newErrors.email;
      }
    }

    if (fieldName === "password") {
      if (!password) {
        newErrors.password = t("passwordRequired");
      } else if (password.length < 6) {
        newErrors.password = t("incorrectPassword");
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (loginAsAdmin?: boolean) => {
    let payload = inputs;
    if (loginAsAdmin) {
      payload.loginAsAdmin = true;
      await dispatch(login(payload));
      dispatch(
        showToast({
          title: t("success"),
          description: "Đăng nhập bằng Admin thành công",
          status: "success",
        })
      );
      return;
    }
    if (!validateField("email") || !validateField("password")) {
      return;
    }
    try {
      const data: any = await dispatch(login(payload));
      if (data?.meta?.requestStatus === "fulfilled") {
        if (data?.payload?.error) {
          dispatch(
            showToast({
              title: "Không thành công!",
              description: data?.payload?.error,
              status: "error",
            })
          );
        } else {
          dispatch(
            showToast({
              title: t("success"),
              description: t("loginsuccess"),
              status: "success",
            })
          );
        }
      }
    } catch (error: any) {
      dispatch(
        showToast({
          title: "Không thành công!",
          description: error?.error || t("checkagain"),
          status: "error",
        })
      );
    }
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
            })
          );
          console.log("code: ", codeSend.current);
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
            })
          );
        }
      } else {
        dispatch(
          showToast({
            title: "",
            description: t("Invalidemail"),
            status: "error",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          title: "Error",
          description: "Server error",
          status: "error",
        })
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
          })
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
          // flexDir={"column"}
          maxHeight={"60vh"}
          width={"60vw"}
          overflowY={"scroll"}
          flexWrap={"wrap"}
          alignContent={"start"}
        >
          {displayUsers?.map((user) => (
            <Flex
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
              <Button
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
                <Link
                  color={"blue.400"}
                  onClick={() => router.push(`/${PageConstant.AUTH}/${PageConstant.SIGNUP}`)}
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
