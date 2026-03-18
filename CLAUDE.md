# Sight Words Site — Project Brief

## What this is
A static SEO-first educational website for parents and teachers
searching for sight word resources. Built with Astro, Tailwind CSS,
and a React island for the interactive flashcard tool.

## Tech stack
- Framework: Astro (static output mode)
- Styling: Tailwind CSS
- Interactive component: React island via @astrojs/react
- Hosting: Netlify
- Data: /src/data/words.json (single source of truth)
- SEO: astro-seo package
- Sitemap: @astrojs/sitemap

## Core principles
1. Every page pre-renders to static HTML. Word lists must be
   visible in HTML, not only rendered by JavaScript.
2. Mobile-first. Parents use phones to hold up to their children.
3. Content tone: write for a tired parent at 8pm.
   Short sentences, immediate value, no jargon.
4. Single data source. All word lists live in words.json only.
   Never hardcode words in components or pages.

## Folder structure
- /src/data/words.json — all word data
- /src/layouts/BaseLayout.astro — shared page shell
- /src/components/ — reusable components
- /src/pages/ — all routes

## Flashcard features to build
- Next / previous navigation
- Shuffle mode
- Text-to-speech via Web Speech API
- Progress indicator ("Word 4 of 40")

## Features to add after launch (do not build now)
- Swipe gestures
- Auto-advance timer
- Full-screen mode
- Flagged / starred words
- Games or quiz mode

## Internal linking rule
Always use the RelatedPages.astro component.
Never add internal links manually in page files.

## SEO rules
- Word lists must be in HTML tables, visible without JavaScript
- Every page needs a unique title and meta description
- FAQ sections use FAQ schema markup as JSON-LD
- Print CSS on every list page
- Canonical tags on every page
