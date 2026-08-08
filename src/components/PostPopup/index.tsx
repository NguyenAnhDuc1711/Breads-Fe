"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Portal,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { MdLock, MdPeopleAlt, MdPublic } from "react-icons/md";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NOTIFICATION_PATH, Route } from "../../Breads-Shared/APIConfig";
import { Constants } from "../../Breads-Shared/Constants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import useDebounce from "../../hooks/useDebounce";
import usePopupCancel from "../../hooks/usePopupCancel";
import Socket from "../../socket";
import { AppState } from "../../store";
import {
  defaultPostInfo,
  IPost,
  selectPost,
  selectPostReply,
  updatePostAction,
  updatePostInfo,
} from "../../store/PostSlice";
import { createPost, editPost } from "../../store/PostSlice/asyncThunk";
import { openNewPostNotify, showToast } from "../../store/UtilSlice";
import {
  addEvent,
  generateObjectId,
  handleUploadFiles,
  replaceEmojis,
} from "../../util";
import PopupCancel from "../../util/PopupCancel";
import TextArea from "../../util/TextArea";
import Post from "../ListPost/Post";
import UploadDisplay from "../Message/RightSide/Conversation/MessageBar/UploadDisplay";
import PostPopupAction from "./action";
import MediaDisplay from "./mediaDisplay";
import PostReplied from "./PostReplied";
import PostSurvey from "./survey";

