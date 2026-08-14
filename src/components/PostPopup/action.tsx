import { Input } from "../ui/primitives";
import { ScaleFade, useDisclosure } from "../ui/primitives";
import { useRef } from "react";
import { RiFileGifLine } from "react-icons/ri";

import { VscListSelection } from "react-icons/vsc";
import { Constants } from "../../Breads-Shared/Constants";
import { surveyTemplate, updatePostInfo } from "../../store/PostSlice";
import { addEvent, convertToBase64 } from "../../util";
import FileUpload from "../Message/RightSide/Conversation/MessageBar/File";
import { TbLibraryPhoto } from "react-icons/tb";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import GifBox from "./gif";
import "./action.css";

const PostPopupAction = ({ setFilesData }: { setFilesData: Function }) => {
  const dispatch = useAppDispatch();
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);
  const imageRef = useRef<HTMLInputElement>(null);

  const fileUploadRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAddMedia = async (files: any) => {
    const mediaArray = await Promise.all(
      Array.from(files).map(async (file: any) => {
        const base64 = await convertToBase64(file);
        return {
          url: base64,
          type: file.type.includes("image")
            ? Constants.MEDIA_TYPE.IMAGE
            : Constants.MEDIA_TYPE.VIDEO,
        };
      })
    );
    addEvent({
      event: "add_post_media",
      payload: {},
    });
    dispatch(
      updatePostInfo({
        ...postInfo,
        media: [...(postInfo.media || []), ...mediaArray],
      })
    );
  };

  const handleAddSurvey = () => {
    addEvent({
      event: "add_post_survey",
      payload: {},
    });
    dispatch(
      updatePostInfo({
        ...postInfo,
        survey: [
          surveyTemplate({ placeholder: "Yes", value: "" }),
          surveyTemplate({ placeholder: "No", value: "" }),
          surveyTemplate({ placeholder: "More option", value: "" }),
        ],
      })
    );
  };

  return (
    <ScaleFade in={true} initialScale={1}>
      <Input
        type="file"
        accept="application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, text/plain, application/pdf"
        multiple
        hidden
        ref={fileUploadRef}
        onChange={(e) => {
          setFilesData(e.target.files);
          addEvent({
            event: "add_post_files",
            payload: {},
          });
        }}
      />
      <Input
        type="file"
        accept="image/*, video/*"
        multiple
        hidden
        ref={imageRef}
        onChange={(e) => {
          handleAddMedia(e.target.files);
        }}
      />
      <div className="post-popup-action">
        <div className="post-popup-action__row">
          <FileUpload setFilesData={setFilesData} isPost={true} />
          <TbLibraryPhoto
            cursor="pointer"
            onClick={() => {
              if (imageRef.current) {
                imageRef.current.click();
              }
            }}
          />
          <RiFileGifLine cursor="pointer" onClick={onOpen} />
          <VscListSelection
            cursor="pointer"
            onClick={() => handleAddSurvey()}
          />
        </div>
      </div>

      <GifBox isOpen={isOpen} onClose={onClose} />
    </ScaleFade>
  );
};

export default PostPopupAction;
