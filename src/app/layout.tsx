import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kawshalya | Software Engineer",
  description: "Portfolio of Edirithanthiri Tharusha Kawshalya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Only show Navbar if not in admin studio, logic can be added later */}
        <Navbar />
        <main className="pt-24 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}