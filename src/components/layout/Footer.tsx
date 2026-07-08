"use client";
import Link from "next/link";
import { Github, Linkedin, Mail, ShieldCheck, ArrowUp } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
                Engineering seamless digital experiences with a focus on performance, accessibility, and modern aesthetics.
              </p>
            </div>

            {/* COLUMNS 2-4: LINKS CONTAINER */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              
              {/* EXPLORE */}
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

              {/* CONNECT */}
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

              {/* ADMIN / LEGAL */}
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