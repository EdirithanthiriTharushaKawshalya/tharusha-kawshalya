"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  LogOut, Plus, MessageSquare, Trash2, LayoutGrid, 
  Github, Link as LinkIcon, FolderOpen, Image as ImageIcon, Loader2,
  Pencil, GripVertical, Camera, Eye, EyeOff, Check, ExternalLink,
  Sparkles
} from "lucide-react";
import {
  getPhotographySettings,
  updatePhotographySettings,
  getPhotographyPhotos,
  savePhotographyPhoto,
  deletePhotographyPhoto,
  reorderPhotographyPhotos,
  resetDefaultPhotos,
  compressImage,
  PhotographyPhoto,
  PhotographySettings,
  DEFAULT_SETTINGS,
} from "@/lib/photography";

const PROJECT_CATEGORIES = ["Fullstack", "Frontend", "Backend", "Mobile", "UI/UX"];
const PHOTO_CATEGORIES = ["Portraits", "Street", "Studio", "Events", "Automotive", "Landscape", "Editorial"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "photography" | "messages">("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    tech: "",
    category: "Fullstack",
    link: "",
    github: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Photography State
  const [photoSettings, setPhotoSettings] = useState<PhotographySettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<PhotographyPhoto[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: "",
    category: "Portraits",
    description: "",
    image: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isPhotoSubmitting, setIsPhotoSubmitting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalKB: number;
    compressedKB: number;
    savings: number;
  } | null>(null);

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
      // 1. Projects
      let pQueryRes = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (pQueryRes.error) {
        if (pQueryRes.error.code === "42703") {
          console.warn("sort_order column not found in Supabase. Falling back to ordering by created_at.");
          pQueryRes = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });
        }
        if (pQueryRes.error) throw pQueryRes.error;
      }
      setProjects(pQueryRes.data || []);

      // 2. Messages
      const { data: mData, error: mError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (mError) throw mError;
      setMessages(mData || []);

      // 3. Photography Settings & Photos
      const s = await getPhotographySettings();
      setPhotoSettings(s);
      const p = await getPhotographyPhotos();
      setPhotos(p);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // --- PROJECT HANDLERS ---
  const handleStartProjectEdit = (p: any) => {
    setEditingProjectId(p.id);
    setProjectFormData({
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

  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectFormData({
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
    } catch (err: any) {
      console.error("Error saving project order:", err);
      alert("Error saving project order: " + (err.message || err.hint || "Check sort_order column"));
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.title || !projectFormData.description) return;
    setIsSubmitting(true);

    try {
      let imageUrl = projectFormData.image || "";

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
        title: projectFormData.title,
        description: projectFormData.description,
        tech: projectFormData.tech.split(",").map(t => t.trim()).filter(Boolean),
        category: projectFormData.category,
        link: projectFormData.link || null,
        github: projectFormData.github || null,
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

      handleCancelProjectEdit();
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

  // --- PHOTOGRAPHY HANDLERS ---
  const handleTogglePhotography = async () => {
    setIsTogglingVisibility(true);
    try {
      const nextState = !photoSettings.show_photography;
      const updated = await updatePhotographySettings({ show_photography: nextState });
      setPhotoSettings(updated);
    } catch (err) {
      console.error("Error toggling photography:", err);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      setPhotoFile(null);
      setCompressionInfo(null);
      return;
    }
    setIsCompressing(true);
    try {
      const { file: compressed, originalSize, compressedSize, savingsPercent } = await compressImage(file);
      setPhotoFile(compressed);
      setCompressionInfo({
        originalKB: Math.round(originalSize / 1024),
        compressedKB: Math.round(compressedSize / 1024),
        savings: savingsPercent,
      });
    } catch (err) {
      console.warn("Compression fallback:", err);
      setPhotoFile(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddOrUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title) {
      alert("Please enter a photo title");
      return;
    }
    if (!photoForm.image && !photoFile) {
      alert("Please provide an image file or URL");
      return;
    }
    setIsPhotoSubmitting(true);
    try {
      const res = await savePhotographyPhoto(
        {
          id: editingPhotoId || undefined,
          title: photoForm.title,
          category: photoForm.category,
          description: photoForm.description,
          image: photoForm.image,
          sort_order: editingPhotoId ? undefined : photos.length,
        },
        photoFile
      );

      if (res.success) {
        handleCancelPhotoEdit();
        const updated = await getPhotographyPhotos();
        setPhotos(updated);
        alert(editingPhotoId ? "Photo Updated!" : "Photo Added to Showcase!");
      } else {
        alert("Error saving photo: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving photo:", err);
      alert("Error saving photo.");
    } finally {
      setIsPhotoSubmitting(false);
    }
  };

  const handleStartPhotoEdit = (p: PhotographyPhoto) => {
    setEditingPhotoId(p.id);
    setPhotoForm({
      title: p.title || "",
      category: p.category || "Portraits",
      description: p.description || "",
      image: p.image || "",
    });
    setPhotoFile(null);
    setCompressionInfo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelPhotoEdit = () => {
    setEditingPhotoId(null);
    setPhotoForm({
      title: "",
      category: "Portraits",
      description: "",
      image: "",
    });
    setPhotoFile(null);
    setCompressionInfo(null);
  };

  const handleDeletePhotoClick = async (photo: PhotographyPhoto) => {
    if (!confirm(`Are you sure you want to delete "${photo.title}" from your gallery?`)) return;
    await deletePhotographyPhoto(photo.id);
    if (editingPhotoId === photo.id) {
      handleCancelPhotoEdit();
    }
    const updated = await getPhotographyPhotos();
    setPhotos(updated);
  };

  const handleResetDefaultPhotos = async () => {
    if (!confirm("Reset showcase gallery back to the initial 10 curated photos?")) return;
    const res = await resetDefaultPhotos();
    setPhotos(res);
    handleCancelPhotoEdit();
  };

  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === index) return;
    const nextPhotos = [...photos];
    const item = nextPhotos[draggedPhotoIndex];
    nextPhotos.splice(draggedPhotoIndex, 1);
    nextPhotos.splice(index, 0, item);
    setDraggedPhotoIndex(index);
    setPhotos(nextPhotos);
  };

  const handlePhotoDragEnd = async () => {
    setDraggedPhotoIndex(null);
    await reorderPhotographyPhotos(photos);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen relative p-4 md:p-12">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Flex-col on mobile for stacking */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 glass-panel p-6 rounded-2xl gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutGrid size={24} /> Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage your engineering projects, photography gallery, and portfolio settings.</p>
          </div>
          <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setActiveTab("projects")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'projects' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <FolderOpen size={16} /> Projects ({projects.length})
              </button>
              
              <button 
                onClick={() => setActiveTab("photography")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'photography' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Camera size={16} /> Photography ({photos.length})
                {photoSettings.show_photography ? (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active on Website"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-400" title="Hidden"></span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab("messages")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'messages' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <MessageSquare size={16} /> Messages ({messages.length})
              </button>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* TAB 1: PROJECTS */}
        {/* ==================================================================== */}
        {activeTab === "projects" && (
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
                    {editingProjectId && projectFormData.image && (
                      <div className="mb-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={projectFormData.image} alt="current cover" className="w-full h-full object-cover" />
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

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Project Title</label>
                    <input type="text" required className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" placeholder="e.g. Skalix" value={projectFormData.title} onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Category</label>
                      <select className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" value={projectFormData.category} onChange={(e) => setProjectFormData({...projectFormData, category: e.target.value})}>
                        {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Tech Stack</label>
                      <input type="text" required placeholder="React, Supabase" className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" value={projectFormData.tech} onChange={(e) => setProjectFormData({...projectFormData, tech: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Description</label>
                    <textarea required rows={4} className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none resize-none text-base" placeholder="Describe the project..." value={projectFormData.description} onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <LinkIcon size={14} className="absolute top-4 left-3 text-gray-400" />
                      <input type="url" placeholder="Live Demo URL" className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-base" value={projectFormData.link} onChange={(e) => setProjectFormData({...projectFormData, link: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Github size={14} className="absolute top-4 left-3 text-gray-400" />
                      <input type="url" placeholder="GitHub URL" className="w-full bg-white/50 pl-9 p-3 rounded-xl border border-gray-200 outline-none text-base" value={projectFormData.github} onChange={(e) => setProjectFormData({...projectFormData, github: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all mt-2 flex justify-center items-center gap-2 active:scale-95 cursor-pointer">
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin" size={18} /> Saving...</>
                      ) : (
                        editingProjectId ? "Update Project" : "Launch Project"
                      )}
                    </button>
                    {editingProjectId && (
                      <button 
                        type="button" 
                        onClick={handleCancelProjectEdit} 
                        className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all mt-2 active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>

            {/* MANAGED PROJECTS */}
            <div className="lg:col-span-2 order-2">
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
                              <button onClick={() => handleStartProjectEdit(p)} className="text-gray-300 hover:text-black transition-colors p-1 cursor-pointer"><Pencil size={18} /></button>
                              <button onClick={() => handleDelete("projects", p.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 size={18} /></button>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg leading-tight mb-1">{p.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {p.tech?.map((t: string) => (
                            <span key={t} className="text-[10px] border border-gray-200 px-2 py-1 rounded text-gray-400 whitespace-nowrap">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PHOTOGRAPHY & VISIBILITY TOGGLE */}
        {/* ==================================================================== */}
        {activeTab === "photography" && (
          <div className="space-y-6">
            
            {/* 1. CLEAN VISIBILITY SWITCH BANNER (Minimal, Modern, Clutter-Free) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl ${photoSettings.show_photography ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
                  {photoSettings.show_photography ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-bold text-black">Photography Section</h2>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      photoSettings.show_photography ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {photoSettings.show_photography ? "Live on Website" : "Hidden (Interview Mode)"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {photoSettings.show_photography 
                      ? "Visible on Navbar, Footer, and live at /photography for business cards." 
                      : "Hidden from site navigation. Ideal when preparing for technical engineering interviews."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleTogglePhotography}
                  disabled={isTogglingVisibility}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer ${
                    photoSettings.show_photography
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
                >
                  {isTogglingVisibility ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : photoSettings.show_photography ? (
                    <>
                      <EyeOff size={14} />
                      Hide Photography
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Show Photography
                    </>
                  )}
                </button>

                <a 
                  href="/photography" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-black transition-colors"
                  title="Preview Photography Page"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </motion.div>

            {/* 2. MAIN PHOTOGRAPHY GRID: Photo Editor Form (Left) & Gallery Manager (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Photo Upload / Edit Form */}
              <div className="lg:col-span-1">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl sticky top-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {editingPhotoId ? <Pencil size={20} /> : <Plus size={20} />}
                      {editingPhotoId ? "Edit Showcase Photo" : "Add New Showcase Photo"}
                    </h3>
                    {editingPhotoId && (
                      <button 
                        type="button" 
                        onClick={handleCancelPhotoEdit} 
                        className="text-xs font-bold text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {editingPhotoId && (
                    <div className="mb-4 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Editing: <strong>{photoForm.title || "Selected Photo"}</strong></span>
                      <button type="button" onClick={handleCancelPhotoEdit} className="underline text-amber-900 hover:text-black">Reset Form</button>
                    </div>
                  )}

                  <form onSubmit={handleAddOrUpdatePhoto} className="flex flex-col gap-4">
                    {/* Image Upload Input */}
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">
                        Photo Image {editingPhotoId && "(Keep empty to retain current image)"}
                      </label>
                      
                      {/* Image Preview */}
                      {(photoForm.image || photoFile) && (
                        <div className="mb-3 relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <img 
                            src={photoFile ? URL.createObjectURL(photoFile) : photoForm.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                          {editingPhotoId && !photoFile && (
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-medium">
                              Current Image
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-xs text-gray-400 font-bold uppercase">
                          Upload image file:
                        </label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="w-full bg-white/50 p-2.5 rounded-xl border border-gray-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                        />
                        {isCompressing && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Loader2 size={13} className="animate-spin text-black" /> Auto-compressing photo for web...
                          </div>
                        )}
                        {compressionInfo && !isCompressing && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <Check size={13} /> Auto-compressed: {compressionInfo.originalKB} KB ➔ {compressionInfo.compressedKB} KB ({compressionInfo.savings}% smaller WebP)
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                          <span>or direct image URL:</span>
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..." 
                          value={photoForm.image} 
                          onChange={(e) => setPhotoForm({ ...photoForm, image: e.target.value })}
                          className="w-full bg-white/50 p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Photo Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Golden Hour Noir" 
                        value={photoForm.title} 
                        onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                        className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Category</label>
                      <select 
                        value={photoForm.category} 
                        onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                        className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none text-base" 
                      >
                        {PHOTO_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Description / Camera Gear</label>
                      <textarea 
                        rows={3} 
                        placeholder="e.g. Natural light editorial portrait, Sony A7IV + 85mm f/1.4..." 
                        value={photoForm.description} 
                        onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                        className="w-full bg-white/50 p-3 rounded-xl border border-gray-200 outline-none resize-none text-base" 
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="submit" 
                        disabled={isPhotoSubmitting || isCompressing}
                        className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        {isPhotoSubmitting ? (
                          <><Loader2 className="animate-spin" size={18} /> Saving...</>
                        ) : (
                          editingPhotoId ? "Save Changes to Photo" : "Add to Gallery"
                        )}
                      </button>

                      {editingPhotoId && (
                        <button 
                          type="button" 
                          onClick={handleCancelPhotoEdit} 
                          className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: Pure Focus on Showcase Gallery Manager */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Camera size={20} /> Curated Showcase Gallery ({photos.length} photos)
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Drag to reorder your photos. You can edit or delete any photo anytime.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaultPhotos}
                    className="text-xs font-semibold text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    title="Reset gallery to 10 default showcase photos"
                  >
                    Restore 10 Default Photos
                  </button>
                </div>

                {photos.length === 0 ? (
                  <div className="p-8 text-center bg-white/40 rounded-2xl border border-gray-200 text-gray-400">
                    No photos in showcase yet. Use the form on the left to add one!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <div 
                        key={photo.id} 
                        draggable={true}
                        onDragStart={(e) => handlePhotoDragStart(e, index)}
                        onDragOver={(e) => handlePhotoDragOver(e, index)}
                        onDragEnd={handlePhotoDragEnd}
                        className={`bg-white/70 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all ${
                          draggedPhotoIndex === index ? "opacity-40 border-dashed border-gray-400 scale-[0.98]" : ""
                        }`}
                      >
                        <div>
                          {/* Photo Thumbnail */}
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 mb-3 relative group">
                            <img 
                              src={photo.image} 
                              alt={photo.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                              #{index + 1}
                            </div>
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-black px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              {photo.category}
                            </div>
                          </div>

                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black transition-colors" title="Drag to reorder">
                                <GripVertical size={16} />
                              </div>
                              <h4 className="font-bold text-base line-clamp-1">{photo.title}</h4>
                            </div>

                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleStartPhotoEdit(photo)} 
                                className="text-gray-400 hover:text-black p-1 transition-colors cursor-pointer"
                                title="Edit Photo"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeletePhotoClick(photo)} 
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                title="Delete Photo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {photo.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 pl-6">
                              {photo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MESSAGES */}
        {/* ==================================================================== */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} /> Contact Inbox</h2>
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No messages received yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white/80 p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                  <button onClick={() => handleDelete("messages", msg.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 cursor-pointer transition-colors"><Trash2 size={18} /></button>
                  <h3 className="font-bold text-lg pr-8">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 block mb-2">{msg.email}</a>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}