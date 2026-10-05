import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/photography";

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  status: string;
}

export interface AboutData {
  headlinePrefix: string;
  headlineCreative: string;
  headlineStandard: string;
  fullName: string;
  bioPhotography: string;
  bioStandard: string;
  profileImage: string;
  engineeringExperiences: ExperienceItem[];
  photographyExperiences: ExperienceItem[];
  educationHistory: EducationItem[];
  updated_at?: string;
}

export const DEFAULT_ABOUT_DATA: AboutData = {
  headlinePrefix: "Software Engineer &",
  headlineCreative: "Visual Director & Photographer.",
  headlineStandard: "Creative Designer.",
  fullName: "Edirithanthiri Tharusha Kawshalya",
  bioPhotography:
    "I’m Edirithanthiri Tharusha Kawshalya. I bridge the gap between complex backend logic, fluid user interfaces, and cinematic visual storytelling.",
  bioStandard:
    "I’m Edirithanthiri Tharusha Kawshalya. I bridge the gap between complex backend logic, fluid user interfaces. Applying my engineering skills in the real world to build robust digital solutions.",
  profileImage: "/profile.webp",
  engineeringExperiences: [
    {
      id: "eng-1",
      role: "Junior Developer",
      company: "Arcforth",
      period: "Present",
      description:
        "Building scalable digital solutions, engineering modern full-stack web applications, and delivering high-quality software.",
    },
    {
      id: "eng-2",
      role: "Intern Software Engineer",
      company: "Syntax Erreur",
      period: "Completed",
      description:
        "Worked on full-stack web applications, modernizing legacy systems, and collaborating with senior engineers to deliver scalable solutions.",
    },
    {
      id: "eng-3",
      role: "Graphic Designer (Part-time)",
      company: "Studio Zine",
      period: "Previous",
      description:
        "Designed marketing materials, social media assets, and brand identities, ensuring high visual standards for client campaigns.",
    },
  ],
  photographyExperiences: [
    {
      id: "photo-exp-1",
      role: "Lead Photographer & Videographer",
      company: "Studio Zine",
      period: "Present",
      description:
        "Directing visual media productions, commercial studio portraiture, cinematic video shoots, and high-end color grading for brand campaigns and private clients.",
    },
    {
      id: "photo-exp-2",
      role: "Lead Photographer",
      company: "Lal Studio",
      period: "Previous",
      description:
        "Spearheaded studio portrait sessions, wedding and event documentation, client photography, lighting choreography, and digital image retouching.",
    },
  ],
  educationHistory: [
    {
      id: "edu-1",
      degree: "BSc Computer Science",
      institution: "University of Westminster",
      status: "Reading",
    },
    {
      id: "edu-2",
      degree: "Foundation for HE",
      institution: "Informatics Institute of Technology",
      status: "Completed",
    },
    {
      id: "edu-3",
      degree: "Primary & Secondary",
      institution: "Dharmasoka College",
      status: "Grade 1 - 11",
    },
  ],
};

const ABOUT_STORAGE_KEY = "tk_about_data";

let memoryAboutCache: AboutData | null = null;
let memoryAboutTime = 0;
const CACHE_TTL_MS = 45 * 1000;

/**
 * Fetch About Page data with multi-layer cache:
 * 1. In-memory cache
 * 2. LocalStorage cache
 * 3. Supabase `site_settings` (key = 'about_data')
 * 4. DEFAULT_ABOUT_DATA fallback
 */
export async function getAboutData(): Promise<AboutData> {
  const now = Date.now();
  if (memoryAboutCache && now - memoryAboutTime < CACHE_TTL_MS) {
    return memoryAboutCache;
  }

  let localData: AboutData | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ABOUT_STORAGE_KEY);
      if (stored) {
        localData = JSON.parse(stored);
        if (localData) {
          memoryAboutCache = localData;
          memoryAboutTime = now;
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
      .eq("key", "about_data")
      .maybeSingle();

    if (!error && data?.value) {
      const merged: AboutData = {
        ...DEFAULT_ABOUT_DATA,
        ...data.value,
        engineeringExperiences: data.value.engineeringExperiences || DEFAULT_ABOUT_DATA.engineeringExperiences,
        photographyExperiences: data.value.photographyExperiences || DEFAULT_ABOUT_DATA.photographyExperiences,
        educationHistory: data.value.educationHistory || DEFAULT_ABOUT_DATA.educationHistory,
      };

      memoryAboutCache = merged;
      memoryAboutTime = Date.now();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
      return merged;
    }
  } catch (err) {
    console.warn("Could not query Supabase for about_data, using fallback:", err);
  }

  return memoryAboutCache || localData || DEFAULT_ABOUT_DATA;
}

/**
 * Save About Page data to Supabase and sync with localStorage & custom events.
 */
export async function updateAboutData(
  newData: Partial<AboutData>
): Promise<AboutData> {
  const current = await getAboutData();
  const updated: AboutData = {
    ...current,
    ...newData,
    updated_at: new Date().toISOString(),
  };

  memoryAboutCache = updated;
  memoryAboutTime = Date.now();

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("about-data-changed", { detail: updated }));
    } catch {
      // ignore
    }
  }

  try {
    await supabase.from("site_settings").upsert(
      {
        key: "about_data",
        value: updated,
        updated_at: updated.updated_at,
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("Could not upsert about_data to Supabase:", err);
  }

  return updated;
}

/**
 * Reset About Page data to original showcase defaults.
 */
export async function resetDefaultAboutData(): Promise<AboutData> {
  return await updateAboutData(DEFAULT_ABOUT_DATA);
}

/**
 * Helper to upload profile photo with auto-compression to Supabase storage
 */
export async function uploadProfilePhoto(
  file: File
): Promise<{ url: string; error?: string; compression?: { originalKB: number; compressedKB: number; savings: number } }> {
  try {
    const { file: compressedFile, originalSize, compressedSize, savingsPercent } = await compressImage(file, 1600, 0.88);
    const fileName = `profile_${Date.now()}.webp`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(filePath, compressedFile, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      // If Supabase upload fails, convert to data URL as fallback so it works offline/locally
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            compression: {
              originalKB: Math.round(originalSize / 1024),
              compressedKB: Math.round(compressedSize / 1024),
              savings: savingsPercent,
            },
          });
        };
        reader.readAsDataURL(compressedFile);
      });
    }

    const { data: urlData } = supabase.storage.from("projects").getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      compression: {
        originalKB: Math.round(originalSize / 1024),
        compressedKB: Math.round(compressedSize / 1024),
        savings: savingsPercent,
      },
    };
  } catch (err: any) {
    console.error("Profile photo upload failed:", err);
    return { url: "", error: err.message || "Failed to upload image" };
  }
}
