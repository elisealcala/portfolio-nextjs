# Bold Typography

The portfolio uses one shared design system across the homepage, notes, archive, articles,
experience page, about page, and not-found page.

## Source of truth

`src/app/globals.css` defines semantic color, spacing, tracking, radius, and motion
tokens. `tailwind.config.ts` references those tokens; add new shared values there instead
of introducing page-specific colors. Dark is the default. The existing light-theme switch
uses a monochrome palette with a darker accessible accent.

- Background: `#0a0a0a`; foreground: `#fafafa`; accent: `#ff3d00`.
- Secondary text: `#a0a0a0`, raised from the supplied gray to maintain AA contrast even on
  the elevated input surface.
- All corners are square. Dividers and type hierarchy replace shadows.
- The layout has a 1200px content maximum and 24/48/64px responsive gutters.
- Inter Tight is the primary typeface; JetBrains Mono is for metadata. Italic Playfair
  Display is reserved for quotations.

## Reusable patterns

`PageIntro` owns page titles, brief descriptions, and optional actions. Use a single title
per section; avoid stacking decorative labels or slogans above it. Keep working-idea
context on the notes introduction and article pages. Cards show the latest public date;
article headers distinguish publication from revision. `NoteCard` accepts a heading level
so listing pages retain a logical hierarchy. `ExperienceList` shares CV-backed work
summaries between the homepage and experience page. Employer and client labels remain
distinct. The former explorer is not part of the active portfolio.

Use `.button.primary` for an accent text action with a persistent underline, `.button` for
the outlined/inverting secondary action, and `.text-link` for a quieter action. Navigation
uses `aria-current`; expandable sections use native `details` and `summary`. Keep
interactive targets at least 44px high and retain visible keyboard outlines.

`ScrollReveal` progressively enhances elements marked `data-reveal`, using a one-time
IntersectionObserver reveal. Content is visible without JavaScript, and already-visible
content is never hidden on initialization. Reduced-motion users receive no animation. No
animation dependency is required.

## Fonts

Variable WOFF2 fonts and their SIL Open Font Licenses live in `public/fonts`. They are
loaded with `next/font/local`; only the primary font is preloaded. Subsets include Latin,
extended Latin, punctuation, currency, and arrows. The system fallback handles characters
outside those ranges. Font loading does not require external requests at build time or in
the browser.
