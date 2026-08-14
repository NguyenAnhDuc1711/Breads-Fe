import { Text } from "../ui/primitives";
import { Collapse, Slide } from "../ui/primitives";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updatePostInfo } from "../../store/PostSlice";
import SurveyOption from "./survey-option";
import "./survey.css";

const PostSurvey = () => {
  const dispatch = useAppDispatch();
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);
  const survey = postInfo.survey;
  const [selectedOption, setSelectedOption] = useState(0);

  const handleRemoveSurvey = () => {
    dispatch(
      updatePostInfo({
        ...postInfo,
        survey: [],
      })
    );
  };

  return (
    <Collapse in={true}>
      <Slide direction={"left"} in={true}>
        <div className="post-survey">
          {survey.map((item, index) => (
            <SurveyOption
              key={`survey-${item.value}-${index}`}
              option={item}
              index={index}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />
          ))}
          <div className="post-survey__footer">
            <Text className="post-survey__hint">End after 24 hours</Text>
            <Text
              className="post-survey__remove"
              onClick={() => handleRemoveSurvey()}
            >
              Remove this survey
            </Text>
          </div>
        </div>
      </Slide>
    </Collapse>
  );
};

export default PostSurvey;
