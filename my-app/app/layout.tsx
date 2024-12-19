import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "3F",
  description: "A simple file upload and download application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}


