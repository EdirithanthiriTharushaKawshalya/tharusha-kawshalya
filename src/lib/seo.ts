export const PERSONAL_INFO = {
  name: "Tharusha Kawshalya",
  fullName: "Edirithanthiri Tharusha Kawshalya",
  alternateNames: [
    "Edirithanthiri Tharusha Kawshalya",
    "Tharusha Kawshalya",
    "Kawshalya Tharusha",
    "Kawshalya.dev",
    "Tharusha K",
  ],
  title: "Software Engineer & Visual Director",
  headline: "Software Engineer & Visual Director | Full-Stack Web & Media Studio",
  bio: "Edirithanthiri Tharusha Kawshalya is a Software Engineer, Full-Stack Web Developer, and Creative Visual Director / Photographer based in Sri Lanka. Studying BSc Computer Science at the University of Westminster, working with modern cloud architectures, Next.js, React, Node.js, and cinematic visual media.",
  email: "tharusha.k.dev@gmail.com",
  phone: "+94768393529",
  location: {
    city: "Colombo",
    country: "Sri Lanka",
    countryCode: "LK",
  },
  social: {
    linkedin: "https://www.linkedin.com/in/tharusha-kawshalya-747359356/",
    tiktok: "https://www.tiktok.com/@tkedirithanthiri?_r=1&_t=ZS-99XMs48xnm9",
    facebook: "https://www.facebook.com/share/18KDu9sEeb/",
    github: "https://github.com/EdirithanthiriTharushaKawshalya",
  },
  education: [
    {
      degree: "BSc (Hons) Computer Science",
      institution: "University of Westminster",
      url: "https://www.westminster.ac.uk",
      status: "Reading",
    },
    {
      degree: "Foundation for Higher Education",
      institution: "Informatics Institute of Technology",
      url: "https://www.iit.ac.lk",
      status: "Completed",
    },
  ],
  experience: [
    {
      role: "Junior Developer",
      company: "Arcforth",
      period: "Present",
    },
    {
      role: "Intern Software Engineer",
      company: "Syntax Erreur",
      period: "Completed",
    },
    {
      role: "Lead Photographer & Videographer",
      company: "Studio Zine",
      period: "Present",
    },
  ],
  skills: [
    "Software Engineering",
    "Full-Stack Web Development",
    "Next.js",
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "PostgreSQL",
    "Supabase",
    "Tailwind CSS",
    "Cloud Architecture",
    "RESTful APIs",
    "UI/UX Design",
    "Commercial Photography",
    "Editorial Portraiture",
    "Cinematic Videography",
    "Digital Color Grading",
  ],
};

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://tharusha-kawshalya.vercel.app";
}

export function getPersonJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Tharusha Kawshalya | Software Engineer & Visual Director",
        "alternateName": ["Kawshalya.dev", "Tharusha Kawshalya Portfolio"],
        "description": PERSONAL_INFO.bio,
        "publisher": {
          "@id": `${siteUrl}/#person`,
        },
        "inLanguage": "en-US",
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profilepage`,
        "url": siteUrl,
        "name": "Tharusha Kawshalya Profile & Portfolio",
        "isPartOf": {
          "@id": `${siteUrl}/#website`,
        },
        "mainEntity": {
          "@id": `${siteUrl}/#person`,
        },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        "name": PERSONAL_INFO.name,
        "alternateName": PERSONAL_INFO.alternateNames,
        "givenName": "Tharusha",
        "familyName": "Kawshalya",
        "additionalName": "Edirithanthiri",
        "url": siteUrl,
        "image": {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#personimage`,
          "url": `${siteUrl}/profile.webp`,
          "caption": "Edirithanthiri Tharusha Kawshalya",
        },
        "jobTitle": PERSONAL_INFO.title,
        "description": PERSONAL_INFO.bio,
        "disambiguatingDescription":
          "Edirithanthiri Tharusha Kawshalya is a Sri Lankan software engineer, full-stack web developer, and creative visual director/photographer.",
        "nationality": {
          "@type": "Country",
          "name": PERSONAL_INFO.location.country,
        },
        "homeLocation": {
          "@type": "Place",
          "name": `${PERSONAL_INFO.location.city}, ${PERSONAL_INFO.location.country}`,
        },
        "alumniOf": PERSONAL_INFO.education.map((edu) => ({
          "@type": "EducationalOrganization",
          "name": edu.institution,
          "url": edu.url,
        })),
        "worksFor": PERSONAL_INFO.experience.map((exp) => ({
          "@type": "Organization",
          "name": exp.company,
        })),
        "knowsAbout": PERSONAL_INFO.skills,
        "sameAs": [
          PERSONAL_INFO.social.linkedin,
          PERSONAL_INFO.social.tiktok,
          PERSONAL_INFO.social.facebook,
          PERSONAL_INFO.social.github,
        ],
        "email": PERSONAL_INFO.email,
      },
    ],
  };
}
