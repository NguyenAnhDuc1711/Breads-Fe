import { Input } from "../ui/primitives";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import useDebounce from "../../hooks/useDebounce";
import {
  ISurveyOption,
  surveyTemplate,
  updatePostInfo,
} from "../../store/PostSlice";
import { replaceEmojis } from "../../util";
import "./survey-option.css";

const SurveyOption = ({
  option,
  index,
  selectedOption,
  setSelectedOption,
}: {
  option: ISurveyOption;
  index: number;
  selectedOption: number;
  setSelectedOption: Function;
}) => {
  const dispatch = useAppDispatch();
  const postInfo = useAppSelector((state) => state.post.postInfo);
  const [optionContent, setOptionContent] = useState(option?.value ?? "");
  const debounceValue = useDebounce(optionContent, 500);
  const isInit = useRef(true);

  useEffect(() => {
    if (!isInit.current) {
      handleOptionContent(debounceValue);
    } else {
      isInit.current = false;
    }
  }, [debounceValue]);

  useEffect(() => {
    const inputTag = document.getElementById(`option-${selectedOption}`);
    if (inputTag) {
      inputTag.focus();
    }
  }, []);

  const handleOptionContent = (value) => {
    const survey = JSON.parse(JSON.stringify(postInfo.survey));
    if (option.placeholder === "More option" && !value && survey.length > 3) {
      survey.splice(index, 1);
    } else {
      survey[index] = {
        ...option,
        value: replaceEmojis(value),
      };
    }
    if (index === survey.length - 1 && !!value) {
      survey.push(
        surveyTemplate({
          placeholder: "More option",
          value: "",
        })
      );
    }
    dispatch(
      updatePostInfo({
        ...postInfo,
        survey: survey,
      })
    );
  };

  return (
    <Input
      className="post-survey-option"
      id={`option-${index}`}
      placeholder={option.placeholder}
      value={optionContent}
      onClick={() => setSelectedOption(index)}
      onChange={(e) => setOptionContent(replaceEmojis(e.target.value))}
    />
  );
};

export default SurveyOption;
