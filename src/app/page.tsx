"use client";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal, Layers, Code2, Cpu, ExternalLink, Image as ImageIcon, Zap, ShieldCheck, Smartphone } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 1. FETCH PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(6));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // 2. AUTO-SCROLL LOGIC WITH MANUAL OVERRIDE
  useEffect(() => {
    if (projects.length === 0) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let scrollAccumulator = 0;
    const scrollSpeed = 0.5; // Adjust this value to control speed (Lower = Slower)

    const animateScroll = () => {
      if (!isPaused && scrollContainer) {
        scrollAccumulator += scrollSpeed;
        
        // Only scroll when we have accumulated a full pixel to keep it smooth
        if (scrollAccumulator >= 1) {
            scrollContainer.scrollLeft += 1;
            scrollAccumulator -= 1;
        }

        // INFINITE LOOP LOGIC:
        // The list is repeated 3 times. 
        // When we scroll past the first set (1/3 of total width), 
        // we instantly reset position to 0 (start of first set).
        // Since Set 1 and Set 2 are identical, the user sees no jump.
        const oneSetWidth = scrollContainer.scrollWidth / 3;
        
        if (scrollContainer.scrollLeft >= oneSetWidth) {
           // Subtract exactly one set's width to maintain relative position
           scrollContainer.scrollLeft -= oneSetWidth; 
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [projects, isPaused]);

  // Triplicate the projects to ensure smooth infinite scrolling
  const marqueeProjects = [...projects, ...projects, ...projects];

  return (
    <div className="flex flex-col">
      
      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4">
        
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Blur Spots */}
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-gray-100/30 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl w-full text-center z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/60 border border-gray-200 px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-6 md:mb-8 shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-600">
              Interning @ Syntax Erreur
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-black mb-4 md:mb-6 leading-tight"
          >
            Engineering the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">
              Digital Future.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2"
          >
            I am <strong>Edirithanthiri Tharusha Kawshalya</strong>. A software engineer bridging the gap between 
            complex backend systems and fluid user interfaces.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full sm:w-auto"
          >
            <Link href="/projects" className="w-full sm:w-auto group bg-black text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition-all flex justify-center items-center gap-2 shadow-xl shadow-black/10 active:scale-95">
              View My Work 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/about" className="w-full sm:w-auto group bg-white border border-gray-200 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-50 transition-all flex justify-center items-center gap-2 active:scale-95">
              More About Me
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-gray-200/60"
          >
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Powering Solutions With
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                  <Terminal size={16} className="md:w-5 md:h-5" /> <span className="font-bold text-xs md:text-sm">Next.js</span>
              </div>
              <div className="flex items-center gap-2">
                  <Layers size={16} className="md:w-5 md:h-5" /> <span className="font-bold text-xs md:text-sm">Firebase</span>
              </div>
              <div className="flex items-center gap-2">
                  <Code2 size={16} className="md:w-5 md:h-5" /> <span className="font-bold text-xs md:text-sm">Tailwind</span>
              </div>
              <div className="flex items-center gap-2">
                  <Cpu size={16} className="md:w-5 md:h-5" /> <span className="font-bold text-xs md:text-sm">TypeScript</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- SECTION 2: FEATURED PROJECTS LOOP (Auto + Manual Scroll) --- */}
      {projects.length > 0 && (
        <section className="py-20 bg-white border-t border-gray-100 overflow-hidden">
          <div className="text-center mb-12 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Recent Deployments</h2>
            <p className="text-gray-500 text-sm md:text-base">Selected works from my portfolio.</p>
          </div>

          <div className="relative w-full">
            {/* UPDATED CONTAINER: 
              1. overflow-x-auto: Enables native scroll/swipe.
              2. ref={scrollRef}: Allows us to programmatically scroll it.
              3. no-scrollbar: Hides the ugly bar but keeps functionality.
            */}
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto w-full pl-4 pb-4 select-none cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Hide scrollbar in Firefox/IE
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {marqueeProjects.map((project, index) => (
                <Link 
                  href={`/projects/${project.id}`} 
                  key={`${project.id}-${index}`}
                  className="w-[320px] md:w-[380px] flex-shrink-0 group"
                  draggable={false} // Prevent link dragging ghost effect
                >
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
                    <div className="h-48 w-full bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          draggable={false}
                        />
                      ) : (
                        <ImageIcon size={32} className="text-gray-300" />
                      )}
                       {project.link && (
                         <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-gray-500 group-hover:text-black transition-colors shadow-sm">
                           <ExternalLink size={16} />
                         </div>
                       )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{project.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          {project.category || "Project"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
                        {project.tech?.slice(0, 3).map((t: string) => (
                          <span key={t} className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-black transition-colors"></div>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- SECTION 3: PHILOSOPHY --- */}
      <section className="py-24 bg-gray-50/50 border-t border-gray-200 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-black">
              More Than Just Code.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              I don't just write functions; I build digital ecosystems. 
              My development philosophy centers on three core pillars that ensure every project is scalable, fast, and user-friendly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">High Performance</h3>
              <p className="text-gray-500 leading-relaxed">
                Optimized loading times and smooth interactions. I use modern frameworks like Next.js to ensure your app is blazing fast.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Responsive Design</h3>
              <p className="text-gray-500 leading-relaxed">
                A seamless experience across all devices. From 4K monitors to mobile phones, your content looks perfect everywhere.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Scalable Architecture</h3>
              <p className="text-gray-500 leading-relaxed">
                Clean, modular code that grows with your business. I build systems that are easy to maintain and extend in the future.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}