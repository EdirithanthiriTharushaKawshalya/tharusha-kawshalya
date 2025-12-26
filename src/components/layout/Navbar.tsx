"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";

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
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-6 py-4",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto relative">
        <nav 
          className={cn(
            "glass-panel rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 border border-gray-200/60 relative z-50",
            scrolled 
              ? "bg-white/90 shadow-md backdrop-blur-xl border-gray-200" 
              : "bg-gray-50/80 backdrop-blur-lg"
          )}
        >
          
          {/* 1. LOGO AREA (Text Only) */}
          <Link href="/" className="group">
            <span className="font-extrabold text-m tracking-tight text-black group-hover:opacity-70 transition-opacity">
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

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-black/5 rounded-full transition-colors relative"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* 4. COMPACT DROPDOWN (Dark Theme) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-[calc(100%+8px)] right-0 w-48 bg-[#0f1115] border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 md:hidden flex flex-col py-2"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-5 py-3 text-sm font-medium transition-colors border-l-2",
                      pathname === item.path 
                        ? "border-blue-500 bg-white/5 text-white" 
                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-2 mt-2 border-t border-white/10 px-4 pb-2">
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-white text-black py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform"
                  >
                    Let's Talk <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}