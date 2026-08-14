import { Avatar, Text } from "../../../../../../ui/primitives";
import "./item.css";

const SendNextItem = ({
  conversation,
  selectedConversations,
  setSelectedConversations,
}: {
  conversation: any;
  selectedConversations: any;
  setSelectedConversations: Function;
}) => {
  const participant = conversation?.participant;
  const selected = selectedConversations.find(
    (ele) => ele._id === conversation._id
  );

  const handleTick = () => {
    if (selected) {
      const newList = selectedConversations.filter(
        (ele) => ele._id !== conversation?._id
      );
      setSelectedConversations(newList);
    } else {
      setSelectedConversations([
        ...selectedConversations,
        {
          _id: conversation._id,
          recipientId: conversation.participant._id,
        },
      ]);
    }
  };

  return (
    <div className="send-next-item" onClick={() => handleTick()}>
      <div className="send-next-item__main">
        <Avatar src={participant?.avatar} />
        <Text fontWeight={600}>{participant?.username}</Text>
      </div>
      <input
        type="checkbox"
        className="send-next-item__checkbox"
        onChange={() => handleTick()}
        checked={selected}
      />
    </div>
  );
};

export default SendNextItem;
