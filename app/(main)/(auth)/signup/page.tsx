import type { Metadata } from "next";
import SignUp from "../../../../src/pages/SignUp";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Breads mới và bắt đầu kết nối với bạn bè.",
  robots: { index: false, follow: false },
};


const Page = () => <SignUp />;

export default Page;
