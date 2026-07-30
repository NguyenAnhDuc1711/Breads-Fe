import type { Metadata } from "next";
import { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";
import "../src/animations.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Breads",
  icons: {
    icon: [
      { url: "/bread-logo-dark.svg", media: "(prefers-color-scheme: dark)" },
      { url: "/bread-logo-light.svg", media: "(prefers-color-scheme: light)" },
    ],
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
