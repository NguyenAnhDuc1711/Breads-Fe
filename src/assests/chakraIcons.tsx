import { Icon, IconProps } from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiLink,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

export const AddIcon = (props: IconProps) => <Icon as={FiPlus} {...props} />;
export const SmallAddIcon = (props: IconProps) => (
  <Icon as={FiPlus} {...props} />
);
export const DeleteIcon = (props: IconProps) => (
  <Icon as={FiTrash2} {...props} />
);
export const ArrowBackIcon = (props: IconProps) => (
  <Icon as={FiArrowLeft} {...props} />
);
export const ArrowForwardIcon = (props: IconProps) => (
  <Icon as={FiArrowRight} {...props} />
);
export const CloseIcon = (props: IconProps) => <Icon as={FiX} {...props} />;
export const CheckIcon = (props: IconProps) => (
  <Icon as={FiCheck} {...props} />
);
export const ChevronDownIcon = (props: IconProps) => (
  <Icon as={FiChevronDown} {...props} />
);
export const ChevronRightIcon = (props: IconProps) => (
  <Icon as={FiChevronRight} {...props} />
);
export const InfoIcon = (props: IconProps) => <Icon as={FiInfo} {...props} />;
export const LinkIcon = (props: IconProps) => <Icon as={FiLink} {...props} />;
export const SearchIcon = (props: IconProps) => (
  <Icon as={FiSearch} {...props} />
);
export const ViewIcon = (props: IconProps) => <Icon as={FiEye} {...props} />;
export const ViewOffIcon = (props: IconProps) => (
  <Icon as={FiEyeOff} {...props} />
);
