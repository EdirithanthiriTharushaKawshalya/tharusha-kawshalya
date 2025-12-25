"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

// Define the shape of a Project
interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
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

  return (
    <div className="py-10">
      <h2 className="text-3xl font-bold mb-8">Selected Projects</h2>
      
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-2xl flex flex-col h-full hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                    {t}
                  </span>
                ))}
              </div>
              {project.link && (
                <a href={project.link} target="_blank" className="text-sm font-bold underline">
                  View Project
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}