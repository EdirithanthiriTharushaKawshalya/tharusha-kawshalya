"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  LogOut, Plus, MessageSquare, Trash2, LayoutGrid, 
  Github, Link as LinkIcon, FolderOpen, Image as ImageIcon, Loader2,
  Pencil, GripVertical
} from "lucide-react";

const CATEGORIES = ["Fullstack", "Frontend", "Backend", "Mobile", "UI/UX"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "messages">("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech: "",
    category: "Fullstack",
    link: "",
    github: "",
    image: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin");
      } else {
        fetchData();
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      let pQueryRes = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (pQueryRes.error) {
        if (pQueryRes.error.code === "42703") {
          console.warn("sort_order column not found in Supabase. Falling back to ordering by created_at. Please run the SQL migration query!");
          pQueryRes = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });
        }
        if (pQueryRes.error) throw pQueryRes.error;
      }
      setProjects(pQueryRes.data || []);

      const { data: mData, error: mError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (mError) throw mError;
      setMessages(mData || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const handleStartEdit = (p: any) => {
    setEditingProjectId(p.id);
    setFormData({
      title: p.title || "",
      description: p.description || "",
      tech: Array.isArray(p.tech) ? p.tech.join(", ") : (p.tech || ""),
      category: p.category || "Fullstack",
      link: p.link || "",
      github: p.github || "",
      image: p.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setFormData({
      title: "",
      description: "",
      tech: "",
      category: "Fullstack",
      link: "",
      github: "",
      image: "",
    });
    setImageFile(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newProjects = [...projects];
    const draggedItem = newProjects[draggedIndex];
    newProjects.splice(draggedIndex, 1);
    newProjects.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setProjects(newProjects);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const updates = projects.map(async (p, idx) => {
        const { error } = await supabase
          .from("projects")
          .update({ sort_order: idx })
          .eq("id", p.id);
        if (error) throw error;
      });
      await Promise.all(updates);
      console.log("Order saved successfully");
    } catch (err: any) {
      console.error("Error saving project order:", err);
      alert("Error saving project order: " + (err.message || err.hint || "Please make sure the sort_order column was added to your projects table in the Supabase console!"));
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image || "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("projects")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("projects")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        tech: formData.tech.split(",").map(t => t.trim()).filter(Boolean),
        category: formData.category,
        link: formData.link || null,
        github: formData.github || null,
        image: imageUrl || null,
      };

      if (editingProjectId) {
        const { error: updateError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProjectId);

        if (updateError) throw updateError;
        alert("Project Updated Successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("projects")
          .insert([{
            ...projectData,
            sort_order: projects.length,
          }]);

        if (insertError) throw insertError;
        alert("Project Launched Successfully!");
      }

      handleCancelEdit();
      fetchData();
    } catch (error) {
      console.error("Error saving project: ", error);
      alert("Error saving project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const { error } = await supabase
        .from(collectionName)
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    // UPDATED: Reduced padding on mobile (p-4)
    <div className="min-h-screen relative p-4 md:p-12">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Flex-col on mobile for stacking */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 glass-panel p-6 rounded-2xl gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutGrid /> Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Chief.</p>
          </div>
          <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
            <div className="flex gap-2">
               <button onClick={() => setActiveTab("projects")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>Projects ({projects.length})</button>
               <button onClick={() => setActiveTab("messages")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>Messages ({messages.length})</button>
            </div>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={20} /></button>
          </div>
        </header>

        {/* MAIN LAYOUT: Stacks on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* EDITOR FORM */}
          <div className="lg:col-span-1 order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editingProjectId ? <Pencil size={20} /> : <Plus size={20} />} 
                {editingProjectId ? "Edit Project" : "New Project"}
              </h2>
              <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                
                {/* Image Upload Input */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">
                    Cover Image {editingProjectId && "(optional, keep empty to retain current)"}
                  </label>
                  {editingProjectId && formData.image && (
                    <div className="mb-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.image} alt="current cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                  </div>
                </div>

                {/* UPDATED: text-base prevents iOS zoom */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Project Title</label>
                  <input type="text" required className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" placeholder="e.g. Skalix" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Category</label>
                    <select className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Tech Stack</label>
                    <input type="text" required placeholder="React, Supabase" className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" value={formData.tech} onChange={(e) => setFormData({...formData, tech: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Description</label>
                  <textarea required rows={4} className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none resize-none text-base" placeholder="Describe the project..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <LinkIcon size={14} className="absolute top-4 left-3 text-gray-400" />
                    <input type="url" placeholder="Live Demo URL" className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-base" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Github size={14} className="absolute top-4 left-3 text-gray-400" />
                    <input type="url" placeholder="GitHub URL" className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-base" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all mt-2 flex justify-center items-center gap-2 active:scale-95">
                    {isSubmitting ? (
                      <><Loader2 className="animate-spin" size={18} /> Saving...</>
                    ) : (
                      editingProjectId ? "Update Project" : "Launch Project"
                    )}
                  </button>
                  {editingProjectId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all mt-2 active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>

          {/* LISTS (Projects/Messages) */}
          <div className="lg:col-span-2 order-2">
            {activeTab === "projects" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FolderOpen size={20} /> Managed Projects</h2>
                {projects.length === 0 ? <p className="text-gray-400">No projects yet.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((p, index) => (
                      <div 
                        key={p.id} 
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white/60 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all ${
                          draggedIndex === index ? "opacity-40 border-dashed border-gray-400 scale-[0.98]" : ""
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-black transition-colors p-1" title="Drag to reorder">
                                <GripVertical size={16} />
                              </div>
                              {p.image ? (
                               <img src={p.image} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                              ) : (
                               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><ImageIcon size={18} /></div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleStartEdit(p)} className="text-gray-300 hover:text-black transition-colors p-1"><Pencil size={18} /></button>
                              <button onClick={() => handleDelete("projects", p.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={18} /></button>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg leading-tight mb-1">{p.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {p.tech.map((t: string) => (
                            <span key={t} className="text-[10px] border border-gray-200 px-2 py-1 rounded text-gray-400 whitespace-nowrap">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === "messages" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} /> Inbox</h2>
                 {messages.map((msg) => (
                    <div key={msg.id} className="bg-white/80 p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                        <button onClick={() => handleDelete("messages", msg.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                        <h3 className="font-bold text-lg pr-8">{msg.name}</h3>
                        <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 block mb-2">{msg.email}</a>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{msg.message}</p>
                    </div>
                 ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}