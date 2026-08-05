import type { Metadata } from "next";
import SettingPage from "../../../src/pages/SettingPage";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Quản lý cài đặt tài khoản Breads của bạn.",
  robots: { index: false, follow: false },
};

const Page = () => <SettingPage />;

export default Page;
