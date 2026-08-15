import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { AppState } from "../../../../store";
import { IPost, ISurveyOption } from "../../../../store/PostSlice";
import { selectSurveyOption } from "../../../../store/PostSlice/asyncThunk";
import { openLoginPopupAction } from "../../../../store/UtilSlice";
import { getIsAdminPage } from "../../../../util";
import "./index.css";

const SurveyOption = ({
  option,
  post,
  isParentPost = false,
}: {
  option: ISurveyOption;
  post: IPost;
  isParentPost?: boolean;
}) => {
  const pathname = usePathname();
  const isAdmin = getIsAdminPage(pathname);
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const handleTickOption = () => {
    if (!userInfo?._id) {
      dispatch(openLoginPopupAction());
      return;
    }
    dispatch(
      selectSurveyOption({
        optionId: option._id,
        userId: userInfo._id,
        isAdd: !option.usersId?.includes(userInfo._id),
        postId: post._id,
      })
    );
  };
  const percent = useMemo(() => {
    const total = post.survey.reduce(
      (count, option) => count + (option.usersId?.length ?? 0),
      0
    );
    if (total === 0) {
      return 0;
    }
    return Math.floor(((option.usersId?.length ?? 0) / total) * 100);
  }, [post]);

  return (
    <div className="survey__option">
      <p
        className={`survey__option-value${
          isAdmin ? " survey__option-value--admin" : ""
        }`}
      >
        {option.value}
      </p>
      {!isAdmin && (
        <div className="survey__option-actions">
          <p className="survey__option-percent">{percent}%</p>
          <input
            type="checkbox"
            onChange={() => {
              if (!isParentPost && !isAdmin) {
                handleTickOption();
              }
            }}
            checked={option.usersId?.includes(userInfo._id)}
          />
        </div>
      )}
      <div className="survey__option-bg" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default SurveyOption;
