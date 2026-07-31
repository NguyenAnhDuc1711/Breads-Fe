import ResetPWPage from "../../../../../src/pages/ResetPWPage";

const Page = ({
  params,
}: {
  params: { userId: string; code: string };
}) => <ResetPWPage userId={params.userId} code={params.code} />;

export default Page;
