import { CloseIcon } from "../../../../../../assests/chakraIcons";
import { Image, Text } from "../../../../../ui/primitives";
import "./ItemUploadDisplay.css";

const ItemUploadDisplay = ({ item, imgSrc, onClick, isPost = false }) => {
  const previewInsetHeight = item?.name && !isPost;

  return (
    <div
      key={item?.name}
      className={`upload-item${isPost ? " upload-item--post" : " upload-item--msg"}${
        item?.name ? " upload-item--named" : " upload-item--unnamed"
      }`}
    >
      <CloseIcon
        className="upload-item__close"
        onClick={() => {
          onClick();
        }}
      />
      <Image
        className={`upload-item__preview${
          isPost ? " upload-item__preview--post" : " upload-item__preview--msg"
        }${
          previewInsetHeight
            ? " upload-item__preview--inset-height"
            : " upload-item__preview--full-height"
        }`}
        src={imgSrc}
        alt={item?.name ? `Preview of ${item.name}` : "Upload preview"}
      />
      {item?.name && (
        <Text className="upload-item__name">{item?.name}</Text>
      )}
    </div>
  );
};

export default ItemUploadDisplay;
