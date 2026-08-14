import { Image, Text } from "../../../../../../ui/primitives";
import "./index.css";

const LinkBox = ({ link, color = "" }: { link: any; color?: string }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="msg-link"
    >
      <div className="msg-link__row">
        <Image
          className="msg-link__thumb"
          src={link.image}
          alt={link.title ? `${link.title} thumbnail` : "Link preview"}
        />
        <div className="msg-link__text-col">
          <Text
            className="msg-link__title"
            style={{ color: color || undefined }}
          >
            {link.title}
          </Text>
          <Text className="msg-link__url">{link.url}</Text>
        </div>
      </div>
    </a>
  );
};

export default LinkBox;
