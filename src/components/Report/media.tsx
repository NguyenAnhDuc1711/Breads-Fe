import { CloseIcon } from "../../assests/chakraIcons";
import { Image } from "../ui/primitives";
import { Constants } from "../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updateReportInfo } from "../../store/ReportSlice";
import "./media.css";

const ReportMediaDisplay = () => {
  const dispatch = useAppDispatch();
  const media = useAppSelector(
    (state: AppState) => state.report.reportInfo.media
  );

  const handleRemoveMedia = (removedIndex: number) => {
    const newMedia = media.filter((item, index) => index !== removedIndex);
    dispatch(
      updateReportInfo({
        key: "media",
        value: newMedia,
      })
    );
  };

  return (
    <div className="report-media">
      {media?.map(({ url, type }, index) => {
        const isImg = type === Constants.MEDIA_TYPE.IMAGE;
        if (isImg) {
          return (
            <div className="report-media__item" key={url}>
              <Image
                className="report-media__image"
                src={url}
                alt="Report media"
              />
              <CloseIcon
                className="report-media__remove"
                onClick={() => handleRemoveMedia(index)}
              />
            </div>
          );
        } else {
          return (
            <video className="report-media__video" src={url} key={url} />
          );
        }
      })}
    </div>
  );
};

export default ReportMediaDisplay;
