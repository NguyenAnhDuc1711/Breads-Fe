import { Avatar, Button, Flex } from "../ui/primitives";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "../ui/primitives";
import { useRef } from "react";
import { IUserShortInfo } from "../../store/PostSlice";
import "./UnfollowPopup.css";

const UnFollowPopup = ({
  user,
  isOpen,
  onClose,
  onClick,
}: {
  user: IUserShortInfo;
  isOpen: boolean;
  onClose: Function;
  onClick: Function;
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={() => onClose()}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent className="unfollow-dialog">
          <Flex
            className="unfollow-dialog__body"
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Avatar src={user?.avatar} />
            <AlertDialogHeader className="unfollow-dialog__title">
              Unfollow {user?.name} ?
            </AlertDialogHeader>
          </Flex>
          <AlertDialogFooter className="unfollow-dialog__footer">
            <Button
              ref={cancelRef}
              onClick={() => onClose()}
              className="unfollow-dialog__btn unfollow-dialog__btn--cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onClick()}
              className="unfollow-dialog__btn unfollow-dialog__btn--danger"
            >
              Unfollow
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default UnFollowPopup;
