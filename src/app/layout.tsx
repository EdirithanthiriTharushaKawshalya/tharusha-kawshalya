import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "Edirithanthiri Tharusha Kawshalya",
  description: "Edirithanthiri Tharusha Kawshalya - Software Engineer & Creative Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://vzagyiaonezntryzbxkm.supabase.co" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://vzagyiaonezntryzbxkm.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen antialiased`}>
        <ToastProvider>
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
        </ToastProvider>
      </body>
    </html>
  );
}