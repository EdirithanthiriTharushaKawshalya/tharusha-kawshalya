"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { addDoc, collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Plus, MessageSquare, Trash2, LayoutGrid, 
  Github, Link as LinkIcon, Layers, FolderOpen, Image as ImageIcon, Loader2
} from "lucide-react";

// Project Category Options
const CATEGORIES = ["Fullstack", "Frontend", "Backend", "Mobile", "UI/UX"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "messages">("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech: "",
    category: "Fullstack",
    link: "", // Live Demo
    github: "", // Repo Link
  });

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. AUTH CHECK & INITIAL FETCH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin");
      } else {
        fetchData();
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    // Fetch Projects
    const pQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const pSnap = await getDocs(pQuery);
    setProjects(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Fetch Messages
    const mQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const mSnap = await getDocs(mQuery);
    setMessages(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 2. HANDLERS
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // 1. Upload Image if selected
      if (imageFile) {
        const storageRef = ref(storage, `projects/${Date.now()}-${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Save Data to Firestore
      await addDoc(collection(db, "projects"), {
        ...formData,
        tech: formData.tech.split(",").map(t => t.trim()), // "React, CSS" -> ["React", "CSS"]
        image: imageUrl, // Save the URL
        createdAt: new Date(),
      });
      
      alert("Project Launched Successfully! 🚀");
      setFormData({ title: "", description: "", tech: "", category: "Fullstack", link: "", github: "" });
      setImageFile(null); // Reset image
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error adding project: ", error);
      alert("Error uploading project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Studio...</div>;

  return (
    <div className="min-h-screen relative p-6 md:p-12">
      
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 glass-panel p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid /> Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Welcome back, Chief.</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex gap-2">
               <button 
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
               >
                 Projects ({projects.length})
               </button>
               <button 
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
               >
                 Messages ({messages.length})
               </button>
            </div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: EDITOR FORM */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 rounded-3xl sticky top-8"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} /> New Project
              </h2>
              <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                
                {/* Image Upload Input */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Cover Image</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Project Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder="e.g. Skalix"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {/* Category & Tech */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Category</label>
                    <select 
                      className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Tech Stack</label>
                    <input 
                      type="text" 
                      required
                      placeholder="React, Firebase"
                      className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none"
                      value={formData.tech}
                      onChange={(e) => setFormData({...formData, tech: e.target.value})}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Description</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none resize-none"
                    placeholder="Describe the project..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <LinkIcon size={14} className="absolute top-4 left-3 text-gray-400" />
                    <input 
                      type="url" 
                      placeholder="Live Demo URL"
                      className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-sm"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Github size={14} className="absolute top-4 left-3 text-gray-400" />
                    <input 
                      type="url" 
                      placeholder="GitHub URL"
                      className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-sm"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all mt-2 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> 
                      Uploading...
                    </>
                  ) : (
                    "Launch Project"
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: LISTS (Projects or Messages) */}
          <div className="lg:col-span-2">
            
            {/* --- PROJECTS LIST --- */}
            {activeTab === "projects" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FolderOpen size={20} /> Managed Projects
                </h2>
                
                {projects.length === 0 ? <p className="text-gray-400">No projects yet.</p> : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div key={p.id} className="bg-white/60 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {p.image ? (
                                <img 
                                  src={p.image} 
                                  alt="preview" 
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200" 
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                              <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">{p.category}</span>
                            </div>
                            <button onClick={() => handleDelete("projects", p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <h3 className="font-bold text-lg leading-tight mb-1">{p.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="mt-4 flex gap-2 overflow-hidden">
                          {p.tech && Array.isArray(p.tech) && p.tech.map((t: string) => (
                            <span key={t} className="text-[10px] border border-gray-200 px-2 py-1 rounded text-gray-400 whitespace-nowrap">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* --- MESSAGES LIST --- */}
            {activeTab === "messages" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare size={20} /> Inbox
                </h2>

                {messages.length === 0 ? <p className="text-gray-400">Inbox is empty.</p> : (
                  <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-white/80 p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{msg.name}</h3>
                            <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                          </div>
                          <button onClick={() => handleDelete("messages", msg.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mt-3 text-sm leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                          {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}