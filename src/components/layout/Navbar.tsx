"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Code2, ArrowRight } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Skills", path: "/skills" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-6 py-4",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <nav 
            className={cn(
              // UPDATED COLORS HERE:
              // 1. Added 'border-gray-200' to make the edge visible.
              // 2. Changed bg to 'bg-gray-50/80' (Unscrolled) -> Slight grey tint to stand out against white page.
              // 3. Changed bg to 'bg-white/90' (Scrolled) -> Becomes brighter when you scroll down.
              "glass-panel rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 border border-gray-200/60",
              scrolled 
                ? "bg-white/90 shadow-md backdrop-blur-xl border-gray-200" 
                : "bg-gray-50/80 backdrop-blur-lg"
            )}
          >
            
            {/* 1. LOGO AREA */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-black text-white rounded-full group-hover:scale-105 transition-transform">
                <Code2 size={18} />
              </div>
              <span className="font-bold text-sm tracking-tight hidden sm:block group-hover:opacity-80 transition-opacity">
                Kawshalya.dev
              </span>
            </Link>

            {/* 2. DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-black/5",
                    pathname === item.path ? "text-black font-bold" : "text-gray-600 hover:text-black"
                  )}
                >
                  {item.name}
                  {pathname === item.path && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* 3. ACTIONS */}
            <div className="flex items-center gap-2">
              <Link 
                href="/contact" 
                className="hidden md:flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors active:scale-95"
              >
                Let's Talk
              </Link>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col items-center gap-8"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-2xl font-bold text-gray-800 py-4 border-b border-gray-100 hover:text-black transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold flex justify-center items-center gap-2 mt-4 active:scale-95 transition-transform"
              >
                Let's Talk <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}