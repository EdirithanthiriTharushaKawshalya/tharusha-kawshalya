"use client";
import { motion } from "framer-motion";
import { Layout, Database, Terminal, Cpu, Cloud, Bot, CircuitBoard, Sparkles } from "lucide-react";

const skillCategories = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    icon: <Layout size={24} />,
    description: "Crafting responsive, accessible, and high-performance digital experiences.",
    skills: [
      "Next.js 15 / App Router",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "shadcn/ui",
      "State Management (Zustand / Redux)",
      "HTML5 & CSS3",
      "Responsive Web Design",
      "Vite"
    ],
  },
  {
    id: "backend",
    title: "Backend & Systems Architecture",
    icon: <Database size={24} />,
    description: "Architecting scalable server-side systems, realtime streams, and robust data persistence.",
    skills: [
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Supabase (Auth, DB & Realtime)",
      "Firebase (Firestore & Functions)",
      "MongoDB",
      "Prisma ORM",
      "RESTful APIs",
      "WebSockets & Realtime Events",
      "Redis Caching"
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud, DevOps & Infrastructure",
    icon: <Cloud size={24} />,
    description: "Containerization, infrastructure orchestration, and automated deployment pipelines.",
    skills: [
      "Docker & Containers",
      "AWS (S3, EC2, CloudFront)",
      "Vercel Platform",
      "Git & GitHub Actions (CI/CD)",
      "Linux Environment & Bash",
      "Microservices Architecture",
      "Postman & API Testing",
      "npm / pnpm / yarn"
    ],
  },
  {
    id: "tools",
    title: "Tools & Creative Production",
    icon: <Terminal size={24} />,
    description: "Optimizing development velocity, visual design fidelity, and creative production.",
    skills: [
      "Figma (UI/UX Prototyping)",
      "Adobe Photoshop",
      "Adobe Lightroom",
      "Adobe Illustrator",
      "Adobe Premiere Pro",
      "VS Code & Developer Extensions",
      "Design Systems",
      "Performance Optimization"
    ],
  },
];

const roboticsSkills = [
  "ROS 2 (Robot Operating System)",
  "Microcontrollers (ESP32, Arduino & STM32)",
  "Computer Vision & SLAM (OpenCV)",
  "Kinematics & Motor Control (Servos / Steppers)",
  "Sensor Fusion (LiDAR, Ultrasonic & IMU)",
  "Embedded C++ & MicroPython",
  "IoT Telemetry (MQTT & WebSockets)",
  "Edge AI & Embedded Perception"
];

export default function SkillsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
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
            A curated inventory of the technologies, architectures, and engineering tools I leverage to build modern digital products.
          </p>
        </motion.div>

        {/* 4 CATEGORIES IN BALANCED 2x2 GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {skillCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="glass-panel p-8 rounded-3xl hover:border-black/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gray-100 rounded-xl text-black">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">{category.title}</h2>
                    <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {category.skills.map((skill) => (
                    <div
                      key={skill}
                      className="group relative bg-white/50 border border-gray-200 px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:border-black hover:bg-white transition-all cursor-default"
                    >
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CURRENTLY EXPLORING: ROBOTICS & AUTONOMOUS SYSTEMS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden border border-gray-200/80"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-black text-white rounded-2xl shadow-lg shadow-black/10">
                <Bot size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Currently Exploring & Prototyping
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Autonomous Robotics & Embedded Systems
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100/90 border border-gray-200/70 px-3.5 py-1.5 rounded-full w-fit">
              <CircuitBoard size={14} className="text-black" />
              <span>Physical Computing & Edge Systems</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed max-w-3xl mb-7 text-sm md:text-base">
            Fusing software engineering with physical computing—designing intelligent robotics control pipelines, microcontroller firmware, real-time sensor fusion algorithms, and edge perception systems.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {roboticsSkills.map((item) => (
              <div
                key={item}
                className="group relative bg-white/70 border border-gray-200/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-800 hover:text-black hover:border-black hover:bg-white transition-all shadow-sm flex items-center gap-2 cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 group-hover:bg-black transition-colors"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}