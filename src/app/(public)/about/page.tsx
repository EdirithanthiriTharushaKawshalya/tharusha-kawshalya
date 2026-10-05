"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Calendar, Camera } from "lucide-react";
import { getPhotographySettings } from "@/lib/photography";
import { getAboutData, AboutData, DEFAULT_ABOUT_DATA } from "@/lib/about";

export default function AboutPage() {
  const [showPhotography, setShowPhotography] = useState(true);
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_DATA);

  useEffect(() => {
    const loadData = async () => {
      const [s, a] = await Promise.all([
        getPhotographySettings(),
        getAboutData(),
      ]);
      setShowPhotography(s.show_photography);
      setAboutData(a);
    };
    loadData();

    const handleSettingsChange = (e: any) => {
      if (e?.detail?.show_photography !== undefined) {
        setShowPhotography(e.detail.show_photography);
      } else {
        loadData();
      }
    };

    const handleAboutChange = (e: any) => {
      if (e?.detail) {
        setAboutData(e.detail);
      } else {
        loadData();
      }
    };

    window.addEventListener("site-settings-changed", handleSettingsChange);
    window.addEventListener("about-data-changed", handleAboutChange);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsChange);
      window.removeEventListener("about-data-changed", handleAboutChange);
      window.removeEventListener("storage", loadData);
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

  const isExternalOrData = Boolean(
    aboutData.profileImage &&
      (aboutData.profileImage.startsWith("data:") ||
        aboutData.profileImage.startsWith("http"))
  );

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
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 glass-panel p-6 md:p-12 rounded-3xl flex flex-col justify-center"
          >
            <h1 className="text-4xl font-bold mb-6 text-black">
              {aboutData.headlinePrefix} <br />{" "}
              <span className="text-gray-400">
                {showPhotography
                  ? aboutData.headlineCreative
                  : aboutData.headlineStandard}
              </span>
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              {showPhotography
                ? aboutData.bioPhotography
                : aboutData.bioStandard}
            </p>
          </motion.div>

          {/* --- BLOCK 2: PROFILE PHOTO --- */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-4 rounded-3xl h-full min-h-[300px] flex items-center justify-center relative overflow-hidden group"
          >
            <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden">
              <Image
                src={aboutData.profileImage || "/profile.webp"}
                alt={aboutData.fullName || "Profile Photo"}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                unoptimized={isExternalOrData}
                className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* --- BLOCK 3A: SOFTWARE ENGINEERING EXPERIENCE --- */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-black text-white rounded-lg">
                  <Briefcase size={20} />
                </div>
                Software Engineering Experience
              </h2>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full w-fit">
                Engineering Track
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {aboutData.engineeringExperiences?.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative pl-6 border-l-2 border-gray-200"
                >
                  <div
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full outline outline-4 outline-white ${
                      index === 0 ? "bg-black" : "bg-gray-300"
                    }`}
                  ></div>
                  <h3 className="font-bold text-xl">{item.role}</h3>
                  <p className="text-black font-medium text-lg mt-1">
                    {item.company}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                    <Calendar size={14} /> {item.period}
                  </p>
                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
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
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Camera size={20} />
                    </div>
                    Professional Photography & Visual Media
                  </h2>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-100 border border-gray-200/60 px-3 py-1 rounded-full w-fit">
                    Creative Arts Track
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {aboutData.photographyExperiences?.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="relative pl-6 border-l-2 border-gray-200"
                    >
                      <div
                        className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full outline outline-4 outline-white ${
                          index === 0 ? "bg-black" : "bg-gray-300"
                        }`}
                      ></div>
                      <h3 className="font-bold text-xl">{item.role}</h3>
                      <p className="text-black font-medium text-lg mt-1">
                        {item.company}
                      </p>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium bg-gray-100 w-fit px-2 py-1 rounded">
                        <Calendar size={14} /> {item.period}
                      </p>
                      <p className="text-gray-600 mt-4 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- BLOCK 4: EDUCATION --- */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 glass-panel p-6 md:p-10 rounded-3xl"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-black rounded-lg">
                <GraduationCap size={20} />
              </div>
              Education History
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {aboutData.educationHistory?.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group hover:bg-white/40 p-4 rounded-xl transition-colors"
                >
                  <h3 className="font-bold text-lg">{item.degree}</h3>
                  <p className="text-gray-600 mt-1">{item.institution}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}