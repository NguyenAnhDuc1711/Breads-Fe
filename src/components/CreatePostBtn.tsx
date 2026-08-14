import { AddIcon } from "../assests/chakraIcons";
import { Button } from "./ui/primitives";
import { useTranslation } from "react-i18next";
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { useAppDispatch } from "../hooks/redux";
import { updatePostAction } from "../store/PostSlice";
import { addEvent } from "../util";
import "./CreatePostBtn.css";

const CreatePostBtn = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <>
      <Button
        className="create-post-btn"
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
