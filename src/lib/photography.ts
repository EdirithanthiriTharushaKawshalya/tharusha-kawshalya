import { supabase } from "@/lib/supabase";

export interface PhotographyPhoto {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
  sort_order?: number;
  created_at?: string;
}

export interface PhotographySettings {
  show_photography: boolean;
  tiktok_url: string;
  facebook_url: string;
  tagline?: string;
  updated_at?: string;
}

export const DEFAULT_SETTINGS: PhotographySettings = {
  show_photography: true,
  tiktok_url: "https://www.tiktok.com/@tkedirithanthiri?_r=1&_t=ZS-99XMs48xnm9",
  facebook_url: "https://www.facebook.com/share/18KDu9sEeb/",
  tagline: "Exploring visual rhythm, editorial portraiture, and candid street geometry through a cinematic lens.",
};

// Sample initial showcase photos (freely editable and unlimited)
export const DEFAULT_PHOTOS: PhotographyPhoto[] = [
  {
    id: "photo-1",
    title: "Golden Hour Noir",
    category: "Portraits",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    description: "Cinematic natural light portrait exploring high-contrast rim lighting and deep tones.",
    sort_order: 0,
    created_at: new Date(Date.now() - 10000).toISOString(),
  },
  {
    id: "photo-2",
    title: "Echoes of the Concrete",
    category: "Street",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop",
    description: "Urban architecture and solitary movement caught during overcast twilight.",
    sort_order: 1,
    created_at: new Date(Date.now() - 9000).toISOString(),
  },
  {
    id: "photo-3",
    title: "Studio Monochrome",
    category: "Studio",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    description: "Precision key-light study focusing on organic contours and editorial poise.",
    sort_order: 2,
    created_at: new Date(Date.now() - 8000).toISOString(),
  },
  {
    id: "photo-4",
    title: "Midnight Reflections",
    category: "Street",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    description: "Neon hues reflecting across damp asphalt, framing nighttime city life.",
    sort_order: 3,
    created_at: new Date(Date.now() - 7000).toISOString(),
  },
  {
    id: "photo-5",
    title: "Ephemeral Serenity",
    category: "Portraits",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    description: "Intimate candid portrait capturing unposed emotions and soft ambient glow.",
    sort_order: 4,
    created_at: new Date(Date.now() - 6000).toISOString(),
  },
  {
    id: "photo-6",
    title: "Velocity & Shadow",
    category: "Automotive",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
    description: "Sculpted aerodynamic curves highlighted by minimalist directional lighting.",
    sort_order: 5,
    created_at: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: "photo-7",
    title: "Stage & Rhythm",
    category: "Events",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    description: "Capturing raw concert energy and vibrant stage illumination in low light.",
    sort_order: 6,
    created_at: new Date(Date.now() - 4000).toISOString(),
  },
  {
    id: "photo-8",
    title: "Mist Over Solitude",
    category: "Landscape",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    description: "Morning mountain mist unveiling dramatic pine silhouettes and calm reflections.",
    sort_order: 7,
    created_at: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: "photo-9",
    title: "Chiaroscuro Muse",
    category: "Studio",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    description: "Dramatic play of intense light and deep shadows on delicate textures.",
    sort_order: 8,
    created_at: new Date(Date.now() - 2000).toISOString(),
  },
  {
    id: "photo-10",
    title: "The Commute",
    category: "Street",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=1200&auto=format&fit=crop",
    description: "Geometric harmony and natural pacing in metropolitan commute corridors.",
    sort_order: 9,
    created_at: new Date(Date.now() - 1000).toISOString(),
  },
];

const SETTINGS_STORAGE_KEY = "tk_photography_settings";
const PHOTOS_STORAGE_KEY = "tk_photography_photos";
const PHOTOS_INITIALIZED_KEY = "tk_photography_initialized_v2";

// In-Memory SWR Caching
let memorySettingsCache: PhotographySettings | null = null;
let memorySettingsTime = 0;
let memoryPhotosCache: PhotographyPhoto[] | null = null;
let memoryPhotosTime = 0;
const CACHE_TTL_MS = 45 * 1000; // 45s fresh cache, revalidates in background

/**
 * Fetch photography settings with multi-layer high performance cache:
 * 1. Fast in-memory cache (0ms instant response)
 * 2. LocalStorage cache
 * 3. Supabase `site_settings`
 * 4. Default fallback
 */
