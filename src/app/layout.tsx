import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "900"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={barlow.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
