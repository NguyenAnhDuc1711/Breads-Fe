import {
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { updatePostAction } from "../store/PostSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";

const CreatePostBar = () => {
  const { t } = useTranslation();
  const bgColor = useColorModeValue("cuse.light", "cuse.dark");
  const textColor = useColorModeValue("ccl.light", "ccl.dark");
  const dispatch = useAppDispatch();
  const navigate = useRouter().push;
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);

  const handleOpenPostPopup = () => {
    addEvent({
      event: "click_create_post_bar",
      payload: {},
    });
    dispatch(updatePostAction(PostConstants.ACTIONS.CREATE));
  };

  return (
    <Card padding={"16px 20px"} borderRadius={"12px"} mb={"12px"} bg={bgColor}>
      <Flex gap={"12px"} alignItems={"center"}>
        <a
          href={`/users/${userInfo._id}`}
          onClick={(e) => {
            e.preventDefault();
            dispatch(changePage({ nextPage: PageConstant.USER }));
            navigate(`/users/${userInfo._id}`);
          }}
        >
          <Avatar src={userInfo?.avatar} />
        </a>
        <Input
          placeholder={t("whatnew")}
          padding={"12px"}
          border={"none"}
          defaultValue={""}
          onChange={(e) => {}}
          onClick={() => handleOpenPostPopup()}
        />
        <Button onClick={() => handleOpenPostPopup()}>{t("post")}</Button>
      </Flex>
    </Card>
  );
};

export default CreatePostBar;
