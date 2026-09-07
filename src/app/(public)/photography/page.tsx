"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Camera, ArrowRight, ExternalLink, X, ChevronLeft, ChevronRight, 
  Sparkles, Layers, Aperture, Sliders, Mail, ArrowUpRight,
  Shield, Code2, Calendar
} from "lucide-react";
import { 
  getPhotographySettings, 
  getPhotographyPhotos, 
  PhotographyPhoto, 
  PhotographySettings, 
  DEFAULT_SETTINGS 
} from "@/lib/photography";

export default function PhotographyPage() {
  const [settings, setSettings] = useState<PhotographySettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<PhotographyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const s = await getPhotographySettings();
        setSettings(s);
        const p = await getPhotographyPhotos();
        setPhotos(p);
      } catch (err) {
        console.error("Error loading photography data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const handleSettingsChange = (e: any) => {
      if (e?.detail) setSettings(e.detail);
      else loadData();
    };

    window.addEventListener("site-settings-changed", handleSettingsChange);
    window.addEventListener("photography-photos-changed", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsChange);
      window.removeEventListener("photography-photos-changed", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Filter Categories
  const categories = ["All", ...Array.from(new Set(photos.map((p) => p.category)))];

  const filteredPhotos = activeCategory === "All"
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activePhotoIndex === null) return;
    if (e.key === "Escape") setActivePhotoIndex(null);
    if (e.key === "ArrowRight") {
      setActivePhotoIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
    }
    if (e.key === "ArrowLeft") {
      setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
    }
  }, [activePhotoIndex, filteredPhotos.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // If photography is toggled off in admin: Show elegant "Engineering Focus Mode"
  if (!loading && !settings.show_photography) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl max-w-xl mx-auto shadow-xl"
        >
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Code2 size={28} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
            Portfolio Mode: Technical Focus
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-black">
            Engineering & Software Showcase
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed">
            The visual arts and photography section is temporarily private while I focus on software engineering discussions and technical interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/projects" 
              className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-black/10"
            >
              Explore Software Projects <ArrowRight size={16} />
            </Link>
            <Link 
              href="/" 
              className="bg-white border border-gray-200 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* ==================================================================== */}
        {/* HERO SECTION */}
        {/* ==================================================================== */}
        <section className="text-center max-w-3xl mx-auto mb-16 pt-4 md:pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/70 border border-gray-200/80 px-4 py-2 rounded-full mb-6 shadow-sm backdrop-blur-md"
          >
            <Camera size={15} className="text-black" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Professional Photography & Visual Direction
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black mb-6 leading-[1.15]"
          >
            Capturing Moments. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-600 to-black">
              Sculpting Light.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8"
          >
            {settings.tagline || "Exploring visual rhythm, editorial portraiture, and candid street geometry through a cinematic lens."}
          </motion.p>

          {/* Social Channels (TikTok & Facebook) + Contact CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            {settings.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                <span>Follow on TikTok</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}

            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-200 text-black px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook Page</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}

            <a
              href="https://www.primeevokeofficial.com/studio-zine/book"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer group"
            >
              <Calendar size={16} />
              <span>Inquire for Shoot</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Quick Creative Highlights */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-gray-200/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Aperture size={14} className="text-black" /> Prime Lenses & 35mm</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><Sliders size={14} className="text-black" /> Color Grading & Retouch</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-black" /> High Dynamic Range</span>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* CATEGORY FILTER TABS */}
        {/* ==================================================================== */}
        <div className="flex overflow-x-auto pb-4 mb-8 md:mb-12 gap-2.5 no-scrollbar justify-start md:justify-center px-2">
          {categories.map((cat) => {
            const count = cat === "All" ? photos.length : photos.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all flex-shrink-0 cursor-pointer flex items-center gap-2 ${
                  activeCategory === cat
                    ? "bg-black text-white shadow-lg scale-105"
                    : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-white hover:text-black"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  activeCategory === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* GALLERY SHOWCASE */}
        {/* ==================================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Camera size={48} className="mx-auto mb-4" />
            <p className="text-xl font-bold">No photos found in this category.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  layout
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActivePhotoIndex(index)}
                  className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200/50"
                >
                  {/* Photo Image */}
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-2 text-white/90">
                      {photo.category}
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight mb-1 text-white">
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed opacity-90">
                        {photo.description}
                      </p>
                    )}
                    <span className="text-[11px] text-white/70 mt-3 flex items-center gap-1 font-medium">
                      Click to view full frame <ArrowRight size={12} />
                    </span>
                  </div>

                  {/* Category Tag pill (Top Right) */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold md:group-hover:opacity-0 transition-opacity">
                    {photo.category}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ==================================================================== */}
        {/* BOTTOM BOOKING / INQUIRY CALLOUT */}
        {/* ==================================================================== */}
        <div className="mt-20 glass-panel p-8 md:p-12 rounded-[2.5rem] border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Bookings & Inquiries
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-black">
                Have a creative vision or photoshoot in mind?
              </h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Available for portrait sessions, event coverage, brand campaigns, and creative editorial collaborations. Let’s capture something unforgettable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="https://www.primeevokeofficial.com/studio-zine/book"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-black/10 cursor-pointer group"
              >
                <span>Book a Shoot</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              {settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 text-black px-6 py-4 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* INTERACTIVE FULLSCREEN LIGHTBOX MODAL */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {activePhotoIndex !== null && filteredPhotos[activePhotoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
          >
            {/* Top Bar: Title & Close Button */}
            <div className="flex justify-between items-center text-white z-10">
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-300">
                  {activePhotoIndex + 1} / {filteredPhotos.length}
                </span>
                <span className="text-sm font-semibold text-gray-400 hidden sm:inline">
                  {filteredPhotos[activePhotoIndex].category}
                </span>
              </div>

              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
                title="Close (Esc)"
              >
                <X size={24} />
              </button>
            </div>

            {/* Central Image with Prev / Next Navigation */}
            <div className="relative flex-grow flex items-center justify-center my-4 overflow-hidden">
              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
                }}
                className="absolute left-2 md:left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-20 cursor-pointer"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Main Photo */}
              <motion.div
                key={filteredPhotos[activePhotoIndex].id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="max-h-[75vh] max-w-full flex items-center justify-center"
              >
                <img
                  src={filteredPhotos[activePhotoIndex].image}
                  alt={filteredPhotos[activePhotoIndex].title}
                  className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 md:right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-20 cursor-pointer"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Caption Bar */}
            <div className="text-center max-w-2xl mx-auto text-white space-y-1 z-10">
              <h4 className="text-lg font-bold text-white tracking-wide">
                {filteredPhotos[activePhotoIndex].title}
              </h4>
              {filteredPhotos[activePhotoIndex].description && (
                <p className="text-xs md:text-sm text-gray-400">
                  {filteredPhotos[activePhotoIndex].description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
