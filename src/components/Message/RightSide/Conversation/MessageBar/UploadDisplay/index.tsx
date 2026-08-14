import { Button } from "../../../../../ui/primitives";
import { memo } from "react";
import { fileTypes } from "../../../../../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import { updateMsgInfo } from "../../../../../../store/MessageSlice";
import { updatePostInfo } from "../../../../../../store/PostSlice";
import { FILE_TYPES } from "../../../../../../util";
import { getCurrentTheme } from "../../../../../../util/Themes";
import FileMsg from "../../Body/Message/Files";
import ItemUploadDisplay from "./ItemUploadDisplay";
import LoadingUploadMsg from "./loading";
import "./index.css";

const UploadDisplay = ({ isPost = false, filesFromPost = null }) => {
  //Max 5 files / folders
  const dispatch = useAppDispatch();
  const { msgInfo, loadingUploadMsg, selectedConversation } = useAppSelector(
    (state: AppState) => state.message
  );
  const { conversationBackground } = getCurrentTheme(
    selectedConversation?.theme
  );
  const bg = conversationBackground?.backgroundColor;
  const { postInfo } = useAppSelector((state: AppState) => state.post);
  const media = msgInfo.media;
  const files = filesFromPost
    ? filesFromPost
    : isPost
    ? postInfo.files
    : msgInfo.files;
  const msgBg = loadingUploadMsg ? "gray" : bg || undefined;

  const getImgByType = (inputType) => {
    let fileType = "";
    const types = Object.keys(fileTypes);
    types.forEach((type) => {
      if (fileTypes[type].includes(inputType)) {
        fileType = type;
      }
    });
    const { word, excel, powerpoint, pdf, text } = FILE_TYPES;
    switch (fileType) {
      case word:
        return "../../../../FileImgs/word.svg";
      case excel:
        return "../../../../FileImgs/excel.svg";
      case powerpoint:
        return "../../../../FileImgs/powerpoint.svg";
      case pdf:
        return "../../../../FileImgs/pdf.png";
      case text:
        return "../../../../FileImgs/text.png";
    }
    return "";
  };

  const handleRemoveFile = (fileIndex) => {
    const newFiles = files.filter((_, index) => index !== fileIndex);
    if (!isPost) {
      dispatch(
        updateMsgInfo({
          ...msgInfo,
          files: newFiles,
        })
      );
    }
    if (isPost) {
      dispatch(
        updatePostInfo({
          ...postInfo,
          files: newFiles,
        })
      );
    }
  };

  const handleRemoveMedia = (mediaIndex) => {
    const newMedia = media.filter((_, index) => index !== mediaIndex);
    dispatch(
      updateMsgInfo({
        ...msgInfo,
        media: newMedia,
      })
    );
  };

  const handleRemoveAll = () => {
    if (!isPost) {
      dispatch(
        updateMsgInfo({
          ...msgInfo,
          files: [],
          media: [],
        })
      );
    }
    if (isPost) {
      dispatch(
        updatePostInfo({
          ...postInfo,
          files: [],
        })
      );
    }
  };

  return (
    <div
      className={`upload-display${
        isPost ? " upload-display--post" : " upload-display--msg"
      }`}
      style={!isPost ? { backgroundColor: msgBg } : undefined}
    >
      <>
        {media?.map((item, index) => (
          <ItemUploadDisplay
            key={`media-${index}`}
            item={item}
            imgSrc={item?.url}
            onClick={() => {
              handleRemoveMedia(index);
            }}
            isPost={isPost}
          />
        ))}
        {files?.map((file, index) => {
          if (filesFromPost) {
            return <FileMsg key={`file-${index}`} file={file} />;
          }
          return (
            <ItemUploadDisplay
              item={file}
              imgSrc={getImgByType(file.contentType)}
              onClick={() => handleRemoveFile(index)}
              key={index}
              isPost={isPost}
            />
          );
        })}
      </>
      {!isPost ? (
        <Button
          className="upload-display__clear-btn"
          onClick={() => handleRemoveAll()}
        >
          Clear all
        </Button>
      ) : (
        <></>
      )}
      {loadingUploadMsg && <LoadingUploadMsg />}
    </div>
  );
};

export default memo(UploadDisplay);
