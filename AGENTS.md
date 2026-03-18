# Sight Words Site — Agent Briefing

## Project overview
A static SEO-first educational website for parents and teachers
searching for sight word resources. Built with Astro, Tailwind CSS,
and a React island for the interactive flashcard tool. Hosted on Netlify.

## Tech stack
- Framework: Astro (static output mode — all pages pre-render to HTML)
- Styling: Tailwind CSS
- Interactive component: React island via @astrojs/react
- Data: /src/data/words.json (single source of truth for all word lists)
- SEO: astro-seo package
- Sitemap: @astrojs/sitemap
- Hosting: Netlify

## Critical rules — read before writing any code
1. Every page must pre-render to static HTML. Word lists must be
   visible in the HTML source, not only rendered by JavaScript.
2. All word data lives in /src/data/words.json only.
   Never hardcode words in any component or page file.
3. Never modify words.json structure — only add to it.
4. Internal links always use the RelatedPages.astro component.
   Never add internal links manually inside page files.
5. The Flashcard component is a React island. All other components
   are Astro components. Do not convert Astro components to React.
6. Mobile-first on all styling. Minimum 48px tap targets on
   interactive elements.

## Folder structure
- /src/data/words.json — all word list data
- /src/layouts/BaseLayout.astro — shared page shell, nav, footer
- /src/components/ — all reusable components
- /src/pages/ — all page routes

## Component reference
- Flashcard.jsx — React island, receives words[] and listName props
- WordTable.astro — renders word list as HTML table, 3 columns
- RelatedPages.astro — programmatic internal links, receives currentSlug
- FAQ.astro — FAQ section with JSON-LD schema, receives faqs[]
- PrintButton.astro — triggers window.print()

## Page structure (every content page follows this order)
1. H1 with primary keyword
2. Intro paragraph (100–150 words)
3. CTA linking to flashcard tool
4. Flashcard component (React island, client:load)
5. WordTable component
6. Teaching tips section
7. FAQ component
8. RelatedPages component
9. PrintButton component

## SEO requirements for every page
- Unique title tag under 60 characters
- Unique meta description under 155 characters
- Canonical tag
- Word list visible in HTML without JavaScript
- Print CSS hiding nav, footer, ads, and the flashcard tool

## Flashcard features to build at launch
- Next / previous navigation (48px minimum tap targets)
- Shuffle mode
- Text-to-speech via Web Speech API
- Progress indicator ("Word 4 of 40")

## Do not build — add after launch only
- Swipe gestures on flashcard
- Auto-advance timer
- Full-screen mode
- Flagged / starred words system
- Games or quiz modes
