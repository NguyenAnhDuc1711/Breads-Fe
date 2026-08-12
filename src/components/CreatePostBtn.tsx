import { AddIcon } from "../assests/chakraIcons";
import { Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { useAppDispatch } from "../hooks/redux";
import { updatePostAction } from "../store/PostSlice";
import { addEvent } from "../util";

const CreatePostBtn = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <>
      <Button
        display={["none", "none", "flex"]}
        padding={"25px"}
        opacity={0.8}
        position={"fixed"}
        bottom={10}
        right={10}
        bg={"#444444"}
        zIndex={1000}
        onClick={() => {
          addEvent({
            event: "click_create_post_btn",
            payload: {},
          });
          dispatch(updatePostAction(PostConstants.ACTIONS.CREATE));
        }}
      >
        <AddIcon />
      </Button>
    </>
  );
};

export default CreatePostBtn;
