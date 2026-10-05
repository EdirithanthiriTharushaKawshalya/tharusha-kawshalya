import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import PersonJsonLd from "@/components/seo/PersonJsonLd";
import { PERSONAL_INFO, getSiteUrl } from "@/lib/seo";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter" 
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tharusha Kawshalya | Software Engineer & Visual Director",
    template: "%s | Tharusha Kawshalya",
  },
  description:
    "Official portfolio of Edirithanthiri Tharusha Kawshalya (Tharusha Kawshalya) — Software Engineer, Full-Stack Developer, and Creative Visual Director / Photographer based in Sri Lanka. Studying Computer Science at the University of Westminster.",
  applicationName: "Tharusha Kawshalya Portfolio",
  authors: [
    {
      name: "Tharusha Kawshalya",
      url: siteUrl,
    },
    {
      name: "Edirithanthiri Tharusha Kawshalya",
      url: PERSONAL_INFO.social.linkedin,
    },
  ],
  generator: "Next.js",
  keywords: [
    "Tharusha Kawshalya",
    "Edirithanthiri Tharusha Kawshalya",
    "Tharusha",
    "Kawshalya",
    "Kawshalya.dev",
    "Software Engineer Sri Lanka",
    "Full Stack Developer Sri Lanka",
    "University of Westminster",
    "Informatics Institute of Technology",
    "Arcforth",
    "Syntax Erreur",
    "Photographer Sri Lanka",
    "Studio Zine",
    "Next.js Developer",
    "React Developer",
    "TypeScript",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Tharusha Kawshalya",
  publisher: "Tharusha Kawshalya",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tharusha Kawshalya | Software Engineer & Visual Director",
    description:
      "Edirithanthiri Tharusha Kawshalya — Software Engineer, Full-Stack Developer, and Creative Visual Director based in Sri Lanka.",
    url: siteUrl,
    siteName: "Tharusha Kawshalya",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Tharusha Kawshalya - Software Engineer & Visual Director",
      },
      {
        url: "/profile.webp",
        width: 800,
        height: 1000,
        alt: "Edirithanthiri Tharusha Kawshalya",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tharusha Kawshalya | Software Engineer & Visual Director",
    description:
      "Software Engineer, Full-Stack Developer, and Visual Director. Explore engineering projects and photography showcase.",
    images: ["/profile.jpg"],
    creator: "@tkedirithanthiri",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  verification: {
    google: "aHzZM-iBO4Y1xh7ocAkO2p0ERnsE-8ZXgGV_r9O-0h4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="google-site-verification" content="aHzZM-iBO4Y1xh7ocAkO2p0ERnsE-8ZXgGV_r9O-0h4" />
        <link rel="preconnect" href="https://vzagyiaonezntryzbxkm.supabase.co" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://vzagyiaonezntryzbxkm.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Schema.org Knowledge Graph structured data for Google & AI search engines */}
        <PersonJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen antialiased bg-[#f8f9fb]`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}