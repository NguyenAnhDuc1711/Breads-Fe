import { Avatar, AvatarBadge, Box, Flex, Text } from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiSolidShare } from "react-icons/bi";
import { BsThreads } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { FaRepeat, FaUser } from "react-icons/fa6";
import { IoImageOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { Constants } from "../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import FollowBtn from "./FollowBtn";
import { updateHasNotification } from "../store/NotificationSlice";

const Activity = ({ currentPage }: { currentPage: string }) => {
  const dispatch = useAppDispatch();
  const navigate = useRouter().push;
  const { t } = useTranslation();
  const notifications = useAppSelector(
    (state: AppState) => state.notification.notifications
  );
  const [uniqueNotifications, setUniqueNotifications] = useState<any>([]);

  useEffect(() => {
    const seen = new Set();
    const unique = notifications.filter((notification) => {
      if (!seen.has(notification._id)) {
        seen.add(notification._id);
        return true;
      }
      return false;
    });
    setUniqueNotifications(unique);
  }, [notifications]);

  const { LIKE, FOLLOW, REPLY, REPOST, TAG } = Constants.NOTIFICATION_ACTION;
  const actionList = [
    {
      name: LIKE,
      icon: <FaHeart color="white" size={12} />,
      color: "red.600",
      actionText: t("liked"),
    },
    {
      name: FOLLOW,
      icon: <FaUser color="white" size={12} />,
      color: "purple.500",
      actionText: t("followed"),
    },
    {
      name: REPLY,
      icon: <BiSolidShare color="white" size={12} />,
      color: "blue.500",
      actionText: t("replied"),
    },
    {
      name: REPOST,
      icon: <FaRepeat color="white" size={12} />,
      color: "#c329bf",
      actionText: t("reposted"),
    },
    {
      name: TAG,
      icon: <BsThreads color="white" size={12} />,
      color: "green.500",
      actionText: t("tagged"),
    },
  ];

  const filteredNotifications = (() => {
    switch (currentPage) {
      case "follows":
        return uniqueNotifications.filter((item) => item.action === FOLLOW);
      case "likes":
        return uniqueNotifications.filter((item) => item.action === LIKE);
      case "reposts":
        return uniqueNotifications.filter((item) => item.action === REPOST);
      case "replies":
        return uniqueNotifications.filter((item) => item.action === REPLY);
      case "tags":
        return uniqueNotifications.filter((item) => item.action === TAG);
      default:
        return uniqueNotifications;
    }
  })();
  const comeToPost = (postId) => {
    navigate(`/posts/${postId}`);
  };
  const comeToUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <>
      {filteredNotifications.map((item) => {
        const actionDetails = actionList.find(
          (action) => action.name === item.action
        );
        return (
          <Flex
            key={item._id}
            w="full"
            alignItems="center"
            justifyContent="space-between"
            bg="#202020"
            p={3}
            borderRadius="10px"
            my={2}
            onClick={() => dispatch(updateHasNotification(false))}
          >
            {item.action !== FOLLOW ? (
              <Flex alignItems="center">
                <Avatar mr={4} src={item.FromUserDetails?.avatar}>
                  <AvatarBadge
                    boxSize="1.4em"
                    bg={actionDetails?.color}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {actionDetails?.icon}
                  </AvatarBadge>
                </Avatar>
                <Flex direction="column" wrap="wrap">
                  <Box display="flex">
                    <Text
                      fontWeight="bold"
                      mr={2}
                      fontSize={"sm"}
                      onClick={() => comeToUser(item.fromUser)}
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {item.FromUserDetails?.username || "Unknown User"}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      {item.createdAt
                        ? moment(new Date(item.createdAt)).fromNow()
                        : "Unknown time"}
                    </Text>
                  </Box>
                  <Text
                    color="white"
                    fontSize="sm"
                    onClick={() => comeToPost(item.target)}
                    cursor="pointer"
                  >
                    {item.postDetails?.content ? (
                      item.postDetails.content
                    ) : (
                      <IoImageOutline />
                    )}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Flex
                alignItems="center"
                justifyContent="space-between"
                w="full"
                onClick={() => dispatch(updateHasNotification(false))}
              >
                <Flex alignItems="center">
                  <Avatar mr={4} src={item.FromUserDetails?.avatar}>
                    <AvatarBadge
                      boxSize="1.4em"
                      bg={actionDetails?.color}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {actionDetails?.icon}
                    </AvatarBadge>
                  </Avatar>
                  <Flex direction="column">
                    <Box display="flex" justifyContent="space-between">
                      <Text
                        fontWeight="bold"
                        mr={2}
                        fontSize={"sm"}
                        onClick={() => comeToUser(item.fromUser)}
                        cursor={"pointer"}
                        _hover={{ textDecoration: "underline" }}
                      >
                        {item.FromUserDetails?.username || "Unknown User"}
                      </Text>
                      <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
                        {item.createdAt
                          ? moment(new Date(item.createdAt)).fromNow()
                          : "Unknown time"}
                      </Text>
                    </Box>

                    {item.name !== FOLLOW && (
                      <Text color="gray.600" fontSize="sm">
                        {actionDetails?.actionText}
                      </Text>
                    )}
                  </Flex>
                </Flex>

                <Flex alignItems="center" justifyContent="flex-end" w="full">
                  <FollowBtn user={item.FromUserDetails} />
                </Flex>
              </Flex>
            )}
          </Flex>
        );
      })}
    </>
  );
};

export default Activity;
