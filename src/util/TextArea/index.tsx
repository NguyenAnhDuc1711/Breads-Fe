// TextArea.jsx
import { useColorModeValue } from "../../components/ui/primitives";
import { useEffect, useRef, useState } from "react";
import UsersTagBox from "../../components/UsersTagBox";
import { useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import CustomLinkPreview from "../CustomLinkPreview";
import "./index.css";
import { replaceEmojis } from "..";

const getCaretCoordinates = (input) => {
  const { selectionStart } = input;
  const tempDiv = document.createElement("div");
  const inputStyle = window.getComputedStyle(input);

  Object.assign(tempDiv.style, {
    position: "absolute",
    whiteSpace: "pre-wrap",
    visibility: "hidden",
    top: 0,
    left: 0,
    font: inputStyle.font,
    padding: inputStyle.padding,
    border: inputStyle.border,
    width: `${input.offsetWidth}px`,
  });

  tempDiv.textContent = input.value.slice(0, selectionStart);
  const markerSpan = document.createElement("span");
  markerSpan.textContent = "|";
  tempDiv.appendChild(markerSpan);

  document.body.appendChild(tempDiv);
  const { top, left } = markerSpan.getBoundingClientRect();
  document.body.removeChild(tempDiv);

  return { left, top };
};

const extractDomain = (url) => {
  const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
  return match ? match[1] : "";
};

const TextArea = ({
  text,
  setText,
  tagUsers = false,
  placeholder = "",
}: {
  text: string;
  setText: Function;
  tagUsers?: any;
  placeholder?: string;
}) => {
  const bgColor = useColorModeValue("cbg.light", "cbg.dark");
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);
  const usersTag = postInfo?.usersTag || [];
  const textAreaRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const [searchValue, setSearchValue] = useState("");
  const [openTagBox, setOpenTagBox] = useState(false);
  const [urls, setUrls] = useState([]);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const handleChange = (e) => {
    const value = e.target.value;

    if (tagUsers) {
      if (!value[value.length - 1]?.trim() && searchValue?.trim()) {
        setSearchValue("");
      } else {
        const tagRegex = /@(\w+)/g;
        const tagNames = [...value.matchAll(tagRegex)].map((arr) => arr[1]);
        const latestTagValue = tagNames[tagNames.length - 1];
        if (searchValue !== latestTagValue) {
          setSearchValue(latestTagValue);
        }
      }
    }

    let extractedUrls = value.match(urlRegex) || [];
    // Loại bỏ các URL trùng lặp
    extractedUrls = [...new Set(extractedUrls)];
    // Cập nhật nếu khác với danh sách URL hiện tại
    if (JSON.stringify(extractedUrls) !== JSON.stringify(urls)) {
      setUrls(extractedUrls);
    }

    setText(replaceEmojis(value));
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (usersTag.length && tagUsers) {
      const splitText = text.split(" ");
      for (const textIndex in splitText) {
        const tagIndex = usersTag.findIndex(
          ({ searchValue }) => splitText[textIndex] === `@${searchValue}`
        );
        if (tagIndex !== -1) {
          splitText[textIndex] = "@" + usersTag[tagIndex].username + " ";
        }
      }
      const newText = splitText.join(" ");
      setText(newText);
      textAreaRef.current.focus();
    }
  }, [usersTag]);

  useEffect(() => {
    if (searchValue?.trim()) {
      const splitStr = text.split(" ");
      if (splitStr[splitStr.length - 1]?.includes("@")) {
        const { left, top } = getCaretCoordinates(textAreaRef.current);
        if (popupRef.current) {
          popupRef.current.style.left = `${left + 16}px`;
          popupRef.current.style.top = `${top}px`;
        }
        setOpenTagBox(true);
      } else {
        setOpenTagBox(false);
      }
    } else {
      setOpenTagBox(false);
    }
  }, [searchValue]);

  return (
    <div className="text-area-container">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleChange}
        rows={1}
        placeholder={placeholder}
        className="auto-expand-textarea"
      />

      {urls.length > 0 && <CustomLinkPreview url={urls[0]} bg={bgColor} />}

      {tagUsers && (
        <div
          ref={popupRef}
          className={`tag-popup${openTagBox ? " tag-popup--open" : ""}`}
        >
          <UsersTagBox
            searchValue={searchValue}
            setOpenTagBox={setOpenTagBox}
          />
        </div>
      )}
    </div>
  );
};

export default TextArea;
