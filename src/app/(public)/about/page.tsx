"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Calendar, Camera } from "lucide-react";
import { getPhotographySettings } from "@/lib/photography";

export default function AboutPage() {
  const [showPhotography, setShowPhotography] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getPhotographySettings();
      setShowPhotography(s.show_photography);
    };
    loadSettings();

    const handleSettingsChange = (e: any) => {
      if (e?.detail?.show_photography !== undefined) {
        setShowPhotography(e.detail.show_photography);
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
      
      {/* Background Grid */}
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
              Software Engineer & <br />{" "}
              <span className="text-gray-400">
                {showPhotography ? "Visual Director & Photographer." : "Creative Designer."}
              </span>
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              I’m <strong>Edirithanthiri Tharusha Kawshalya</strong>. I bridge the gap between complex backend logic, fluid user interfaces
              {showPhotography ? ", and cinematic visual storytelling." : ". Applying my engineering skills in the real world to build robust digital solutions."}
            </p>
          </motion.div>

          {/* --- BLOCK 2: PROFILE PHOTO --- */}
          <motion.div variants={itemVariants} className="glass-panel p-4 rounded-3xl h-full min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden">
              <Image 
                src="/profile.webp" 
                alt="Edirithanthiri Tharusha Kawshalya" 
                fill 
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
          </motion.div>

          {/* --- BLOCK 3A: SOFTWARE ENGINEERING EXPERIENCE --- */}
          <motion.div variants={itemVariants} className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-black text-white rounded-lg"><Briefcase size={20} /></div>
                Software Engineering Experience
              </h2>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full w-fit">
                Engineering Track
              </span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Junior Developer @ Arcforth */}
              <div className="relative pl-6 border-l-2 border-gray-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full outline outline-4 outline-white"></div>
                <h3 className="font-bold text-xl">Junior Developer</h3>
                <p className="text-black font-medium text-lg mt-1">Arcforth</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                  <Calendar size={14} /> Present
                </p>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Building scalable digital solutions, engineering modern full-stack web applications, and delivering high-quality software.
                </p>
              </div>

              {/* Intern Software Engineer @ Syntax Erreur */}
              <div className="relative pl-6 border-l-2 border-gray-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full outline outline-4 outline-white"></div>
                <h3 className="font-bold text-xl">Intern Software Engineer</h3>
                <p className="text-black font-medium text-lg mt-1">Syntax Erreur</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                  <Calendar size={14} /> Completed
                </p>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Worked on full-stack web applications, modernizing legacy systems, and collaborating with senior engineers to deliver scalable solutions.
                </p>
              </div>

              {/* Graphic Designer (Part-time) @ Studio Zine */}
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

          {/* --- BLOCK 3B: PROFESSIONAL PHOTOGRAPHY & CINEMATOGRAPHY (When Photography Mode is ON) --- */}
          <AnimatePresence>
            {showPhotography && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl relative overflow-hidden border border-gray-200/80"
              >
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg"><Camera size={20} /></div>
                    Professional Photography & Visual Media
                  </h2>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-100 border border-gray-200/60 px-3 py-1 rounded-full w-fit">
                    Creative Arts Track
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Lead Photographer & Videographer @ Studio Zine */}
                  <div className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full outline outline-4 outline-white"></div>
                    <h3 className="font-bold text-xl">Lead Photographer & Videographer</h3>
                    <p className="text-black font-medium text-lg mt-1">Studio Zine</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                      <Calendar size={14} /> Present
                    </p>
                    <p className="text-gray-600 mt-4 leading-relaxed">
                      Directing visual media productions, commercial studio portraiture, cinematic video shoots, and high-end color grading for brand campaigns and private clients.
                    </p>
                  </div>

                  {/* Lead Photographer @ Lal Studio */}
                  <div className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full outline outline-4 outline-white"></div>
                    <h3 className="font-bold text-xl">Lead Photographer</h3>
                    <p className="text-black font-medium text-lg mt-1">Lal Studio</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                      <Calendar size={14} /> Previous
                    </p>
                    <p className="text-gray-600 mt-4 leading-relaxed">
                      Spearheaded studio portrait sessions, wedding and event documentation, client photography, lighting choreography, and digital image retouching.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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