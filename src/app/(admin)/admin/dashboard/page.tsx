"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  LogOut, Plus, MessageSquare, Trash2, LayoutGrid, 
  Github, Link as LinkIcon, FolderOpen, Image as ImageIcon, Loader2,
  Pencil, GripVertical, Camera, Eye, EyeOff, Check, ExternalLink,
  Sparkles, Database, Copy, RefreshCw, CloudUpload, User, GraduationCap, Briefcase, Upload, RotateCcw,
  Search, Menu, X, ArrowUpRight, ChevronRight, Layers, ShieldCheck, Inbox, Crop
} from "lucide-react";
import ImageCropperModal from "@/components/admin/ImageCropperModal";
import {
  getPhotographySettings,
  updatePhotographySettings,
  getPhotographyPhotos,
  savePhotographyPhoto,
  deletePhotographyPhoto,
  reorderPhotographyPhotos,
  resetDefaultPhotos,
  clearAllPhotos,
  compressImage,
  checkSupabasePhotographyStatus,
  syncLocalPhotosToSupabase,
  SQL_SETUP_SCRIPT,
  PhotographyPhoto,
  PhotographySettings,
  DEFAULT_SETTINGS,
} from "@/lib/photography";
import {
  getAboutData,
  updateAboutData,
  resetDefaultAboutData,
  uploadProfilePhoto,
  AboutData,
  DEFAULT_ABOUT_DATA,
  ExperienceItem,
  EducationItem,
} from "@/lib/about";
import { useToast } from "@/components/ui/ToastProvider";

