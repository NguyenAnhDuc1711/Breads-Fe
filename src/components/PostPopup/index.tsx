"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdLock, MdPeopleAlt, MdPublic } from "react-icons/md";
import { CheckIcon, ChevronDownIcon } from "../../assests/chakraIcons";
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
import { showToast } from "../../store/UtilSlice";
import { GA_EVENTS, sendGaEvent } from "../../util/gtmEvents";
import {
  addEvent,
  generateObjectId,
  handleUploadFiles,
  replaceEmojis,
  uploadMediaToCloudinary,
} from "../../util";
import PopupCancel from "../../util/PopupCancel";
import TextArea from "../../util/TextArea";
import Post from "../ListPost/Post";
import UploadDisplay from "../Message/RightSide/Conversation/MessageBar/UploadDisplay";
import OptimizedAvatar from "../OptimizedAvatar";
import {
  Button,
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
  useColorModeValue,
  VStack,
} from "../ui/primitives";
import PostPopupAction from "./action";
import MediaDisplay from "./mediaDisplay";
import PostReplied from "./PostReplied";
import PostSurvey from "./survey";
import "./index.css";

const PostPopup = () => {
  const MAX_CONTENT_LENGTH = 500;
  const pathname = usePathname();
  const postId = pathname?.split("/")?.[2];
  const { t } = useTranslation();
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const itemDescColor = useColorModeValue("gray.500", "gray.400");
  const checkColor = useColorModeValue("gray.800", "gray.100");

  const dispatch = useAppDispatch();
  const { postInfo, postAction, postSelected, postReply } = useAppSelector(
    (state: AppState) => state.post,
  );
  const isEditing = postAction === PostConstants.ACTIONS.EDIT;
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { popupCancelInfo, setPopupCancelInfo, closePopupCancel } =
    usePopupCancel();

  const [content, setContent] = useState("");
  const [clickPost, setClickPost] = useState(false);
  const [filesData, setFilesData] = useState([]);
  const [visibility, setVisibility] = useState<number>(
    Constants.POST_VISIBILITY.PUBLIC,
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
        updatePostInfo({
          ...postInfo,
          content: replaceEmojis(debounceContent),
        }),
      );
    }
  }, [debounceContent, dispatch, postInfo]);

  const initialStateRef = useRef<{
    content: string;
    visibility: number;
    mediaCount: number;
    surveyCount: number;
    filesCount: number;
  } | null>(null);

  useEffect(() => {
    if (isEditing && postInfo?._id && init.current) {
      const initialContent = postInfo.content || "";
      const initialVis =
        postInfo.visibility ?? Constants.POST_VISIBILITY.PUBLIC;
      setContent(initialContent);
      setVisibility(initialVis);
      initialStateRef.current = {
        content: initialContent,
        visibility: initialVis,
        mediaCount: postInfo.media?.length || 0,
        surveyCount: postInfo.survey?.length || 0,
        filesCount: postInfo.files?.length || 0,
      };
      init.current = false;
    } else if (!isEditing && postAction && init.current) {
      setContent("");
      setVisibility(Constants.POST_VISIBILITY.PUBLIC);
      initialStateRef.current = {
        content: "",
        visibility: Constants.POST_VISIBILITY.PUBLIC,
        mediaCount: 0,
        surveyCount: 0,
        filesCount: 0,
      };
      init.current = false;
    }
  }, [isEditing, postAction, postInfo]);

  const closePostAction =
    !!postInfo.media?.length ||
    postInfo.survey.length !== 0 ||
    postInfo.files.length !== 0;

  const resetAndClose = useCallback(() => {
    init.current = true;
    initialStateRef.current = null;
    setContent("");
    dispatch(updatePostAction(null));
    dispatch(updatePostInfo(defaultPostInfo));
    postAction === PostConstants.ACTIONS.REPLY
      ? dispatch(selectPostReply(null))
      : postId !== postSelected?._id && dispatch(selectPost(null));
  }, [dispatch, postAction, postId, postSelected]);

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
        (option) => !!option.value.trim(),
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
      if (payload?.media?.length) {
        payload.media = await uploadMediaToCloudinary({
          media: payload.media,
          entityType: "post",
        });
      }
      const socket = Socket.getInstant();
      payload.visibility = visibility;
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
          createPost({ postPayload: payload, action: postAction }),
        ).unwrap();
        if (postAction === PostConstants.ACTIONS.REPLY) {
          sendGaEvent({
            event: GA_EVENTS.COMMENT_POST,
            params: { post_id: postReply?._id },
          });
        }
        if (!!notificationPayload?.toUsers?.length) {
          notificationPayload = {
            ...notificationPayload,
            fromUser: userInfo._id,
            target: payload._id,
          };
          socket.emit(
            Route.NOTIFICATION + NOTIFICATION_PATH.CREATE,
            notificationPayload,
          );
        }
      }
      resetAndClose();
    } catch (err: any) {
      console.error("err: ", err);
      dispatch(
        showToast({
          title: "Error",
          description: err.message,
          status: "error",
        }),
      );
    }
  };

  const handleClose = () => {
    let isDirty = false;

    if (isEditing && initialStateRef.current) {
      const initial = initialStateRef.current;
      const currentContent = content.trim();
      const initialContent = initial.content.trim();

      const contentChanged = currentContent !== initialContent;
      const visChanged = visibility !== initial.visibility;
      const mediaChanged =
        (postInfo.media?.length || 0) !== initial.mediaCount;
      const surveyChanged =
        (postInfo.survey?.length || 0) !== initial.surveyCount;
      const filesChanged =
        (postInfo.files?.length || 0) !== initial.filesCount;

      isDirty =
        contentChanged ||
        visChanged ||
        mediaChanged ||
        surveyChanged ||
        filesChanged;
    } else if (!isEditing) {
      isDirty = !!(
        content.trim().length ||
        postInfo.media?.length ||
        postInfo.survey?.length ||
        postInfo.files?.length
      );
    }

    if (isDirty) {
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
          closePopupCancel();
          resetAndClose();
        },
      });
    } else {
      resetAndClose();
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
        }),
      );
    }
  };

  if (!postAction) return null;

  return (
    <>
      <Modal isOpen={true} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent
          className="post-popup__modal"
          style={{ width: "94%", maxWidth: "620px" }}
        >
          <div className="post-popup__scroll">
            {postReply?._id && postAction === PostConstants.ACTIONS.REPLY && (
              <div className="post-popup__reply-wrap">
                <PostReplied />
              </div>
            )}
            <Text className="post-popup__title">{postAction + " Bread"}</Text>
            <div className="post-popup__body">
              <OptimizedAvatar
                src={userInfo.avatar}
                width="40px"
                height="40px"
              />
              <div className="post-popup__author-col">
                <Text className="post-popup__username">
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
                    <MenuButton className="post-popup__visibility-trigger">
                      <HStack spacing={1.5} alignItems="center">
                        <SelectedIcon size={15} color={iconColor} />
                        <Text className="post-popup__visibility-label">
                          {selectedVisibilityOption.label}
                        </Text>
                        <ChevronDownIcon boxSize={4} color={itemDescColor} />
                      </HStack>
                    </MenuButton>
                    <Portal>
                      <MenuList
                        className="post-popup__visibility-list"
                        zIndex={3100}
                      >
                        {VISIBILITY_OPTIONS.map((option) => {
                          const OptionIcon = option.icon;
                          const isSelected = option.value === visibility;
                          return (
                            <MenuItem
                              key={option.value}
                              className="post-popup__visibility-item"
                              onClick={() => setVisibility(option.value)}
                            >
                              <div className="post-popup__visibility-row">
                                <HStack spacing={3} alignItems="center">
                                  <div className="post-popup__visibility-icon-box">
                                    <OptionIcon size={18} />
                                  </div>
                                  <VStack align="start" spacing={0}>
                                    <Text className="post-popup__visibility-option-label">
                                      {option.label}
                                    </Text>
                                    <Text className="post-popup__visibility-option-desc">
                                      {option.desc}
                                    </Text>
                                  </VStack>
                                </HStack>
                                {isSelected && (
                                  <CheckIcon
                                    className="post-popup__visibility-check"
                                    color={checkColor}
                                  />
                                )}
                              </div>
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
                        <div className="post-popup__quote-wrap">
                          <Post post={postSelected} isParentPost={true} />
                        </div>
                      )}
                  </>
                )}
                {postInfo.files && postInfo.files?.length !== 0 && (
                  <UploadDisplay isPost={true} />
                )}
              </div>
            </div>
          </div>
          <ModalFooter className="post-popup__footer">
            {content.length >= 450 && (
              <Text
                className={`post-popup__count${
                  content.length > MAX_CONTENT_LENGTH
                    ? " post-popup__count--over"
                    : ""
                }`}
              >
                {MAX_CONTENT_LENGTH - content.length}
              </Text>
            )}
            <Button
              className="post-popup__submit-btn"
              isLoading={clickPost}
              loadingText={isEditing ? "Saving" : "Posting"}
              onClick={() => {
                const { checkCondition, msg } = checkUploadCondition();
                if (!checkCondition) {
                  dispatch(
                    showToast({
                      title: "Error",
                      description: msg,
                      status: "error",
                    }),
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
