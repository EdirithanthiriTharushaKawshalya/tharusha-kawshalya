"use client";
import { motion } from "framer-motion";

// You can eventually move this data to Firebase too!
const experiences = [
  {
    company: "Syntax Erreur",
    role: "Software Engineer Intern",
    period: "Present",
    description: "Working on full-stack web applications and modernizing legacy systems.",
  },
  {
    company: "Studio Zine",
    role: "Graphic Designer (Part-time)",
    period: "Past",
    description: "Designed creative assets and marketing materials for various client campaigns.",
  },
  // Add your education here if you like
  {
    company: "University of Westminster",
    role: "BSc Computer Science",
    period: "Final Year",
    description: "Specializing in software engineering and algorithms.",
  },
];

export default function ExperiencePage() {
  return (
    <div className="py-12 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-12 text-center">My Journey</h1>
      
      <div className="relative border-l-2 border-gray-200 ml-4 space-y-12">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative pl-8"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-black border-4 border-white shadow-sm" />
            
            <div className="glass-panel p-6 rounded-xl hover:shadow-md transition">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {exp.period}
              </span>
              <h3 className="text-xl font-bold text-black mt-1">{exp.role}</h3>
              <h4 className="text-md font-medium text-gray-700">{exp.company}</h4>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {exp.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}