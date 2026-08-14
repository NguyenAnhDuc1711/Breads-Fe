import { Input } from "../../../../../ui/primitives";
import { useEffect, useRef, useState } from "react";
import { TbLibraryPhoto } from "react-icons/tb";
import { iconStyle } from "..";
import { Constants } from "../../../../../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../../../../../hooks/redux";
import { AppState } from "../../../../../../store";
import { updateMsgInfo } from "../../../../../../store/MessageSlice";
import { convertToBase64 } from "../../../../../../util";

const MediaUpload = () => {
  const dispatch = useAppDispatch();
  const msgInfo = useAppSelector((state: AppState) => state.message.msgInfo);
  const [mediaData, setMediaData] = useState<any>([]);
  const mediaRef: any = useRef(null);

  useEffect(() => {
    if (mediaData?.length) {
      handleUpdateMsgMedia();
    }
  }, [mediaData]);

  const handleUpdateMsgMedia = async () => {
    try {
      const { IMAGE, VIDEO } = Constants.MEDIA_TYPE;
      const mediaInfo: any = [];
      for (let i = 0; i < mediaData.length; i++) {
        const base64 = await convertToBase64(mediaData[i]);
        mediaInfo[i] = {
          url: base64,
          type: mediaData[i]?.type.includes("image") ? IMAGE : VIDEO,
        };
      }
      dispatch(
        updateMsgInfo({
          ...msgInfo,
          media: mediaInfo,
        })
      );
    } catch (err) {
      console.error("handleUpdateMsgMedia: ", err);
    }
  };

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        multiple
        style={iconStyle}
        hidden
        ref={mediaRef}
        onChange={(e) => {
          setMediaData(e.target.files);
        }}
      />
      <TbLibraryPhoto
        style={iconStyle}
        onClick={() => mediaRef.current?.click()}
      />
    </>
  );
};

export default MediaUpload;
