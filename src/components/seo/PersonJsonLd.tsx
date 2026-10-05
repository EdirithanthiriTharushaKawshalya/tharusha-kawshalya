import { getPersonJsonLd } from "@/lib/seo";

export default function PersonJsonLd() {
  const jsonLd = getPersonJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