export async function getPhotographySettings(): Promise<PhotographySettings> {
  const now = Date.now();
  if (memorySettingsCache && now - memorySettingsTime < CACHE_TTL_MS) {
    return memorySettingsCache;
  }

  let localSetting: PhotographySettings | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        localSetting = JSON.parse(stored);
        if (localSetting) {
          memorySettingsCache = localSetting;
          memorySettingsTime = now;
        }
      }
    } catch {
      // ignore
    }
  }

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "photography_settings")
      .maybeSingle();

    if (!error && data?.value) {
      const merged = { ...DEFAULT_SETTINGS, ...data.value };
      memorySettingsCache = merged;
      memorySettingsTime = Date.now();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
      return merged;
    }
  } catch (err) {
    console.warn("Could not query Supabase site_settings, using fallback:", err);
  }

  return memorySettingsCache || localSetting || DEFAULT_SETTINGS;
}

/**
 * Save photography settings to Supabase and sync with localStorage.
 */
export async function updatePhotographySettings(
  newSettings: Partial<PhotographySettings>
): Promise<PhotographySettings> {
  const current = await getPhotographySettings();
  const updated: PhotographySettings = {
    ...current,
    ...newSettings,
    updated_at: new Date().toISOString(),
  };

  memorySettingsCache = updated;
  memorySettingsTime = Date.now();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    } catch {
      // ignore
    }
  }

  try {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: "photography_settings",
        value: updated,
        updated_at: updated.updated_at,
      },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("Supabase site_settings upsert error (fallback saved in localStorage):", error.message);
    }
  } catch (err) {
    console.warn("Could not upsert into Supabase site_settings:", err);
  }

  return updated;
}

/**
 * Fetch photography photos:
 * 1. Fast in-memory cache (0ms instant response)
 * 2. LocalStorage cache
 * 3. Supabase `photography_photos`
 * 4. Default 10 showcase photos if never initialized
 */
export async function getPhotographyPhotos(): Promise<PhotographyPhoto[]> {
  const now = Date.now();
  if (memoryPhotosCache && memoryPhotosCache.length > 0 && now - memoryPhotosTime < CACHE_TTL_MS) {
    return memoryPhotosCache;
  }

  // 1. Try LocalStorage for immediate paint
  if (typeof window !== "undefined") {
    try {
      const isInitialized = localStorage.getItem(PHOTOS_INITIALIZED_KEY);
      const stored = localStorage.getItem(PHOTOS_STORAGE_KEY);
      
      if (isInitialized && stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryPhotosCache = parsed;
          memoryPhotosTime = now;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from("photography_photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      memoryPhotosCache = data;
      memoryPhotosTime = Date.now();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
        } catch {
          // ignore
        }
      }
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch photos from Supabase, checking local cache:", err);
  }

  if (memoryPhotosCache && memoryPhotosCache.length > 0) {
    return memoryPhotosCache;
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(DEFAULT_PHOTOS));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      memoryPhotosCache = DEFAULT_PHOTOS;
      memoryPhotosTime = Date.now();
      return DEFAULT_PHOTOS;
    } catch {
      // ignore
    }
  }

  return DEFAULT_PHOTOS;
}

/**
 * Automatically compresses an image file before upload.
 * Resizes max dimension to 2048px (pin-sharp for 4K / Retina screens)
 * and encodes to WebP format, drastically reducing size (e.g. 10MB -> 300KB)
 * while maintaining professional visual fidelity.
 */
export async function compressImage(
  file: File,
  maxDimension = 2048,
  quality = 0.85
): Promise<{ file: File; originalSize: number; compressedSize: number; savingsPercent: number }> {
  const originalSize = file.size;

  // Skip SVG or already very small files (< 150KB)
  if (file.type === "image/svg+xml" || file.size < 150 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: 0,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ file, originalSize, compressedSize: originalSize, savingsPercent: 0 });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= originalSize) {
            resolve({ file, originalSize, compressedSize: originalSize, savingsPercent: 0 });
            return;
          }
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const compressedFile = new File([blob], newFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });
          const savings = Math.round(((originalSize - blob.size) / originalSize) * 100);
          resolve({
            file: compressedFile,
            originalSize,
            compressedSize: blob.size,
            savingsPercent: savings,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, originalSize, compressedSize: originalSize, savingsPercent: 0 });
    };

    img.src = objectUrl;
  });
}

