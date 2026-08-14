import { Image, Text } from "../../../../../../ui/primitives";
import { useAppDispatch } from "../../../../../../../hooks/redux";
import { updateSeeMedia } from "../../../../../../../store/UtilSlice";
import "./index.css";

const MsgMediaLayout = ({ media }: { media: any }) => {
  const dispatch = useAppDispatch();

  const handleSeeMedia = (index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: media,
        currentMediaIndex: index,
      })
    );
  };

  const mediaLen = media.length;
  switch (mediaLen) {
    case 1:
      return (
        <Image
          className="msg-media-single"
          src={media[0].url}
          alt="Message media"
          onClick={() => {
            handleSeeMedia(0);
          }}
        />
      );
    case 2:
    case 3:
      return (
        <div className="msg-media-pair">
          {media.map(({ url }, index) => (
            <Image
              className="msg-media-pair__item"
              key={url}
              src={url}
              alt={`Message media ${index + 1}`}
              onClick={() => {
                handleSeeMedia(index);
              }}
            />
          ))}
        </div>
      );
    default:
      const sizeModifier = mediaLen === 4 ? "--quad" : "--many";
      return (
        <div className="msg-media-grid">
          {media.map(({ url }, index) => {
            if (index < 4) {
              return (
                <Image
                  className={`msg-media-grid__item msg-media-grid__item${sizeModifier}`}
                  key={url}
                  src={url}
                  alt={`Message media ${index + 1}`}
                  onClick={() => {
                    handleSeeMedia(index);
                  }}
                />
              );
            } else if (index === 4) {
              return (
                <div
                  className={`msg-media-grid__overlay-wrap msg-media-grid__overlay-wrap${sizeModifier}`}
                  key={url}
                  onClick={() => {
                    handleSeeMedia(index);
                  }}
                >
                  <Image
                    className="msg-media-grid__overlay-img"
                    src={url}
                    alt={`Message media ${index + 1}`}
                  />
                  {mediaLen - 5 > 0 && (
                    <div className="msg-media-grid__overlay-count">
                      <Text className="msg-media-grid__overlay-count-text">
                        +{mediaLen - 5}
                      </Text>
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      );
  }
};

export default MsgMediaLayout;
