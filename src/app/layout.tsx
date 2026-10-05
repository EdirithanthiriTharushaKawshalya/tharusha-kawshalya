import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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
      <body className={`${inter.className} min-h-screen antialiased bg-[#f8f9fb]`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}