/**
 * Upload helper: auto-compresses image before upload to Supabase storage bucket 'projects',
 * falls back to FileReader base64.
 */
async function uploadImageFile(imageFile: File): Promise<string> {
  // 1. Auto-compress file before upload
  const { file: optimizedFile } = await compressImage(imageFile);

  try {
    const fileExt = optimizedFile.name.split(".").pop() || "webp";
    const fileName = `photo_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(filePath, optimizedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("projects")
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) return urlData.publicUrl;
    }
  } catch (err) {
    console.warn("Storage upload failed, reading file as data URL:", err);
  }

  // Fallback: Read as base64 Data URL so it ALWAYS works reliably
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(optimizedFile);
  });
}

/**
 * Save or Edit a photography photo.
 * Supports unlimited photos across categories.
 */
export async function savePhotographyPhoto(
  photoData: Partial<PhotographyPhoto> & { title: string; image: string },
  imageFile?: File | null
): Promise<{ success: boolean; data?: PhotographyPhoto; error?: string; isCloudSynced?: boolean }> {
  try {
    let finalImageUrl = photoData.image;

    // Handle file upload if a new file was provided
    if (imageFile) {
      finalImageUrl = await uploadImageFile(imageFile);
    }

    if (!finalImageUrl) {
      return { success: false, error: "Please provide an image" };
    }

    const currentPhotos = await getPhotographyPhotos();
    const targetId = photoData.id;

    const payload = {
      title: photoData.title.trim(),
      category: photoData.category || "Portraits",
      image: finalImageUrl,
      description: photoData.description || "",
      sort_order: photoData.sort_order ?? currentPhotos.length,
    };

    let savedPhoto: PhotographyPhoto;
    let isCloudSynced = false;

    if (targetId) {
      // EDIT EXISTING PHOTO
      savedPhoto = {
        id: targetId,
        ...payload,
        created_at: photoData.created_at || new Date().toISOString(),
      };

      // Try updating in Supabase
      try {
        const { error: sbErr } = await supabase
          .from("photography_photos")
          .upsert({ id: targetId, ...payload });
        if (!sbErr) isCloudSynced = true;
      } catch (sbErr) {
        console.warn("Supabase photo upsert warning:", sbErr);
      }

      // Update in Local Storage list
      const updatedList = currentPhotos.map((p) => (p.id === targetId ? savedPhoto : p));
      if (typeof window !== "undefined") {
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedList));
        localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
        window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: updatedList }));
      }

      return { success: true, data: savedPhoto, isCloudSynced };
    } else {
      // ADD NEW PHOTO
      const newId = `photo_${Date.now()}`;
      savedPhoto = {
        id: newId,
        ...payload,
        created_at: new Date().toISOString(),
      };

      // Try inserting in Supabase
      try {
        const { data: sbData, error: sbError } = await supabase
          .from("photography_photos")
          .insert([{ id: newId, ...payload }])
          .select()
          .single();

        if (!sbError && sbData) {
          savedPhoto = sbData;
          isCloudSynced = true;
        }
      } catch (sbErr) {
        console.warn("Supabase photo insert warning:", sbErr);
      }

      // Add to Local Storage list
      const updatedList = [savedPhoto, ...currentPhotos];
      memoryPhotosCache = updatedList;
      memoryPhotosTime = Date.now();
      if (typeof window !== "undefined") {
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedList));
        localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
        window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: updatedList }));
      }

      return { success: true, data: savedPhoto, isCloudSynced };
    }
  } catch (err: any) {
    console.error("Error saving photography photo:", err);
    return { success: false, error: err.message || "Failed to save photo" };
  }
}

/**
 * Delete ANY photo from the showcase
 */
export async function deletePhotographyPhoto(id: string): Promise<boolean> {
  // 1. Try delete in Supabase
  try {
    await supabase.from("photography_photos").delete().eq("id", id);
  } catch (err) {
    console.warn("Could not delete from Supabase, removing from local cache:", err);
  }

  // 2. Remove from LocalStorage
  if (typeof window !== "undefined") {
    try {
      const current = await getPhotographyPhotos();
      const filtered = current.filter((p) => p.id !== id);
      memoryPhotosCache = filtered;
      memoryPhotosTime = Date.now();
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(filtered));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: filtered }));
    } catch {
      // ignore
    }
  }
  return true;
}

/**
 * Reorder photography photos and persist order
 */
export async function reorderPhotographyPhotos(photos: PhotographyPhoto[]): Promise<void> {
  const reindexed = photos.map((p, idx) => ({ ...p, sort_order: idx }));
  memoryPhotosCache = reindexed;
  memoryPhotosTime = Date.now();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(reindexed));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: reindexed }));
    } catch {
      // ignore
    }
  }

  try {
    const updates = reindexed.map(async (p) => {
      await supabase
        .from("photography_photos")
        .update({ sort_order: p.sort_order })
        .eq("id", p.id);
    });
    await Promise.all(updates);
  } catch (err) {
    console.warn("Could not update order in Supabase:", err);
  }
}

/**
 * Reset showcase back to default sample photos
 */
export async function resetDefaultPhotos(): Promise<PhotographyPhoto[]> {
  memoryPhotosCache = DEFAULT_PHOTOS;
  memoryPhotosTime = Date.now();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(DEFAULT_PHOTOS));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: DEFAULT_PHOTOS }));
    } catch {
      // ignore
    }
  }
  return DEFAULT_PHOTOS;
}

/**
 * Clear all photos from the gallery showcase
 */
export async function clearAllPhotos(): Promise<boolean> {
  memoryPhotosCache = [];
  memoryPhotosTime = Date.now();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: [] }));
    } catch {
      // ignore
    }
  }

  try {
    await supabase
      .from("photography_photos")
      .delete()
      .neq("id", "none");
  } catch (err) {
    console.warn("Could not clear photos in Supabase:", err);
  }

  return true;
}

export const SQL_SETUP_SCRIPT = `-- ====================================================================
-- Supabase Setup Script for Photography Feature & Site Settings
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create site_settings table (for toggles like show_photography, social links, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_settings
DROP POLICY IF EXISTS "Allow public read on site_settings" ON public.site_settings;
CREATE POLICY "Allow public read on site_settings" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- Allow authenticated users (Admin) full access to update site_settings
DROP POLICY IF EXISTS "Allow authenticated users to manage site_settings" ON public.site_settings;
CREATE POLICY "Allow authenticated users to manage site_settings" 
  ON public.site_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');


-- 2. Create photography_photos table (supports text IDs and UUIDs)
CREATE TABLE IF NOT EXISTS public.photography_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Portraits',
  image TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for photography_photos
ALTER TABLE public.photography_photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to photography photos
DROP POLICY IF EXISTS "Allow public read on photography_photos" ON public.photography_photos;
CREATE POLICY "Allow public read on photography_photos" 
  ON public.photography_photos 
  FOR SELECT 
  USING (true);

-- Allow authenticated users (Admin) full access to insert, update, delete photos
DROP POLICY IF EXISTS "Allow authenticated users to manage photography_photos" ON public.photography_photos;
CREATE POLICY "Allow authenticated users to manage photography_photos" 
  ON public.photography_photos 
  FOR ALL 
  USING (auth.role() = 'authenticated');


-- 3. Storage Policies for 'projects' bucket (ensures photo uploads work smoothly)
DROP POLICY IF EXISTS "Allow authenticated uploads to projects bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to projects bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'projects');

DROP POLICY IF EXISTS "Allow authenticated manage projects bucket" ON storage.objects;
CREATE POLICY "Allow authenticated manage projects bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "Allow public read projects bucket" ON storage.objects;
CREATE POLICY "Allow public read projects bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'projects');


-- 4. Initial Default Settings
INSERT INTO public.site_settings (key, value)
VALUES (
  'photography_settings', 
  '{
    "show_photography": true,
    "tiktok_url": "https://www.tiktok.com/@tkedirithanthiri?_r=1&_t=ZS-99XMs48xnm9",
    "facebook_url": "https://www.facebook.com/share/18KDu9sEeb/",
    "tagline": "Exploring visual rhythm, editorial portraiture, and candid street geometry through a cinematic lens."
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
`;

/**
 * Check if the Supabase photography_photos and site_settings tables exist
 */
export async function checkSupabasePhotographyStatus(): Promise<{
  connected: boolean;
  photosTableOk: boolean;
  settingsTableOk: boolean;
  error?: string;
}> {
  let photosTableOk = false;
  let settingsTableOk = false;
  let errorMessage = "";

  try {
    const { error: photoErr } = await supabase
      .from("photography_photos")
      .select("id")
      .limit(1);
    if (!photoErr) {
      photosTableOk = true;
    } else {
      errorMessage = photoErr.message;
    }
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  }

  try {
    const { error: setErr } = await supabase
      .from("site_settings")
      .select("key")
      .limit(1);
    if (!setErr) {
      settingsTableOk = true;
    } else if (!errorMessage) {
      errorMessage = setErr.message;
    }
  } catch (err: any) {
    if (!errorMessage) errorMessage = err?.message || String(err);
  }

  return {
    connected: photosTableOk && settingsTableOk,
    photosTableOk,
    settingsTableOk,
    error: errorMessage || undefined,
  };
}

/**
 * Converts a base64 data URL to a Blob for uploading to Supabase Storage
 */
function base64ToBlob(base64Data: string): { blob: Blob; ext: string } {
  const parts = base64Data.split(";base64,");
  const contentType = (parts[0] ? parts[0].split(":")[1] : "image/webp") || "image/webp";
  const raw = typeof window !== "undefined" ? window.atob(parts[1] || "") : "";
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
    ? "webp"
    : "jpg";

  return { blob: new Blob([uInt8Array], { type: contentType }), ext };
}

/**
 * Syncs all local photos and settings into Supabase.
 * Any base64 images are uploaded to the 'projects' storage bucket.
 * All records are upserted into 'photography_photos'.
 */
export async function syncLocalPhotosToSupabase(): Promise<{
  success: boolean;
  syncedCount: number;
  totalLocalCount: number;
  error?: string;
}> {
  try {
    // 1. Check if tables exist first
    const status = await checkSupabasePhotographyStatus();
    if (!status.connected) {
      return {
        success: false,
        syncedCount: 0,
        totalLocalCount: 0,
        error: status.error || "Supabase tables not found. Please run the SQL setup script first in Supabase SQL Editor.",
      };
    }

    // 2. Fetch local photos
    let localPhotos: PhotographyPhoto[] = [];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PHOTOS_STORAGE_KEY);
      if (stored) {
        try {
          localPhotos = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (localPhotos.length === 0) {
      localPhotos = DEFAULT_PHOTOS;
    }

    let syncedCount = 0;
    const updatedPhotosList: PhotographyPhoto[] = [];

    for (let i = 0; i < localPhotos.length; i++) {
      const p = localPhotos[i];
      let finalImageUrl = p.image;

      // If it's a data URL, upload to storage
      if (finalImageUrl && finalImageUrl.startsWith("data:")) {
        try {
          const { blob, ext } = base64ToBlob(finalImageUrl);
          const fileName = `synced_${Date.now()}_${i}.${ext}`;
          const filePath = `public/${fileName}`;
          const { error: upErr } = await supabase.storage
            .from("projects")
            .upload(filePath, blob, { cacheControl: "3600", upsert: true });

          if (!upErr) {
            const { data: urlData } = supabase.storage
              .from("projects")
              .getPublicUrl(filePath);
            if (urlData?.publicUrl) {
              finalImageUrl = urlData.publicUrl;
            }
          }
        } catch (upErr) {
          console.warn("Could not upload local base64 image to storage:", upErr);
        }
      }

      const photoRecord: PhotographyPhoto = {
        ...p,
        image: finalImageUrl,
        sort_order: p.sort_order ?? i,
      };

      try {
        const { error: upsertErr } = await supabase
          .from("photography_photos")
          .upsert(photoRecord, { onConflict: "id" });

        if (!upsertErr) {
          syncedCount++;
        }
      } catch (upsertErr) {
        console.warn("Could not upsert photo to Supabase:", upsertErr);
      }

      updatedPhotosList.push(photoRecord);
    }

    // Also sync settings
    const currentSettings = await getPhotographySettings();
    await updatePhotographySettings(currentSettings);

    // Update local storage with cleaned URLs
    if (typeof window !== "undefined") {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotosList));
      localStorage.setItem(PHOTOS_INITIALIZED_KEY, "true");
      window.dispatchEvent(new CustomEvent("photography-photos-changed", { detail: updatedPhotosList }));
    }

    return {
      success: true,
      syncedCount,
      totalLocalCount: localPhotos.length,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      totalLocalCount: 0,
      error: err?.message || "Failed to sync photos to Supabase",
    };
  }
}

