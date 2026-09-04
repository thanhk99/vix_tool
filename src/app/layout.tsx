import type { Metadata } from "next";
import ToastProvider from "@/components/shared/Notification/ToastProvider";
import "./globals.css";

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
    <html lang="vi">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
