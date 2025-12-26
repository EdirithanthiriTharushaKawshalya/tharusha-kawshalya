"use client";
import { motion } from "framer-motion";
import { Download, GraduationCap, Briefcase, Calendar, User } from "lucide-react";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen py-12 relative">
      
      {/* ADDED: Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* --- BLOCK 1: INTRO --- */}
          <motion.div variants={itemVariants} className="md:col-span-2 glass-panel p-6 md:p-12 rounded-3xl flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6 text-black">
              Software Engineer & <br /> <span className="text-gray-400">Creative Designer.</span>
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              I’m <strong>Edirithanthiri Tharusha Kawshalya</strong>. I bridge the gap between complex backend logic and beautiful frontend design. 
              Currently nearing the end of my degree, I am applying my skills in the real world to build robust software solutions.
            </p>
            
            {/* <div className="flex gap-4">
              <button className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold flex justify-center items-center gap-3 hover:bg-gray-800 transition active:scale-95 shadow-xl shadow-black/10">
                <Download size={20} /> Download CV
              </button>
            </div> */}
          </motion.div>

          {/* --- BLOCK 2: PHOTO PLACEHOLDER --- */}
          <motion.div variants={itemVariants} className="glass-panel p-4 rounded-3xl h-full min-h-[300px] flex items-center justify-center relative overflow-hidden group">
             <img src="/profile.jpg" alt="Me" className="w-full h-full object-cover rounded-2xl" />
          </motion.div>

          {/* --- BLOCK 3: EXPERIENCE --- */}
          <motion.div variants={itemVariants} className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2 bg-black text-white rounded-lg"><Briefcase size={20} /></div>
              Professional Experience
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="relative pl-6 border-l-2 border-gray-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full outline outline-4 outline-white"></div>
                <h3 className="font-bold text-xl">Intern Software Engineer</h3>
                <p className="text-black font-medium text-lg mt-1">Syntax Erreur</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                  <Calendar size={14} /> Present
                </p>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Working on full-stack web applications, modernizing legacy systems, and collaborating with senior engineers to deliver scalable solutions.
                </p>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full outline outline-4 outline-white"></div>
                <h3 className="font-bold text-xl">Graphic Designer (Part-time)</h3>
                <p className="text-black font-medium text-lg mt-1">Studio Zine</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                  <Calendar size={14} /> Previous
                </p>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Designed marketing materials, social media assets, and brand identities, ensuring high visual standards for client campaigns.
                </p>
              </div>
            </div>
          </motion.div>

          {/* --- BLOCK 4: EDUCATION --- */}
          <motion.div variants={itemVariants} className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-black rounded-lg"><GraduationCap size={20} /></div>
              Education History
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group hover:bg-white/40 p-4 rounded-xl transition-colors">
                <h3 className="font-bold text-lg">BSc Computer Science</h3>
                <p className="text-gray-600 mt-1">University of Westminster</p>
                <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Reading</p>
              </div>
              <div className="group hover:bg-white/40 p-4 rounded-xl transition-colors">
                <h3 className="font-bold text-lg">Foundation for HE</h3>
                <p className="text-gray-600 mt-1">Informatics Institute of Technology</p>
                <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Completed</p>
              </div>
              <div className="group hover:bg-white/40 p-4 rounded-xl transition-colors">
                <h3 className="font-bold text-lg">Primary & Secondary</h3>
                <p className="text-gray-600 mt-1">Dharmasoka College</p>
                <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Grade 1 - 11</p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}