import type { Metadata } from "next";
import SearchPage from "../../../src/pages/SearchPage";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm kiếm người dùng và bài đăng trên Breads.",
};

const Page = () => <SearchPage />;

export default Page;
