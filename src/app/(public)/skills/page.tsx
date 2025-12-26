"use client";
import { motion } from "framer-motion";
import { Layout, Database, Terminal, Cpu, Layers } from "lucide-react";

const skillCategories = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    icon: <Layout size={24} />,
    description: "Building responsive, accessible, and pixel-perfect user interfaces.",
    skills: [
      "Next.js 14",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "shadcn/ui",
      "HTML5 & CSS3"
    ],
  },
  {
    id: "backend",
    title: "Backend & Database",
    icon: <Database size={24} />,
    description: "Architecting scalable server-side logic and managing data flows.",
    skills: [
      "Node.js",
      "Firebase Auth",
      "Superbase Auth",
      "Firestore",
      "MongoDB",
      "REST APIs",
      "PostgreSQL",
      "Prisma ORM" 
    ],
  },
  {
    id: "tools",
    title: "Tools & Workflow",
    icon: <Terminal size={24} />,
    description: "Optimizing development efficiency and version control.",
    skills: [
      "Git & GitHub",
      "VS Code",
      "Vercel",
      "Figma",
      "Adobe Photoshop",
      "Adobe Lightroom",
      "Adobe Illustrator",
      "Adobe Premiere Pro",
      "Postman",
      "npm / yarn"
    ],
  },
];

export default function SkillsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center max-w-2xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-black text-white rounded-2xl shadow-xl shadow-black/20">
              <Cpu size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Technical Arsenal</h1>
          <p className="text-gray-500 text-lg">
            A curated list of the technologies and tools I use to bring digital products to life.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className={`glass-panel p-8 rounded-3xl hover:border-black/20 transition-colors ${
                index === 2 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl text-black">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                  <div
                    key={skill}
                    className="group relative bg-white/50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:border-black hover:bg-white transition-all cursor-default"
                  >
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Currently Exploring
          </p>
          <div className="inline-flex items-center gap-3 bg-black/5 px-6 py-3 rounded-full">
            <Layers size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">Advanced Systems Architecture & AI Integration</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}