const PROJECT_CATEGORIES = ["Fullstack", "Frontend", "Backend", "Mobile", "UI/UX"];
const PHOTO_CATEGORIES = ["Portraits", "Street", "Studio", "Events", "Automotive", "Landscape", "Editorial"];

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast, showConfirm } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "photography" | "about" | "messages">("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // About Page State
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileCompressionInfo, setProfileCompressionInfo] = useState<{
    originalKB: number;
    compressedKB: number;
    savings: number;
  } | null>(null);

  // Profile Image Cropper Modal State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>("");

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

  // Cloud Database Status State
  const [cloudStatus, setCloudStatus] = useState<{
    checking: boolean;
    connected: boolean;
    error?: string;
  }>({ checking: true, connected: false });
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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

      // 4. About Page Data
      const a = await getAboutData();
      setAboutData(a);

      // 5. Check Supabase Cloud Connection Status
      checkCloud();
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
      showToast("Project order updated successfully", "success");
    } catch (err: any) {
      console.error("Error saving project order:", err);
      showToast("Error saving project order: " + (err.message || err.hint || "Check sort_order column"), "error");
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
        showToast("Project updated successfully!", "success");
      } else {
        const { error: insertError } = await supabase
          .from("projects")
          .insert([{
            ...projectData,
            sort_order: projects.length,
          }]);

        if (insertError) throw insertError;
        showToast("Project launched successfully!", "success");
      }

      handleCancelProjectEdit();
      fetchData();
    } catch (error) {
      console.error("Error saving project: ", error);
      showToast("Error saving project. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (collectionName: string, id: string) => {
    showConfirm({
      title: "Delete Item",
      message: `Are you sure you want to permanently delete this ${collectionName === "projects" ? "project" : "item"}?`,
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from(collectionName)
            .delete()
            .eq("id", id);
          if (error) throw error;
          fetchData();
          showToast("Item deleted successfully", "info");
        } catch (error) {
          console.error("Delete error:", error);
          showToast("Error deleting item.", "error");
        }
      },
    });
  };

  // --- PHOTOGRAPHY CLOUD SYNC HANDLERS ---
  const checkCloud = async () => {
    setCloudStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await checkSupabasePhotographyStatus();
      setCloudStatus({
        checking: false,
        connected: res.connected,
        error: res.error,
      });
    } catch (err: any) {
      setCloudStatus({
        checking: false,
        connected: false,
        error: err?.message || String(err),
      });
    }
  };

  const handleCopySql = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    }
    setCopiedSql(true);
    showToast("SQL Setup Script copied to clipboard! Paste it into Supabase SQL Editor and click Run.", "success");
    setTimeout(() => setCopiedSql(false), 3500);
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncingToCloud(true);
    try {
      const res = await syncLocalPhotosToSupabase();
      if (res.success) {
        showToast(`Cloud Sync Complete! Synced ${res.syncedCount} of ${res.totalLocalCount} photos to Supabase Cloud.`, "success");
        const updated = await getPhotographyPhotos();
        setPhotos(updated);
        checkCloud();
      } else {
        showToast(res.error || "Failed to sync photos to Supabase Cloud", "error");
      }
    } catch (err: any) {
      showToast("Error syncing to Supabase: " + (err?.message || "Unknown error"), "error");
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  // --- PHOTOGRAPHY HANDLERS ---
  const handleTogglePhotography = async () => {
    setIsTogglingVisibility(true);
    try {
      const nextState = !photoSettings.show_photography;
      const updated = await updatePhotographySettings({ show_photography: nextState });
      setPhotoSettings(updated);
      showToast(
        nextState ? "Photography section is now LIVE on your website" : "Photography section HIDDEN (Interview Mode active)",
        "info"
      );
    } catch (err) {
      console.error("Error toggling photography:", err);
      showToast("Failed to toggle visibility", "error");
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
      showToast("Please enter a photo title", "error");
      return;
    }
    if (!photoForm.image && !photoFile) {
      showToast("Please provide an image file or direct image URL", "error");
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
        if (res.isCloudSynced) {
          showToast(
            editingPhotoId
              ? "Photo updated and synced to Supabase Cloud!"
              : "Photo added to showcase and synced to Supabase Cloud!",
            "success"
          );
        } else {
          showToast(
            "Photo saved locally. Run the Supabase SQL setup to sync to your live hosted site.",
            "info"
          );
        }
      } else {
        showToast("Error saving photo: " + (res.error || "Unknown error"), "error");
      }
    } catch (err) {
      console.error("Error saving photo:", err);
      showToast("Error saving photo. Please try again.", "error");
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

  const handleDeletePhotoClick = (photo: PhotographyPhoto) => {
    showConfirm({
      title: "Delete Photo",
      message: `Are you sure you want to remove "${photo.title}" from your gallery?`,
      confirmText: "Delete Photo",
      isDestructive: true,
      onConfirm: async () => {
        await deletePhotographyPhoto(photo.id);
        if (editingPhotoId === photo.id) {
          handleCancelPhotoEdit();
        }
        const updated = await getPhotographyPhotos();
        setPhotos(updated);
        showToast(`Photo "${photo.title}" deleted`, "info");
      },
    });
  };

  const handleResetDefaultPhotos = () => {
    showConfirm({
      title: "Restore Sample Photos",
      message: "Reset your showcase gallery back to the default sample photos?",
      confirmText: "Restore Samples",
      isDestructive: false,
      onConfirm: async () => {
        const res = await resetDefaultPhotos();
        setPhotos(res);
        handleCancelPhotoEdit();
        showToast("Showcase gallery restored to sample photos", "success");
      },
    });
  };

  const handleClearAllPhotos = () => {
    showConfirm({
      title: "Clear All Photos",
      message: "Are you sure you want to clear all photos from your gallery? You can then add your own photos fresh.",
      confirmText: "Clear All",
      isDestructive: true,
      onConfirm: async () => {
        await clearAllPhotos();
        setPhotos([]);
        handleCancelPhotoEdit();
        showToast("All photos cleared from gallery", "info");
      },
    });
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
    showToast("Photo order updated", "success");
  };

  // --- ABOUT PAGE HANDLERS ---
  const handleSaveAbout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAbout(true);
    try {
      await updateAboutData(aboutData);
      showToast("About page updated successfully!", "success");
    } catch (err: any) {
      showToast("Failed to save about data: " + (err.message || String(err)), "error");
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can re-select the same file if needed
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropperImageSrc(reader.result);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileCropComplete = async (croppedBlob: Blob, _previewUrl: string) => {
    setIsUploadingProfile(true);
    try {
      const croppedFile = new File([croppedBlob], `profile_${Date.now()}.webp`, {
        type: "image/webp",
      });
      const res = await uploadProfilePhoto(croppedFile);
      if (res.url) {
        const nextAboutData = { ...aboutData, profileImage: res.url };
        setAboutData(nextAboutData);
        if (res.compression) {
          setProfileCompressionInfo(res.compression);
        }

        // Persist immediately to Supabase and LocalStorage so it saves without requiring extra button click
        await updateAboutData(nextAboutData);
        showToast("Profile portrait cropped and saved successfully!", "success");
      } else {
        showToast(res.error || "Failed to process cropped profile image", "error");
      }
    } catch (err: any) {
      console.error("Profile crop upload error:", err);
      showToast("Error saving cropped photo: " + (err.message || String(err)), "error");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleResetAbout = () => {
    showConfirm({
      title: "Reset About Page",
      message: "Are you sure you want to restore the default biography, software engineering experiences, and education history?",
      confirmText: "Reset Defaults",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await resetDefaultAboutData();
          setAboutData(res);
          showToast("About page reset to defaults!", "success");
        } catch (err) {
          showToast("Failed to reset about data", "error");
        }
      },
    });
  };

  const handleAddEngineeringExperience = () => {
    const newItem: ExperienceItem = {
      id: `eng-${Date.now()}`,
      role: "Software Engineer",
      company: "Company Name",
      period: "Present",
      description: "Describe your key projects, full-stack systems, or engineering accomplishments.",
    };
    setAboutData((prev) => ({
      ...prev,
      engineeringExperiences: [newItem, ...(prev.engineeringExperiences || [])],
    }));
  };

  const handleUpdateEngineeringExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      engineeringExperiences: (prev.engineeringExperiences || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteEngineeringExperience = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      engineeringExperiences: (prev.engineeringExperiences || []).filter((item) => item.id !== id),
    }));
  };

  const handleAddPhotographyExperience = () => {
    const newItem: ExperienceItem = {
      id: `photo-exp-${Date.now()}`,
      role: "Lead Photographer & Visual Director",
      company: "Studio / Client",
      period: "Present",
      description: "Directing cinematic shoots, commercial portraits, and visual media campaigns.",
    };
    setAboutData((prev) => ({
      ...prev,
      photographyExperiences: [newItem, ...(prev.photographyExperiences || [])],
    }));
  };

  const handleUpdatePhotographyExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      photographyExperiences: (prev.photographyExperiences || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeletePhotographyExperience = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      photographyExperiences: (prev.photographyExperiences || []).filter((item) => item.id !== id),
    }));
  };

  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: "Degree / Certification Title",
      institution: "University / Institute Name",
      status: "Reading",
    };
    setAboutData((prev) => ({
      ...prev,
      educationHistory: [newItem, ...(prev.educationHistory || [])],
    }));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      educationHistory: (prev.educationHistory || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteEducation = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      educationHistory: (prev.educationHistory || []).filter((item) => item.id !== id),
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Filtered Lists for Workspace Search
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = p.title?.toLowerCase().includes(q);
    const matchDesc = p.description?.toLowerCase().includes(q);
    const matchCategory = p.category?.toLowerCase().includes(q);
    const techStr = Array.isArray(p.tech) ? p.tech.join(" ") : (p.tech || "");
    const matchTech = techStr.toLowerCase().includes(q);
    return matchTitle || matchDesc || matchCategory || matchTech;
  });

  const filteredPhotos = photos.filter((photo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      photo.title?.toLowerCase().includes(q) ||
      photo.category?.toLowerCase().includes(q) ||
      photo.description?.toLowerCase().includes(q)
    );
  });

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(q) ||
      msg.email?.toLowerCase().includes(q) ||
      msg.message?.toLowerCase().includes(q)
    );
  });

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    projects: {
      title: "Projects",
      subtitle: "Engineering case studies, technical architecture, and live demo links.",
    },
    photography: {
      title: "Photography Showcase",
      subtitle: "Curate visual stories, manage public gallery visibility, and sync cloud media.",
    },
    about: {
      title: "About Page",
      subtitle: "Customize your profile portrait, dual bio, career timeline, and academic credentials.",
    },
    messages: {
      title: "Inbox",
      subtitle: "Client inquiries, partnership requests, and portfolio messages.",
    },
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between overflow-y-auto pr-0.5">
      <div className="space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-2xl hover:bg-gray-50 transition-colors">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight truncate">Tharusha Kawshalya</h2>
            <p className="text-[11px] text-gray-400 font-medium truncate">Product Studio • Admin</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="System Online" />
        </div>

        {/* Search Bar (Linear/Notion style) */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search console..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-12 py-2 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-gray-300 outline-none transition-all placeholder:text-gray-400 font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-black cursor-pointer"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-white/80 border border-gray-200 px-1 py-0.5 rounded">
              ⌘K
            </span>
          )}
        </div>

        {/* Section 1: Essentials Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2.5 mb-1.5">
            Essentials
          </p>

          <button
            onClick={() => { setActiveTab("projects"); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-gray-100 text-black shadow-xs font-bold"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen size={16} className={activeTab === "projects" ? "text-black" : "text-gray-400"} />
              <span>Projects</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-700">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("photography"); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "photography"
                ? "bg-gray-100 text-black shadow-xs font-bold"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Camera size={16} className={activeTab === "photography" ? "text-black" : "text-gray-400"} />
              <span>Photography</span>
            </div>
            <div className="flex items-center gap-1.5">
              {photoSettings.show_photography ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live on site" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" title="Hidden" />
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-700">
                {photos.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab("about"); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-gray-100 text-black shadow-xs font-bold"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User size={16} className={activeTab === "about" ? "text-black" : "text-gray-400"} />
              <span>About Page</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200/70">
              Live
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("messages"); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-gray-100 text-black shadow-xs font-bold"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox size={16} className={activeTab === "messages" ? "text-black" : "text-gray-400"} />
              <span>Messages</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black text-white">
              {messages.length}
            </span>
          </button>
        </div>

        {/* Section 2: Live Portfolio Links */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2.5 mb-1.5">
            Live Portfolio
          </p>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <span>Portfolio Home</span>
            <ArrowUpRight size={13} className="text-gray-400" />
          </a>

          <a
            href="/photography"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <span>Photography Page</span>
            <ArrowUpRight size={13} className="text-gray-400" />
          </a>

          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <span>About Page</span>
            <ArrowUpRight size={13} className="text-gray-400" />
          </a>
        </div>

        {/* Section 3: Supabase Cloud Status Card */}
        <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={13} className={cloudStatus.connected ? "text-emerald-600" : "text-amber-500"} />
              <span className="text-xs font-semibold text-gray-800">Supabase Cloud</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              cloudStatus.connected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {cloudStatus.connected ? "Synced" : "Local"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
            <span>Database</span>
            <button
              onClick={checkCloud}
              disabled={cloudStatus.checking}
              className="text-black hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} className={cloudStatus.checking ? "animate-spin" : ""} />
              {cloudStatus.checking ? "Checking" : "Verify"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer: User Card & Logout */}
      <div className="pt-4 border-t border-gray-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
            <ShieldCheck size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">Admin Console</p>
            <p className="text-[10px] text-gray-400">Authorized Session</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col lg:flex-row font-sans text-gray-900">
      
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-gray-200/80 flex-col h-screen sticky top-0 z-40 p-4 shadow-[1px_0_5px_rgba(0,0,0,0.02)] select-none overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 p-4 flex flex-col overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE / CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
              <span className="hidden sm:inline">Workspace</span>
              <ChevronRight size={12} className="hidden sm:inline text-gray-400 shrink-0" />
              <span className="font-bold text-gray-900 capitalize truncate">{tabTitles[activeTab]?.title || activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View Site</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </header>

        {/* Page Content Body: Generous professional side padding for dashboard workspace */}
        <main className="flex-1 w-full px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 py-8 space-y-8">
          
          {/* Page Heading matching the reference screenshot */}
          <div className="pb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {tabTitles[activeTab]?.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {tabTitles[activeTab]?.subtitle}
            </p>
          </div>

          {/* TAB 1: PROJECTS */}
        {/* ==================================================================== */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* EDITOR FORM */}
            <div className="xl:col-span-4 2xl:col-span-3 order-1">
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
            <div className="xl:col-span-8 2xl:col-span-9 order-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FolderOpen size={20} /> Managed Projects ({filteredProjects.length})</h2>
                {filteredProjects.length === 0 ? <p className="text-gray-400">No projects found.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filteredProjects.map((p, index) => (
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
            
            {/* 1. UNIFIED PHOTOGRAPHY CONTROL BAR (Minimal, Modern, Clutter-Free) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 sm:space-y-4"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${photoSettings.show_photography ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
                    {photoSettings.show_photography ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-black truncate">Photography Section</h2>
                      
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        photoSettings.show_photography ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {photoSettings.show_photography ? "Live on Site" : "Hidden"}
                      </span>

                      {/* Cloud Sync Status Badge */}
                      <span 
                        className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          cloudStatus.connected 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" 
                            : "bg-amber-50 text-amber-700 border border-amber-200/70"
                        }`}
                        title={cloudStatus.connected ? "Database connected — changes sync automatically" : "Supabase setup required"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {cloudStatus.checking ? "Checking..." : cloudStatus.connected ? "Cloud Synced" : "Local Only"}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-none">
                      {photoSettings.show_photography 
                        ? "Visible on Navbar, Footer, and live at /photography for business cards." 
                        : "Hidden from site navigation. Ideal when preparing for technical engineering interviews."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Responsive 2-tier on mobile, single row on desktop */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Primary Toggle: Prominent & full-width on mobile */}
                  <button
                    onClick={handleTogglePhotography}
                    disabled={isTogglingVisibility}
                    className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer order-1 sm:order-2 ${
                      photoSettings.show_photography
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        : "bg-black hover:bg-gray-800 text-white"
                    }`}
                  >
                    {isTogglingVisibility ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : photoSettings.show_photography ? (
                      <>
                        <EyeOff size={13} />
                        <span>Hide Photography</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} />
                        <span>Show Photography</span>
                      </>
                    )}
                  </button>

                  {/* Utility tools: Sits in clean balanced row on mobile */}
                  <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                    {/* Cloud Sync Button */}
                    <button
                      type="button"
                      onClick={handleSyncLocalToCloud}
                      disabled={isSyncingToCloud || !cloudStatus.connected}
                      className={`flex-1 sm:flex-none px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border shadow-xs active:scale-95 cursor-pointer ${
                        cloudStatus.connected
                          ? "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-black"
                          : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      title={cloudStatus.connected ? "Sync photos to Supabase Cloud" : "Connect database first to sync"}
                    >
                      {isSyncingToCloud ? (
                        <Loader2 size={13} className="animate-spin text-black" />
                      ) : (
                        <CloudUpload size={13} className={cloudStatus.connected ? "text-emerald-600" : "text-gray-400"} />
                      )}
                      <span className="whitespace-nowrap">{isSyncingToCloud ? "Syncing..." : "Sync Photos"}</span>
                    </button>

                    {/* Re-verify Connection */}
                    <button
                      type="button"
                      onClick={checkCloud}
                      disabled={cloudStatus.checking}
                      className="p-2 sm:p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-black transition-colors cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Check Supabase Connection"
                    >
                      <RefreshCw size={13} className={cloudStatus.checking ? "animate-spin text-emerald-600" : ""} />
                    </button>

                    {/* Preview Page */}
                    <a 
                      href="/photography" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-black transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs"
                      title="Preview Photography Page"
                    >
                      <ExternalLink size={13} />
                      <span className="sm:hidden">Preview</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Only shown if database connection is NOT yet set up */}
              {!cloudStatus.connected && (
                <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 bg-amber-50/60 -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-amber-600 flex-shrink-0" />
                    <span>Database tables not detected. Run SQL setup to enable live multi-device sync.</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedSql ? "Copied" : "Copy SQL Script"}
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/vzagyiaonezntryzbxkm/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-gray-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ExternalLink size={12} />
                      Open Supabase SQL
                    </a>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 2. MAIN PHOTOGRAPHY GRID: Photo Editor Form (Left) & Gallery Manager (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Photo Upload / Edit Form */}
              <div className="xl:col-span-4 2xl:col-span-3">
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

                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        type="submit" 
                        disabled={isPhotoSubmitting || isCompressing}
                        className="flex-1 min-w-0 bg-black text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex justify-center items-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        {isPhotoSubmitting ? (
                          <><Loader2 className="animate-spin" size={16} /> Saving...</>
                        ) : (
                          editingPhotoId ? "Save Changes" : "Add to Gallery"
                        )}
                      </button>

                      {editingPhotoId && (
                        <button 
                          type="button" 
                          onClick={handleCancelPhotoEdit} 
                          className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-300 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: Pure Focus on Showcase Gallery Manager */}
              <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Camera size={20} /> Showcase Gallery ({filteredPhotos.length} {filteredPhotos.length === 1 ? "photo" : "photos"})
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Add as many photos as you want without limits. Drag to reorder, edit, or delete at any time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {photos.length > 0 && (
                      <button
                        onClick={handleClearAllPhotos}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        title="Remove all photos to start fresh with your own uploads"
                      >
                        Clear All Photos
                      </button>
                    )}
                    <button
                      onClick={handleResetDefaultPhotos}
                      className="text-xs font-semibold text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      title="Reset gallery with default sample photos"
                    >
                      Restore Samples
                    </button>
                  </div>
                </div>

                {filteredPhotos.length === 0 ? (
                  <div className="p-8 text-center bg-white/40 rounded-2xl border border-gray-200 text-gray-400">
                    No photos found in showcase.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filteredPhotos.map((photo, index) => (
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
        {/* TAB 3: ABOUT PAGE CUSTOMIZATION */}
        {/* ==================================================================== */}
        {activeTab === "about" && (
          <div className="space-y-8">
            {/* Top Control Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-black text-white shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-black truncate">About Page Customization</h2>
                    <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      Live Editable
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-none">
                    Customize your profile portrait, headline, engineering experience, photography track, and education.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Responsive 2-tier on mobile, single row on desktop */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Mobile: Full-width Save Changes */}
                <button
                  type="button"
                  onClick={() => handleSaveAbout()}
                  disabled={isSavingAbout}
                  className="w-full sm:w-auto px-5 py-2 sm:py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer order-1 sm:order-2 whitespace-nowrap"
                >
                  {isSavingAbout ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} className="text-emerald-400" />}
                  <span>{isSavingAbout ? "Saving..." : "Save Changes"}</span>
                </button>

                {/* Mobile: Row 2 with Reset & Preview */}
                <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                  <button
                    type="button"
                    onClick={handleResetAbout}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shadow-xs"
                    title="Restore default sample information"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Defaults</span>
                  </button>

                  <a
                    href="/about"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-black transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs"
                    title="Preview About Page"
                  >
                    <ExternalLink size={13} />
                    <span className="sm:hidden">Preview</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Grid 1: Profile Portrait & Biography */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Profile Photo Card */}
              <div className="xl:col-span-4 2xl:col-span-3">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl sticky top-8 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <User size={18} /> Profile Portrait
                  </h3>
                  
                  <div className="relative aspect-[4/5] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm group">
                    {aboutData.profileImage ? (
                      <>
                        <img
                          src={aboutData.profileImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCropperImageSrc(aboutData.profileImage);
                            setIsCropperOpen(true);
                          }}
                          className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs font-semibold text-xs"
                          title="Click to crop or reframe photo"
                        >
                          <Crop size={22} className="text-white" />
                          <span>Crop & Reframe</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                        <User size={36} className="mb-2 opacity-50" />
                        No photo set
                      </div>
                    )}
                  </div>

                  {aboutData.profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCropperImageSrc(aboutData.profileImage);
                        setIsCropperOpen(true);
                      }}
                      className="w-full max-w-[240px] mx-auto text-xs font-bold text-gray-700 hover:text-black bg-white hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Crop size={14} />
                      <span>Crop / Reframe Current Photo</span>
                    </button>
                  )}

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase text-gray-500">
                          Upload New Portrait:
                        </label>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Auto-opens Cropper
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileFileChange}
                        className="w-full bg-white/70 p-2 rounded-xl border border-gray-200 text-xs file:mr-2.5 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                      />
                      {isUploadingProfile && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-2">
                          <Loader2 size={13} className="animate-spin text-black" /> Auto-compressing & uploading...
                        </div>
                      )}
                      {profileCompressionInfo && !isUploadingProfile && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <Check size={12} /> Auto-compressed: {profileCompressionInfo.originalKB} KB ➔ {profileCompressionInfo.compressedKB} KB ({profileCompressionInfo.savings}% smaller WebP)
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Or Image URL:
                      </label>
                      <input
                        type="text"
                        value={aboutData.profileImage}
                        onChange={(e) => setAboutData({ ...aboutData, profileImage: e.target.value })}
                        placeholder="/profile.webp or https://..."
                        className="w-full bg-white/70 p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-black font-mono text-gray-700"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Biography & Headlines */}
              <div className="xl:col-span-8 2xl:col-span-9">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl space-y-5">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles size={18} /> Headline & Biography
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={aboutData.fullName}
                        onChange={(e) => setAboutData({ ...aboutData, fullName: e.target.value })}
                        className="w-full bg-white/70 p-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-black"
                        placeholder="Edirithanthiri Tharusha Kawshalya"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Headline Prefix</label>
                      <input
                        type="text"
                        value={aboutData.headlinePrefix}
                        onChange={(e) => setAboutData({ ...aboutData, headlinePrefix: e.target.value })}
                        className="w-full bg-white/70 p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-black"
                        placeholder="Software Engineer &"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Creative Headline (Photography Mode ON)
                      </label>
                      <input
                        type="text"
                        value={aboutData.headlineCreative}
                        onChange={(e) => setAboutData({ ...aboutData, headlineCreative: e.target.value })}
                        className="w-full bg-white/70 p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-black"
                        placeholder="Visual Director & Photographer."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Standard Headline (Interview Mode)
                      </label>
                      <input
                        type="text"
                        value={aboutData.headlineStandard}
                        onChange={(e) => setAboutData({ ...aboutData, headlineStandard: e.target.value })}
                        className="w-full bg-white/70 p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-black"
                        placeholder="Creative Designer."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Bio Text (When Photography Mode is ON)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutData.bioPhotography}
                      onChange={(e) => setAboutData({ ...aboutData, bioPhotography: e.target.value })}
                      className="w-full bg-white/70 p-3 rounded-xl border border-gray-200 text-sm leading-relaxed outline-none focus:border-black"
                      placeholder="I'm Edirithanthiri Tharusha Kawshalya. I bridge the gap between complex backend logic, fluid user interfaces, and cinematic visual storytelling."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Bio Text (When Interview Mode / Photography Hidden)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutData.bioStandard}
                      onChange={(e) => setAboutData({ ...aboutData, bioStandard: e.target.value })}
                      className="w-full bg-white/70 p-3 rounded-xl border border-gray-200 text-sm leading-relaxed outline-none focus:border-black"
                      placeholder="I'm Edirithanthiri Tharusha Kawshalya. I bridge the gap between complex backend logic, fluid user interfaces. Applying my engineering skills in the real world to build robust digital solutions."
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 2: Software Engineering Experience */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase size={20} /> Software Engineering Experience ({aboutData.engineeringExperiences?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Chronological career positions, roles, and technical project responsibilities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEngineeringExperience}
                  className="bg-black hover:bg-gray-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {(!aboutData.engineeringExperiences || aboutData.engineeringExperiences.length === 0) ? (
                <div className="p-8 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  No engineering roles added yet. Click &quot;Add Role&quot; above to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {aboutData.engineeringExperiences.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="bg-white/80 p-5 rounded-2xl border border-gray-200 shadow-xs relative flex flex-col justify-between gap-3 group hover:border-gray-300 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteEngineeringExperience(exp.id)}
                        className="absolute top-3.5 right-3.5 text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="space-y-3 pr-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Role / Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdateEngineeringExperience(exp.id, "role", e.target.value)}
                            className="w-full font-bold text-sm bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                            placeholder="Junior Developer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateEngineeringExperience(exp.id, "company", e.target.value)}
                              className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                              placeholder="Arcforth"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Period / Status</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => handleUpdateEngineeringExperience(exp.id, "period", e.target.value)}
                              className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                              placeholder="Present"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Description</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => handleUpdateEngineeringExperience(exp.id, "description", e.target.value)}
                            className="w-full text-xs text-gray-600 bg-gray-50/70 p-2 rounded-lg border border-gray-200 focus:border-black outline-none leading-relaxed"
                            placeholder="Describe your engineering impact..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Section 3: Professional Photography & Visual Media Experiences */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Camera size={20} /> Professional Photography & Media Experiences ({aboutData.photographyExperiences?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Studio direction, cinematic videography, and commercial portraiture background (displayed when photography is live).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPhotographyExperience}
                  className="bg-black hover:bg-gray-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Add Media Experience
                </button>
              </div>

              {(!aboutData.photographyExperiences || aboutData.photographyExperiences.length === 0) ? (
                <div className="p-8 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  No media roles added yet. Click &quot;Add Media Experience&quot; above to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {aboutData.photographyExperiences.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="bg-white/80 p-5 rounded-2xl border border-gray-200 shadow-xs relative flex flex-col justify-between gap-3 group hover:border-gray-300 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeletePhotographyExperience(exp.id)}
                        className="absolute top-3.5 right-3.5 text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="space-y-3 pr-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Role / Position</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdatePhotographyExperience(exp.id, "role", e.target.value)}
                            className="w-full font-bold text-sm bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                            placeholder="Lead Photographer & Videographer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Studio / Client</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdatePhotographyExperience(exp.id, "company", e.target.value)}
                              className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                              placeholder="Studio Zine"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Period / Status</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => handleUpdatePhotographyExperience(exp.id, "period", e.target.value)}
                              className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                              placeholder="Present"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Description</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => handleUpdatePhotographyExperience(exp.id, "description", e.target.value)}
                            className="w-full text-xs text-gray-600 bg-gray-50/70 p-2 rounded-lg border border-gray-200 focus:border-black outline-none leading-relaxed"
                            placeholder="Directing visual media productions..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Section 4: Education History */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <GraduationCap size={20} /> Education History ({aboutData.educationHistory?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Academic qualifications, university degrees, and educational foundation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="bg-black hover:bg-gray-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {(!aboutData.educationHistory || aboutData.educationHistory.length === 0) ? (
                <div className="p-8 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  No education items added yet. Click &quot;Add Education&quot; above to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {aboutData.educationHistory.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="bg-white/80 p-5 rounded-2xl border border-gray-200 shadow-xs relative flex flex-col justify-between gap-3 group hover:border-gray-300 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="absolute top-3.5 right-3.5 text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="space-y-3 pr-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Degree / Title</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                            className="w-full font-bold text-sm bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                            placeholder="BSc Computer Science"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Institution / University</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                            className="w-full text-xs text-gray-700 font-medium bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                            placeholder="University of Westminster"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Status / Years</label>
                          <input
                            type="text"
                            value={edu.status}
                            onChange={(e) => handleUpdateEducation(edu.id, "status", e.target.value)}
                            className="w-full text-xs font-bold uppercase tracking-wider text-gray-500 bg-transparent border-b border-gray-200 focus:border-black outline-none pb-0.5"
                            placeholder="Reading"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bottom Floating/Fixed Save Bar */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200/80">
              <button
                type="button"
                onClick={handleResetAbout}
                className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => handleSaveAbout()}
                disabled={isSavingAbout}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                {isSavingAbout ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                <span>{isSavingAbout ? "Saving Changes..." : "Save All Changes"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: MESSAGES */}
        {/* ==================================================================== */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-4xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} /> Contact Inbox</h2>
            {filteredMessages.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No messages found.</p>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative">
                  <button onClick={() => handleDelete("messages", msg.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 cursor-pointer transition-colors"><Trash2 size={18} /></button>
                  <h3 className="font-bold text-lg pr-8">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 block mb-2">{msg.email}</a>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        </main>
      </div>

      {/* Interactive Profile Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleProfileCropComplete}
        aspectRatioPreset={4 / 5}
      />
    </div>
  );
}