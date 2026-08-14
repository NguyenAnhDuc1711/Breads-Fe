import { PlacementWithLogical, Tooltip } from "../../../../ui/primitives";
import { memo } from "react";
import "./IconWrapper.css";

const IconWrapper = ({
  label = "",
  icon,
  placement = "top",
  addBg = false,
}: {
  label?: string;
  icon: any;
  placement?: any;
  addBg?: boolean;
}) => {
  return (
    <>
      <Tooltip label={label} placement={placement}>
        <div
          className={`msg-icon-wrapper${addBg ? " msg-icon-wrapper--active" : ""}`}
        >
          {icon}
        </div>
      </Tooltip>
    </>
  );
};

export default memo(IconWrapper);
