import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kawshalya | Software Engineer",
  description: "Edirithanthiri Tharusha Kawshalya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* FIX 1: Add 'flex flex-col min-h-screen' to body.
        This makes the whole body exactly the height of the screen (minimum).
      */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        
        <Navbar />
        
        {/* FIX 2: Changed 'min-h-screen' to 'flex-grow'.
          'flex-grow' tells the main content to take up ALL available space 
          between the Navbar and Footer.
          - If content is short: Footer sits at the bottom of the screen.
          - If content is long: Footer sits at the bottom of the content (you scroll).
        */}
        <main className="flex-grow pt-24 px-4 md:px-12 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}