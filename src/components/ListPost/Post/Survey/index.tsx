import { IPost } from "../../../../store/PostSlice";
import "./index.css";
import SurveyOption from "./option";

const Survey = ({
  post,
  isParentPost = false,
}: {
  post: IPost;
  isParentPost?: boolean;
}) => {
  const surveyOptions = post.survey;

  return (
    <div className="survey">
      {surveyOptions?.map((option, index) => (
        <div key={`${post._id}-option-${option.value}-${index}`}>
          <SurveyOption
            option={option}
            post={post}
            isParentPost={isParentPost}
          />
        </div>
      ))}
    </div>
  );
};

export default Survey;
