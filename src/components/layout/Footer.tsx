"use client";
import Link from "next/link";
import { Github, Linkedin, Mail, ShieldCheck, ArrowUp } from "lucide-react"; // Removed Code2

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200 pt-16 pb-8 mt-auto relative">
      
      {/* Decorative Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMN 1: BRANDING (Updated - Text Only) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="font-extrabold text-2xl tracking-tight text-black hover:opacity-80 transition-opacity">
              Kawshalya.dev
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm text-sm">
              Engineering seamless digital experiences with a focus on performance, accessibility, and modern aesthetics.
            </p>
          </div>

          {/* COLUMN 2: EXPLORE */}
          <div>
            <h3 className="font-bold text-black mb-4">Explore</h3>
            <ul className="space-y-3 text-sm text-gray-500">
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

          {/* COLUMN 3: CONNECT & ADMIN */}
          <div>
            <h3 className="font-bold text-black mb-4">Connect</h3>
            <div className="flex gap-3 mb-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-black hover:text-white transition-all"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-black hover:text-white transition-all"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="mailto:hello@kawshalya.dev" 
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-black hover:text-white transition-all"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>

            {/* Hidden Admin Access */}
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black transition-colors group"
            >
              <ShieldCheck size={14} className="group-hover:text-blue-600 transition-colors" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          <p>&copy; {currentYear} Edirithanthiri Tharusha Kawshalya. All rights reserved.</p>
          
          <button 
            onClick={scrollToTop} 
            className="flex items-center gap-2 hover:text-black transition-colors group"
          >
            Back to Top
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}