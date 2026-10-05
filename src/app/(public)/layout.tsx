import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 px-4 md:px-12 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
