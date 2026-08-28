import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/shared/Notification/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIX Tool",
  description: "Enterprise management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.className}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
