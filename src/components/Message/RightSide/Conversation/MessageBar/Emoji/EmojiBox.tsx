import { Text } from "../../../../../ui/primitives";
import { memo, useMemo } from "react";
import { emojiMap } from "../../../../../../util";
import IconWrapper from "../IconWrapper";
import "./EmojiBox.css";

const EmojiBox = ({ searchValue, currentEmoji = "", onClick }) => {
  const emojis = useMemo(() => {
    const filterEmoji = Object.values(emojiMap)
      .filter(({ names }) => {
        return names.find((name) => name.includes(searchValue));
      })
      ?.map(({ icon }) => icon);
    return filterEmoji;
  }, [searchValue]);

  return (
    <div className="emoji-box">
      <div className="emoji-box__grid">
        {emojis.map((emoji) => (
          <IconWrapper
            key={emoji}
            addBg={currentEmoji ? currentEmoji === emoji : false}
            icon={
              <Text
                onClick={() => {
                  !!onClick && onClick(emoji);
                }}
              >
                {emoji}
              </Text>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default memo(EmojiBox);
