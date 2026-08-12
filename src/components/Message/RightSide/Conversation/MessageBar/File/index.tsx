import { SmallAddIcon } from "../../../../../../assests/chakraIcons";
import { Input } from "@chakra-ui/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineFileAdd } from "react-icons/ai";
import { iconStyle } from "..";
import { fileTypes } from "../../../../../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import { updateMsgInfo } from "../../../../../../store/MessageSlice";
import { updatePostInfo } from "../../../../../../store/PostSlice";
import { showToast } from "../../../../../../store/UtilSlice";

const FileUpload = ({ setFilesData, isPost = false }) => {
  const dispatch = useAppDispatch();
  const msgInfo = useAppSelector((state: AppState) => state.message.msgInfo);
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);
  const fileRef = useRef<any>();
  const { t } = useTranslation();

  const handleFileChange = (e) => {
    const selectedFiles = Object.values(e.target.files);

    if (selectedFiles?.length > 5) {
      dispatch(
        showToast({
          title: "Info",
          description: t("uploadmax"),
          status: "info",
        })
      );
      return;
    }
    if (
      selectedFiles &&
      selectedFiles.every((file: any) => {
        let isValid = false;
        const typeValues = Object.values(fileTypes);
        typeValues.forEach((typeValue) => {
          typeValue.forEach((type) => {
            if (type == file?.type) {
              isValid = true;
            }
          });
        });
        return isValid;
      })
    ) {
      const fileMetaData = selectedFiles.map((file: any) => {
        return {
          name: file?.name,
          contentType: file?.type,
        };
      });
      setFilesData(selectedFiles);
      if (!isPost) {
        dispatch(
          updateMsgInfo({
            ...msgInfo,
            files: fileMetaData,
          })
        );
      } else {
        dispatch(
          updatePostInfo({
            ...postInfo,
            files: fileMetaData,
          })
        );
      }
    } else {
      dispatch(
        showToast({
          title: "Error",
          description: t("invalidtype"),
          status: "error",
        })
      );
    }
  };

  return (
    <>
      <Input
        type="file"
        multiple
        style={iconStyle}
        hidden
        ref={fileRef}
        onChange={handleFileChange}
      />
      {isPost ? (
        <AiOutlineFileAdd
          cursor={"pointer"}
          onClick={() => fileRef.current?.click()}
        />
      ) : (
        <SmallAddIcon
          style={iconStyle}
          onClick={() => fileRef.current?.click()}
        />
      )}
      {/* {files && (
        <div style={{ marginTop: "10px" }}>
          <strong>Selected File:</strong> {file.name} (
          {(files.size / 1024).toFixed(2)} KB)
        </div>
      )} */}
    </>
  );
};

export default FileUpload;
