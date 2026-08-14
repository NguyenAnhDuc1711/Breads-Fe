import { Button, Input } from "./ui/primitives";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import PostConstants from "../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { updatePostAction } from "../store/PostSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import OptimizedAvatar from "./OptimizedAvatar";
import "./CreatePostBar.css";

const CreatePostBar = () => {
  const { t } = useTranslation();
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
    <div className="create-post-bar">
      <div className="create-post-bar__row">
        <a
          href={`/users/${userInfo._id}`}
          onClick={(e) => {
            e.preventDefault();
            dispatch(changePage({ nextPage: PageConstant.USER }));
            navigate(`/users/${userInfo._id}`);
          }}
        >
          <OptimizedAvatar src={userInfo?.avatar} />
        </a>
        <Input
          className="create-post-bar__input"
          placeholder={t("whatnew")}
          defaultValue={""}
          onChange={(e) => {}}
          onClick={() => handleOpenPostPopup()}
        />
        <Button className="btn-subtle" onClick={() => handleOpenPostPopup()}>{t("post")}</Button>
      </div>
    </div>
  );
};

export default CreatePostBar;
