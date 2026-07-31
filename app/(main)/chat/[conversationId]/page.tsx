import ChatPage from "../../../../src/pages/ChatPage";

const Page = ({
  params,
}: {
  params: { conversationId: string };
}) => <ChatPage conversationId={params.conversationId} />;

export default Page;
