"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PageConstant from "../../Breads-Shared/Constants/PageConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { IUserShortInfo } from "../../store/PostSlice";
import { selectUser } from "../../store/UserSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";
import { addEvent } from "../../util";
import { handleFollow } from "../FollowBtn";
import UnFollowPopup from "../FollowBtn/UnfollowPopup";

export const UserInfoBox = ({ user }: { user: IUserShortInfo }) => {
  const dispatch = useAppDispatch();
  const [openCancelPopup, setOpenCancelPopup] = useState(false);
  const { userInfo } = useAppSelector((state: AppState) => state.user);
  const isFollowing = userInfo?.following?.includes(user?._id);
  const { colorMode } = useColorMode();

  return (
    <PopoverBody
      bg={colorMode === "dark" ? "#0a0a0a" : "#fafafa"}
      color={colorMode === "dark" ? "white" : "black"}
      borderRadius={"10px"}
    >
      <Box m={2}>
        <Flex justifyContent={"space-between"} pb={4}>
          <Box>
            <Text fontWeight="bold">{user?.username}</Text>
            <Text fontSize={"sm"}>{user?.name}</Text>
          </Box>
          <Avatar
            src={user?.avatar}
            size={"md"}
            name={user?.username}
            cursor={"pointer"}
          />
        </Flex>
        <Text fontSize={"sm"}> {user?.bio}</Text>
        <Text color={"gray.400"}>
          {user?.followersCount ?? 0} người theo dõi
        </Text>
        {user?._id !== userInfo?._id && (
          <Button
            w={"100%"}
            bg={colorMode === "dark" ? "#fafafa" : "#0a0a0a"}
            color={colorMode === "dark" ? "black" : "white"}
            mt={"8px"}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.6 }}
            transition="opacity 0.2s"
            onClick={() => {
              if (isFollowing) {
                setOpenCancelPopup(true);
              } else {
                handleFollow(userInfo, user, dispatch);
              }
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Box>
      <UnFollowPopup
        user={user}
        isOpen={openCancelPopup}
        onClose={() => setOpenCancelPopup(false)}
        onClick={() => {
          handleFollow(userInfo, user, dispatch);
          setOpenCancelPopup(false);
        }}
      />
    </PopoverBody>
  );
};

const UserInfoPopover = ({
  user,
  isParentPost,
  isDetail,
}: {
  user: IUserShortInfo;
  isParentPost?: boolean;
  isDetail?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userInfo, userSelected } = useAppSelector(
    (state: AppState) => state.user
  );
  const currentPage = useAppSelector(
    (state: AppState) => state.util.currentPage
  );
  const isFrPage: boolean = currentPage === PageConstant.FRIEND;

  const handleGoToUserPage = (): void => {
    router.push(`/users/${user._id}`);
    dispatch(
      changePage({
        nextPage:
          user?._id === userInfo?._id ? PageConstant.USER : PageConstant.FRIEND,
      })
    );
  };

  return (
    <Popover trigger="hover" placement="bottom-start">
      <PopoverTrigger>
        <Link
          as={NextLink}
          href={`/users/${user?._id}`}
          onClick={() => handleGoToUserPage()}
          onMouseEnter={() => {
            if (userSelected?._id !== user?._id && !isFrPage) {
              dispatch(selectUser(user));
              addEvent({
                event: "hover_user_popup",
                payload: {
                  userId: user?._id,
                },
              });
            }
          }}
        >
          <Text
            fontSize={"sm"}
            fontWeight={"bold"}
            cursor={"pointer"}
            _hover={{ textDecoration: "underline" }}
          >
            {user?.username}
          </Text>
        </Link>
      </PopoverTrigger>

      {((!isParentPost &&
        (isFrPage
          ? userSelected?._id !== user?._id
          : userInfo?._id !== user?._id)) ||
        isDetail) && (
        <PopoverContent
          top="-1"
          left="-7"
          transform="translateX(-50%)"
          borderRadius={"10px"}
          zIndex={10000}
        >
          <UserInfoBox
            user={user?._id === userSelected?._id ? userSelected : user}
          />
        </PopoverContent>
      )}
    </Popover>
  );
};

export default UserInfoPopover;
