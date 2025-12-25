"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Linkedin } from "lucide-react";

export default function Home() {
  return (
    <section className="flex flex-col justify-center items-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
          Software Engineer Intern
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl font-bold text-black tracking-tight">
          Building the <span className="text-gray-400">Future</span> <br />
          with Code & Design.
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Hi, I'm <strong>Edirithanthiri Tharusha Kawshalya</strong>. A Computer Science undergraduate at the 
          University of Westminster and currently engineering solutions at <strong>Syntax Erreur</strong>.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/projects" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2">
            View My Work <ArrowRight size={18} />
          </Link>
          <Link href="/contact" className="glass-panel px-6 py-3 rounded-lg font-medium text-black hover:bg-white/50 transition">
            Contact Me
          </Link>
        </div>
      </motion.div>
    </section>
  );
}