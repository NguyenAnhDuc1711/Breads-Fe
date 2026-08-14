// ViewActivity.jsx
import { Avatar, Divider, Text } from "../ui/primitives";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "../ui/primitives";
import { useEffect } from "react";
import { BsChatRightQuote } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { TbMessageReply } from "react-icons/tb";
import { addEvent } from "../../util";
import { IPost } from "../../store/PostSlice";
import { useTranslation } from "react-i18next";
import "./ViewActivity.css";

const ViewActivity = ({
  post,
  isOpen,
  onClose,
}: {
  post: IPost;
  isOpen: boolean;
  onClose: Function;
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    addEvent({
      event: "see_post_activity",
      payload: {
        postId: post._id,
      },
    });
  }, []);

  const actionsArray = [
    {
      action: CiHeart,
      num: post.likesCount ?? 0,
      name: t("countLike"),
    },
    {
      action: TbMessageReply,
      num: post.replies?.length,
      name: t("countCmt"),
    },
    {
      action: BsChatRightQuote,
      num: post?.repostNum,
      name: t("countRepost"),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
      <ModalOverlay />
      <ModalContent
        className="view-activity-modal"
        style={{ width: "500px", maxWidth: "620px" }}
        id="modal"
      >
        <div className="view-activity-modal__spacer"></div>
        <ModalHeader className="view-activity-modal__header">
          {t("viewActTitle")}
        </ModalHeader>

        <ModalBody>
          <div className="view-activity-modal__summary">
            <Avatar
              src={post.authorInfo?.avatar}
              width={"40px"}
              height={"40px"}
            />
            <div className="view-activity-modal__summary-body">
              <Text className="view-activity-modal__summary-username">
                {post.authorInfo?.username}
              </Text>
              <Text className="view-activity-modal__summary-content">
                {post.content}
              </Text>
            </div>
          </div>
          <div>
            {actionsArray.map((item, index) => (
              <div className="view-activity-modal__stat-row-wrap" key={index}>
                <div className="view-activity-modal__stat-row">
                  <div className="view-activity-modal__stat-label-box">
                    <div className="view-activity-modal__stat-label">
                      <item.action
                        style={{ marginRight: "8px", padding: "0" }}
                      />
                      <p className="view-activity-modal__stat-name">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <p className="view-activity-modal__stat-num">{item.num}</p>
                </div>
                <div className="view-activity-modal__divider-wrap">
                  <Divider borderColor="gray.300" />
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewActivity;
