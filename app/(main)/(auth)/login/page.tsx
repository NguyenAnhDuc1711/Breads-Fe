import type { Metadata } from "next";
import Login from "../../../../src/pages/Login";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Breads của bạn.",
  robots: { index: false, follow: false },
};


const Page = () => <Login />;

export default Page;
