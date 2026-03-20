import wordsData from "../data/words.json";

const listRouteOverrides: Record<string, string> = {
  "fry-1-100": "/fry-sight-words/1-100",
  "fry-101-200": "/fry-sight-words/101-200",
};

const staticPageRoutes: Record<string, string> = {
  home: "/",
  "what-are-sight-words": "/what-are-sight-words",
  "high-frequency-words": "/high-frequency-words",
  "sight-word-games": "/sight-word-games",
  "sight-words-flashcards": "/sight-words-flashcards",
  "sight-words-printable": "/sight-words-printable",
  "dolch-sight-words": "/dolch-sight-words",
  "fry-sight-words": "/fry-sight-words",
};

export function getListHref(list: { slug: string; url?: string }) {
  return listRouteOverrides[list.slug] || list.url || `/${list.slug}`;
}

export function getRouteFromSlug(slug: string) {
  const list = wordsData.lists[slug as keyof typeof wordsData.lists];

  if (list) {
    return getListHref(list);
  }

  return staticPageRoutes[slug] || `/${slug}`;
}

export const majorPageLinks = [
  { slug: "home", label: "Sight Words Home" },
  { slug: "dolch-sight-words", label: "Dolch Sight Words Hub" },
  { slug: "fry-sight-words", label: "Fry Sight Words Hub" },
  { slug: "kindergarten", label: "Kindergarten Sight Words" },
  { slug: "1st-grade", label: "1st Grade Sight Words" },
  { slug: "2nd-grade", label: "2nd Grade Sight Words" },
  { slug: "sight-words-flashcards", label: "Sight Words Flashcards" },
  { slug: "sight-words-printable", label: "Printable Sight Word Lists" },
  { slug: "sight-word-games", label: "Sight Word Games" },
];
