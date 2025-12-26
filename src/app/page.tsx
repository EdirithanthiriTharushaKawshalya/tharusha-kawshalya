"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal, Layers, Code2, Cpu } from "lucide-react";

export default function Home() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden">
      
      {/* Decorative Blur Spots (Subtle atmosphere without the grid) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gray-100/30 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl px-6 w-full text-center z-10">
        
        {/* 1. STATUS BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/60 border border-gray-200 px-4 py-2 rounded-full mb-8 shadow-sm backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Interning @ Syntax Erreur
          </span>
        </motion.div>

        {/* 2. MAIN HEADLINE */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-black mb-6 leading-tight"
        >
          Engineering the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">
            Digital Future.
          </span>
        </motion.h1>

        {/* 3. SUBHEADLINE */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          I am <strong>Edirithanthiri Tharusha Kawshalya</strong>. A software engineer bridging the gap between 
          complex backend systems and fluid user interfaces.
        </motion.p>

        {/* 4. CALL TO ACTION BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <Link href="/projects" className="group bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95">
            View My Work 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/about" className="group bg-white border border-gray-200 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            More About Me
          </Link>
        </motion.div>

        {/* 5. TECH STACK STRIP (Bottom Decoration) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-20 pt-10 border-t border-gray-200/60"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Powering Solutions With
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2">
                <Terminal size={20} /> <span className="font-bold text-sm">Next.js</span>
             </div>
             <div className="flex items-center gap-2">
                <Layers size={20} /> <span className="font-bold text-sm">Firebase</span>
             </div>
             <div className="flex items-center gap-2">
                <Code2 size={20} /> <span className="font-bold text-sm">Tailwind</span>
             </div>
             <div className="flex items-center gap-2">
                <Cpu size={20} /> <span className="font-bold text-sm">TypeScript</span>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}