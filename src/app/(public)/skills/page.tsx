"use client";
import { motion } from "framer-motion";

// You can move this to Firebase later using the same logic as 'Projects'
const skillCategories = [
  {
    title: "Frontend",
    skills: ["Next.js", "React", "Tailwind CSS", "Framer Motion", "TypeScript"],
  },
  {
    title: "Backend",
    skills: ["Node.js", "Firebase", "PostgreSQL", "REST APIs"],
  },
  {
    title: "Design & Tools",
    skills: ["Figma", "Adobe Photoshop", "Git/GitHub", "VS Code"],
  },
];

export default function SkillsPage() {
  return (
    <div className="py-12 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-12">Technical Arsenal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {skillCategories.map((category, catIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.2 }}
            className="glass-panel p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">
              {category.title}
            </h2>
            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: catIndex * 0.2 + index * 0.1 }}
                  className="bg-white/50 border border-white/60 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:scale-105 transition-transform cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}