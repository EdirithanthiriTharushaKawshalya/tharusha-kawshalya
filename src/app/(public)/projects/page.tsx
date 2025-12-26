"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Code2, Search } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string; 
  category?: string;
  image?: string;
}

const categories = ["All", "Fullstack", "Frontend", "Backend", "Mobile"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects")); 
        const querySnapshot = await getDocs(q);
        const projectList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter || p.tech.some(t => t.includes(activeFilter)));

  return (
    <div className="min-h-screen py-12 relative">
      
      {/* ADDED: Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-black text-white rounded-2xl shadow-xl shadow-black/20">
              <Code2 size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Selected Work</h1>
          <p className="text-gray-500 text-lg">
            A collection of projects where design meets precise engineering.
          </p>
        </div>

        {/* FILTER BAR - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto pb-4 mb-8 md:mb-12 gap-2 no-scrollbar justify-start md:justify-center px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`whitespace-nowrap px-4 md:px-5 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                activeFilter === cat
                  ? "bg-black text-white shadow-lg scale-105"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Search size={48} className="mx-auto mb-4" />
            <p className="text-xl font-bold">No projects found.</p>
            <p>Try selecting a different category.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id} className="block h-full">
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  >
                    
                    {/* IMAGE HEADER */}
                    <div className="h-48 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center border border-gray-100 group-hover:bg-gray-100 transition-colors relative overflow-hidden">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Folder size={48} className="text-gray-300 group-hover:text-black transition-colors" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2 text-black line-clamp-1">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tech.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600 border border-gray-200">
                            {t}
                          </span>
                        ))}
                        {project.tech.length > 4 && (
                          <span className="text-xs font-bold bg-gray-50 px-2 py-1 rounded-md text-gray-400 border border-gray-100">
                            +{project.tech.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}