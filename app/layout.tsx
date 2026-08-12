import type { Metadata } from "next";
import { ReactNode } from "react";
import "../src/index.css";
import "../src/animations.css";
import { getCurrentUser } from "./lib/getCurrentUser";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://breads.social"
  ),
  title: {
    default: "Breads – Share Your World",
    template: "%s · Breads",
  },
  description:
    "Breads là mạng xã hội chia sẻ bài đăng, ảnh và kết nối bạn bè. Tham gia cộng đồng Breads ngay hôm nay!",
  keywords: ["mạng xã hội", "social network", "breads", "chia sẻ", "bài đăng"],
  authors: [{ name: "Breads" }],
  openGraph: {
    type: "website",
    siteName: "Breads",
    title: "Breads – Share Your World",
    description:
      "Mạng xã hội chia sẻ bài đăng, ảnh và kết nối bạn bè.",
    images: [
      {
        url: "/bread-logo.png",
        width: 512,
        height: 512,
        alt: "Breads logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Breads – Share Your World",
    description: "Mạng xã hội chia sẻ bài đăng, ảnh và kết nối bạn bè.",
    images: ["/bread-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/bread-logo-dark.svg", media: "(prefers-color-scheme: dark)" },
      { url: "/bread-logo-light.svg", media: "(prefers-color-scheme: light)" },
    ],
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const initialUser = await getCurrentUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
