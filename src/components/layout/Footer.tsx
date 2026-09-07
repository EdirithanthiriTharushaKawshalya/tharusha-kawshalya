"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, ShieldCheck, ArrowUp, Camera } from "lucide-react";
import { getPhotographySettings, PhotographySettings, DEFAULT_SETTINGS } from "@/lib/photography";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<PhotographySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getPhotographySettings();
      setSettings(s);
    };
    loadSettings();

    const handleSettingsChange = (e: any) => {
      if (e?.detail) {
        setSettings(e.detail);
      } else {
        loadSettings();
      }
    };

    window.addEventListener("site-settings-changed", handleSettingsChange);
    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsChange);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-transparent pt-8 pb-20 relative overflow-hidden mt-auto">
      
      {/* Centered Footer Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-10">
        
        {/* Floating White Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] p-8 md:p-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
            
            {/* COLUMN 1: BRANDING */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="font-extrabold text-2xl tracking-tight text-black hover:opacity-85 transition-opacity">
                Kawshalya.dev
              </Link>
              <p className="text-gray-500 leading-relaxed max-w-sm text-sm">
                {settings.show_photography
                  ? "Engineering seamless digital experiences and capturing authentic human moments through professional photography."
                  : "Engineering seamless digital experiences with a focus on performance, accessibility, and modern aesthetics."}
              </p>
            </div>

            {/* COLUMNS 2-4: LINKS CONTAINER */}
            <div className={`lg:col-span-3 grid grid-cols-2 ${settings.show_photography ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-8`}>
              
              {/* 1. EXPLORE */}
              <div>
                <h3 className="font-bold text-black text-sm mb-4 tracking-wider uppercase">Explore</h3>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li>
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-black transition-colors">About & Experience</Link>
                  </li>
                  <li>
                    <Link href="/projects" className="hover:text-black transition-colors">Selected Work</Link>
                  </li>
                  <li>
                    <Link href="/skills" className="hover:text-black transition-colors">Tech Stack</Link>
                  </li>
                </ul>
              </div>

              {/* 2. ENGINEERING / PROFESSIONAL CONNECT */}
              <div>
                <h3 className="font-bold text-black text-sm mb-4 tracking-wider uppercase">Connect</h3>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li>
                    <a 
                      href="https://github.com/EdirithanthiriTharushaKawshalya" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-black transition-colors inline-flex items-center gap-2"
                    >
                      <Github size={15} />
                      <span>GitHub</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.linkedin.com/in/tharusha-kawshalya-747359356/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-black transition-colors inline-flex items-center gap-2"
                    >
                      <Linkedin size={15} />
                      <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:tharusha.k.dev@gmail.com" 
                      className="hover:text-black transition-colors inline-flex items-center gap-2"
                    >
                      <Mail size={15} />
                      <span>Email</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* 3. DEDICATED PHOTOGRAPHY CHANNELS (Strictly Isolated) */}
              {settings.show_photography && (
                <div>
                  <h3 className="font-bold text-black text-sm mb-4 tracking-wider uppercase flex items-center gap-1.5">
                    <Camera size={14} />
                    <span>Photography</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li>
                      <Link href="/photography" className="hover:text-black transition-colors font-medium">
                        Showcase Gallery
                      </Link>
                    </li>
                    {settings.tiktok_url && (
                      <li>
                        <a 
                          href={settings.tiktok_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-black transition-colors inline-flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                          <span>TikTok</span>
                        </a>
                      </li>
                    )}
                    {settings.facebook_url && (
                      <li>
                        <a 
                          href={settings.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-black transition-colors inline-flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Facebook</span>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* 4. ADMIN / PORTAL */}
              <div>
                <h3 className="font-bold text-black text-sm mb-4 tracking-wider uppercase">Portal</h3>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li>
                    <Link href="/admin" className="hover:text-black transition-colors inline-flex items-center gap-2">
                      <ShieldCheck size={15} />
                      <span>Admin Portal</span>
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* DIVIDER */}
          <div className="h-px w-full bg-gray-100/80 mb-8" />

          {/* BOTTOM BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-medium">
            <p className="order-2 md:order-1">&copy; {currentYear} Edirithanthiri Tharusha Kawshalya. All rights reserved.</p>
            
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 order-1 md:order-2">
              <Link href="/terms" className="hover:text-black transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-black">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-black transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-black">
                Privacy Policy
              </Link>
              <button 
                onClick={scrollToTop} 
                className="flex items-center gap-1.5 hover:text-black transition-colors group cursor-pointer"
              >
                <span>Back to Top</span>
                <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Large Background Watermark Text */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none select-none z-0 overflow-hidden h-[110px] sm:h-[180px] md:h-[260px]">
        <span className="font-black text-[15vw] sm:text-[14vw] tracking-normal sm:tracking-wider leading-none whitespace-nowrap translate-y-4 sm:translate-y-10 md:translate-y-20 bg-gradient-to-b from-gray-200 to-gray-100 bg-clip-text text-transparent opacity-90">
          KAWSHALYA
        </span>
      </div>

    </footer>
  );
}