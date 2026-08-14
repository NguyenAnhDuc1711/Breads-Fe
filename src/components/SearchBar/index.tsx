import { Input } from "../ui/primitives";
import { memo, useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import "./index.css";

const SearchBar = ({
  value,
  setValue,
  placeholder,
}: {
  value: string;
  setValue: Function;
  placeholder: string;
}) => {
  const [text, setText] = useState(value);
  const debounceValue = useDebounce(text, 800);

  useEffect(() => {
    if (debounceValue !== value) {
      setValue(debounceValue);
    }
  }, [debounceValue]);

  useEffect(() => {
    if (value !== text) {
      setText(value);
    }
  }, [value]);

  return (
    <Input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      className="search-bar"
    />
  );
};

export default memo(SearchBar);
