"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, Calendar, Layers, Code2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const { id } = useParams(); 
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/projects"); 
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Loading Grid Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen py-12 md:py-20 relative">
      
      {/* ADDED: Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Existing Background Decor (Kept for depth) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Button */}
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Projects
        </Link>

        {/* IMAGE BANNER */}
        {project.image && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-48 md:h-96 rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/50"
          >
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tech.map((t: string) => (
              <span key={t} className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black leading-tight">
            {project.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-8 text-gray-500 border-b border-gray-200 pb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm font-medium">
                {project.createdAt?.seconds 
                  ? new Date(project.createdAt.seconds * 1000).getFullYear() 
                  : "2025"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <span className="text-sm font-medium">{project.category || "Web Application"}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* Left: Description (Spans 2 cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Code2 size={20} /> Project Overview
              </h2>
              <p className="text-gray-600 leading-loose text-lg whitespace-pre-line">
                {project.description}
              </p>
            </div>
          </motion.div>

          {/* Right: Actions & Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Links Card */}
            <div className="bg-black text-white p-6 rounded-3xl shadow-xl shadow-black/20">
              <h3 className="font-bold text-lg mb-6">Project Links</h3>
              <div className="flex flex-col gap-3">
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all group"
                  >
                    <span className="font-medium">Live Demo</span>
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {/* GitHub Link Logic */}
                {project.github ? (
                  <a 
                    href={project.github} 
                    target="_blank" 
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all group"
                  >
                    <span className="font-medium">Source Code</span>
                    <Github size={18} />
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-between bg-white/5 p-4 rounded-xl opacity-50 cursor-not-allowed w-full">
                    <span className="font-medium">Private Repo</span>
                    <Github size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Tech Stack List */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="font-bold text-lg mb-4">Technologies</h3>
              <ul className="space-y-2">
                {project.tech.map((t: string) => (
                  <li key={t} className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}