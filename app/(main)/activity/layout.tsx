import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hoạt động",
  description: "Xem thông báo và hoạt động của bạn trên Breads.",
  robots: { index: false, follow: false },
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