const PostPopup = () => {
  const MAX_CONTENT_LENGTH = 500;
  const pathname = usePathname();
  const postId = pathname?.split("/")?.[2];
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue("cbg.light", "cbg.dark");
  const textColor = useColorModeValue("ccl.dark", "ccl.light");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const btnBg = useColorModeValue("cuse.light", "cuse.dark");
  const btnHoverBg = useColorModeValue("gray.100", "#2a2a2a");
  const btnBorder = useColorModeValue("gray.300", "gray.700");
  const menuBg = useColorModeValue("cuse.light", "cuse.dark");
  const menuBorder = useColorModeValue("gray.200", "gray.700");
  const itemHoverBg = useColorModeValue("gray.100", "#2a2a2a");
  const itemDescColor = useColorModeValue("gray.500", "gray.400");
  const iconBoxBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const checkColor = useColorModeValue("gray.800", "gray.100");

  const dispatch = useAppDispatch();
  const { postInfo, postAction, postSelected, postReply } = useAppSelector(
    (state: AppState) => state.post
  );
  const isEditing = postAction === PostConstants.ACTIONS.EDIT;
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { popupCancelInfo, setPopupCancelInfo, closePopupCancel } =
    usePopupCancel();

  const [content, setContent] = useState("");
  const [clickPost, setClickPost] = useState(false);
  const [filesData, setFilesData] = useState([]);
  const [visibility, setVisibility] = useState<number>(
    Constants.POST_VISIBILITY.PUBLIC
  );
  const debounceContent = useDebounce(content, 500);
  const init = useRef(true);
  const VISIBILITY_OPTIONS = [
    {
      value: Constants.POST_VISIBILITY.PUBLIC,
      label: t("visibilityPublic"),
      desc: t("visibilityPublicDesc"),
      icon: MdPublic,
    },
    {
      value: Constants.POST_VISIBILITY.ONLY_FOLLOWERS,
      label: t("visibilityFollowers"),
      desc: t("visibilityFollowersDesc"),
      icon: MdPeopleAlt,
    },
    {
      value: Constants.POST_VISIBILITY.ONLY_ME,
      label: t("visibilityOnlyMe"),
      desc: t("visibilityOnlyMeDesc"),
      icon: MdLock,
    },
  ];

  const selectedVisibilityOption =
    VISIBILITY_OPTIONS.find((option) => option.value === visibility) ??
    VISIBILITY_OPTIONS[0];
  const SelectedIcon = selectedVisibilityOption.icon;
  const containsLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
  };
  useEffect(() => {
    if (debounceContent !== postInfo.content) {
      dispatch(
        updatePostInfo({ ...postInfo, content: replaceEmojis(debounceContent) })
      );
    }
  }, [debounceContent, dispatch, postInfo]);

  useEffect(() => {
    if (
      isEditing &&
      postInfo?._id &&
      postInfo.content !== content &&
      init.current
    ) {
      setContent(postInfo.content);
      init.current = false;
    }
  }, [isEditing, postInfo, content]);

  const closePostAction =
    !!postInfo.media?.length ||
    postInfo.survey.length !== 0 ||
    postInfo.files.length !== 0;

  const checkUploadCondition = useCallback(() => {
    let checkResult = true;
    let msg = "";

    if (content.length > MAX_CONTENT_LENGTH) {
      checkResult = false;
      msg = t("maxcharacter");
    }

    if (postInfo.survey.length) {
      const optionsValue = postInfo.survey.map(({ value }) => value);
      const setValue = new Set(optionsValue);
      const postSurvey = postInfo.survey.filter(
        (option) => !!option.value.trim()
      );

      if ([...setValue].length < postSurvey.length) {
        checkResult = false;
        msg = t("uniquevalue");
      }
      if (
        !postInfo.survey[0].value.trim() ||
        !postInfo.survey[1].value.trim()
      ) {
        checkResult = false;
        msg = t("optnotempty");
      }
    }
    if (
      !postInfo.content.trim() &&
      postInfo.survey.length === 0 &&
      postInfo.media.length === 0 &&
      filesData?.length === 0
    ) {
      checkResult = false;
      msg = t("emptypayload");
    }

    return { checkCondition: checkResult, msg };
  }, [postInfo]);

  const handleUploadPost = async () => {
    try {
      const payload: IPost = {
        authorId: userInfo._id,
        type: postAction,
        ...postInfo,
      };
      if (payload?.files?.length) {
        const filesId = await handleUploadFiles({
          files: filesData,
          userId: userInfo?._id,
        });
        payload.files = filesId;
      }
      const socket = Socket.getInstant();
      if (isEditing) {
        dispatch(editPost(payload));
        addEvent({
          event: "edit_post",
          payload: {
            postId: payload?._id,
          },
        });
      } else {
        let notificationPayload: any = {};
        payload._id = generateObjectId();
        payload.visibility = visibility;
        if (postAction === PostConstants.ACTIONS.REPOST && !!postSelected) {
          payload.quote = {
            _id: postSelected._id,
            content: `${postSelected.authorInfo?.username}: ${postSelected.content}`,
          };
          payload.parentPost = postSelected._id;
          if (postSelected?.authorId !== userInfo?._id) {
            notificationPayload.action = Constants.NOTIFICATION_ACTION.REPOST;
            notificationPayload.toUsers = [postSelected?.authorId];
          }
          addEvent({
            event: "repost_post",
            payload: {
              postId: payload._id,
              parentPostId: postSelected._id,
            },
          });
        } else if (postAction === PostConstants.ACTIONS.REPLY) {
          // Snapshot the parent post's visibility at creation time so a
          // reply never leaks context from a non-PUBLIC thread — no
          // later re-sync if the parent's visibility changes.
          payload.visibility =
            postReply?.visibility ?? Constants.POST_VISIBILITY.PUBLIC;
          payload.parentPost = postReply?._id;
          if (!!postReply?.authorId && postReply?.authorId !== userInfo?._id) {
            notificationPayload.action = Constants.NOTIFICATION_ACTION.REPLY;
            notificationPayload.toUsers = [postReply?.authorId];
          }
          addEvent({
            event: "reply_post",
            payload: {
              postId: payload._id,
              parentPostId: postReply?._id,
            },
          });
        } else {
          addEvent({
            event: "create_post",
            payload: {
              postId: payload?._id,
            },
          });
        }
        if (payload.usersTag?.length > 0) {
          let usersId = payload.usersTag.map(({ userId }) => userId);
          usersId = new Set(usersId);
          payload.usersTag = [...usersId];
          socket.emit(Route.NOTIFICATION + NOTIFICATION_PATH.CREATE, {
            fromUser: userInfo._id,
            toUsers: [...usersId],
            action: Constants.NOTIFICATION_ACTION.TAG,
            target: payload._id,
          });
        }
        const uploadPost = await dispatch(
          createPost({ postPayload: payload, action: postAction })
        ).unwrap();
        if (!!notificationPayload?.toUsers?.length) {
          notificationPayload = {
            ...notificationPayload,
            fromUser: userInfo._id,
            target: payload._id,
          };
          socket.emit(
            Route.NOTIFICATION + NOTIFICATION_PATH.CREATE,
            notificationPayload
          );
        }
      }
    } catch (err: any) {
      console.error("err: ", err);
      dispatch(
        showToast({
          title: "Error",
          description: err.message,
          status: "error",
        })
      );
    }
  };

  const handleClose = () => {
    const { media, survey, content } = postInfo;

    if (media.length || survey.length || content.length) {
      setPopupCancelInfo({
        open: true,
        title: isEditing ? t("stopediting") : t("stopcreating"),
        content:
          t("wannastop") +
          " " +
          `${isEditing ? t("editing") : t("creating")}` +
          " " +
          t("this bread") +
          `?`,
        leftBtnText: t("cancel"),
        rightBtnText: t("Discard"),
        leftBtnAction: closePopupCancel,
        rightBtnAction: () => {
          dispatch(updatePostAction(null));
          dispatch(updatePostInfo(defaultPostInfo));
          postAction === PostConstants.ACTIONS.REPLY
            ? dispatch(selectPostReply(null))
            : postId !== postSelected?._id && dispatch(selectPost(null));
        },
      });
    } else {
      dispatch(updatePostAction(null));
      postAction === PostConstants.ACTIONS.REPLY
        ? dispatch(selectPostReply(null))
        : postId !== postSelected?._id && dispatch(selectPost(null));
    }
  };

  const handleContent = (value) => {
    if (value.length <= 500) {
      setContent(replaceEmojis(value));
    } else {
      dispatch(
        showToast({
          title: "Error",
          description: t("maxforpost"),
          status: "error",
        })
      );
    }
  };

  if (!postAction) return null;

  return (
    <>
      <Modal isOpen={true} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent
          position="relative"
          boxSizing="border-box"
          width="94%"
          maxWidth="620px"
          bg={bgColor}
          color={textColor}
          padding="24px"
          marginRight={1}
          borderRadius="16px"
          zIndex={3000}
        >
          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {postReply?._id && postAction === PostConstants.ACTIONS.REPLY && (
              <div style={{ marginBottom: "12px" }}>
                <PostReplied />
              </div>
            )}
            <Text
              position="absolute"
              top="-36px"
              left="50%"
              transform="translateX(-50%)"
              color={textColor}
              textTransform="capitalize"
              fontWeight={600}
              fontSize="18px"
            >
              {postAction + " Bread"}
            </Text>
            <Flex width={"100%"} gap={4}>
              <Avatar src={userInfo.avatar} width="40px" height="40px" />
              <Flex flexDir={"column"} flex={1} transition={"auto"}>
                <Text color={textColor} fontWeight="600" m={0}>
                  {userInfo.username}
                </Text>
                <TextArea
                  text={content}
                  setText={(value) => handleContent(value)}
                  tagUsers={true}
                  placeholder={t("whatnew")}
                />
                {!isEditing && postAction !== PostConstants.ACTIONS.REPLY && (
                  <Menu placement="bottom-start">
                    <MenuButton
                      as={Button}
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      width="fit-content"
                      mb="10px"
                      bg={btnBg}
                      borderColor={btnBorder}
                      _hover={{ bg: btnHoverBg }}
                      _active={{ bg: btnHoverBg }}
                      px={3}
                      py={1}
                      height="32px"
                    >
                      <HStack spacing={1.5} alignItems="center">
                        <SelectedIcon size={15} color={iconColor} />
                        <Text fontSize="13px" fontWeight="600" color={textColor}>
                          {selectedVisibilityOption.label}
                        </Text>
                        <ChevronDownIcon boxSize={4} color={itemDescColor} />
                      </HStack>
                    </MenuButton>
                    <Portal>
                      <MenuList
                        zIndex={3100}
                        bg={menuBg}
                        borderColor={menuBorder}
                        borderRadius="16px"
                        shadow="xl"
                        p={1.5}
                        minW="290px"
                      >
                        {VISIBILITY_OPTIONS.map((option) => {
                          const OptionIcon = option.icon;
                          const isSelected = option.value === visibility;
                          return (
                            <MenuItem
                              key={option.value}
                              onClick={() => setVisibility(option.value)}
                              borderRadius="12px"
                              py={2.5}
                              px={3}
                              my={0.5}
                              bg={menuBg}
                              _hover={{ bg: itemHoverBg }}
                              _focus={{ bg: itemHoverBg }}
                            >
                              <Flex
                                width="100%"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <HStack spacing={3} alignItems="center">
                                  <Flex
                                    w="34px"
                                    h="34px"
                                    borderRadius="10px"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg={iconBoxBg}
                                    color={iconColor}
                                    flexShrink={0}
                                  >
                                    <OptionIcon size={18} />
                                  </Flex>
                                  <VStack align="start" spacing={0}>
                                    <Text
                                      fontSize="14px"
                                      fontWeight="600"
                                      color={textColor}
                                    >
                                      {option.label}
                                    </Text>
                                    <Text
                                      fontSize="11px"
                                      color={itemDescColor}
                                      maxW="190px"
                                    >
                                      {option.desc}
                                    </Text>
                                  </VStack>
                                </HStack>
                                {isSelected && (
                                  <CheckIcon color={checkColor} boxSize={3.5} ml={2} />
                                )}
                              </Flex>
                            </MenuItem>
                          );
                        })}
                      </MenuList>
                    </Portal>
                  </Menu>
                )}
                {!containsLink(content) && (
                  <>
                    <MediaDisplay post={postInfo} />
                    {!closePostAction && (
                      <PostPopupAction setFilesData={setFilesData} />
                    )}
                    {postInfo.survey.length !== 0 && <PostSurvey />}
                    {postSelected?._id &&
                      postAction === PostConstants.ACTIONS.REPOST && (
                        <div style={{ margin: "12px 0" }}>
                          <Post post={postSelected} isParentPost={true} />
                        </div>
                      )}
                  </>
                )}
                {postInfo.files && postInfo.files?.length !== 0 && (
                  <UploadDisplay isPost={true} />
                )}
              </Flex>
            </Flex>
          </div>
          <ModalFooter padding="0">
            {content.length >= 450 && (
              <Text
                color={content.length > MAX_CONTENT_LENGTH ? "red" : textColor}
                fontSize="12px"
                mt="6px"
                mr="16px"
              >
                {MAX_CONTENT_LENGTH - content.length}
              </Text>
            )}
            <Button
              isLoading={clickPost}
              loadingText={isEditing ? "Saving" : "Posting"}
              mt="6px"
              mr="16px"
              color={textColor}
              borderRadius="6px"
              onClick={() => {
                const { checkCondition, msg } = checkUploadCondition();
                if (!checkCondition) {
                  dispatch(
                    showToast({
                      title: "Error",
                      description: msg,
                      status: "error",
                    })
                  );
                  return;
                }
                setClickPost(true);
                handleUploadPost();
              }}
              // isDisabled={content.length > MAX_CONTENT_LENGTH}
            >
              {isEditing ? t("save") : t("post")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {popupCancelInfo.open && (
        <PopupCancel popupCancelInfo={popupCancelInfo} />
      )}
    </>
  );
};

export default PostPopup;
