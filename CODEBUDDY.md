# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

Lystrosaurus's personal website — a dark "tech aesthetic" static site built with Astro, deployed to GitHub Pages at https://lystrosaurus.github.io. It has content sections (Blog, Wiki, Garden/书库) plus a set of client-side Developer Tools, and a global site search.

## Tech Stack (verified against package.json / astro.config.mjs)

- **Framework:** Astro 7.x, static output (`output: 'static'`, no SSR)
- **Content:** MDX via `@astrojs/mdx`
- **Styling:** Tailwind CSS 4.x (configured in CSS via `@import "tailwindcss"` + `@theme`, **not** a `tailwind.config.js`), plus `@tailwindcss/typography`; Vite plugin is `@tailwindcss/vite`
- **Client search:** Fuse.js (fuzzy search over a build-time index)
- **Client Markdown rendering:** `marked`
- **Deploy:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`, pushes to `main` trigger `npm ci` + `npm run build`, Node 24)

## Commands

```bash
npm run dev        # Start Astro dev server (astro dev)
npm run build      # Production build -> dist/ (astro build)
npm run preview    # Preview the production build (astro preview)
```

There is no test runner or linter configured in this repo — `package.json` defines `dev`/`start`/`build`/`preview` plus garden scripts (`garden:validate`, `garden:run`, `gen:books`). Vite is pinned to `^8.0.13` via `overrides`.

## Architecture

### Routing & pages (`src/pages/`)
Astro file-based routing. Each top-level folder becomes a URL segment:
- `index.astro` — homepage (Hero, skills `TagCloud`, recent posts, quick-nav; hardcoded data arrays in the frontmatter script).
- `blog/index.astro` + `blog/[slug].astro` — blog list and detail. `[slug].astro` uses `getStaticPaths()` to enumerate the `blog` collection and `render(post)` to emit MDX; draft posts are filtered out.
- `wiki/index.astro` + `wiki/[slug].astro` — same pattern for the `wiki` collection.
- `tools/index.astro` + one `.astro` per tool (`json-formatter`, `base64`, `timestamp`, `regex-tester`, `markdown-preview`, `pomodoro`, `todo`).
- `search.astro` — builds a unified `SearchItem[]` index at build time (blog + wiki from collections, plus static tool mirrors) and passes it into `SearchBox.astro` for Fuse.js client-side search.
- `notes.astro` — standalone notes page.

### Content collections (`src/content.config.ts`)
Defines `blog` and `wiki` collections using the **Content Layer API** (`glob` loader from `astro/loaders`, base dir `./src/content/blog` and `./src/content/wiki`). Schemas use Zod:
- `blog`: `{title, description, date, tags[], draft?=false}`
- `wiki`: `{title, description, category, order?=0, tags[]?=[], draft?=false}`

Files beginning with `_` are excluded by the glob pattern. The MDX filename becomes the URL slug (`welcome.mdx` → `/blog/welcome`). Drafts never reach production builds.

### Layouts (`src/layouts/`)
- `BaseLayout.astro` — site chrome (Header + Footer), wraps every page.
- `PostLayout.astro` — blog/wiki detail (title, description, date/tags, renders `<Content />`).
- `ToolLayout.astro` — wrapper for the `/tools/*` pages.

### Components (`src/components/`)
Reusable Astro components: `Header`, `Footer`, `Card`, `ToolCard`, `TagCloud`, `TagFilter`, `SearchBox`. `SearchBox` holds the client-side search logic.

### Styling / design system (`src/styles/global.css`)
All theme tokens live in a single `@theme` block (Tailwind 4 convention) — do not add a `tailwind.config.js`. Key tokens:
- Background layers: `bg` (#0a0a0a), `bg-secondary` (#111), `bg-tertiary` (#1a1a1a)
- Accents: `cyan` (#00fff2), `purple` (#a855f7) (+ `*-dim` variants)
- Text: `text-primary` / `text-secondary` / `text-muted`
- Borders: `border` / `border-hover`
- Animations: `typewriter`, `blink`, `glow-pulse`, `float` (exposed as `animate-*` utilities)
- Custom component classes (outside `@theme`, defined in `@layer`): `.glass-card`, `.glass-card-hover`, `.neon-text`, `.neon-text-purple`, `.glow-border`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.text-gradient-cyan-purple`

When adding styles, follow Tailwind 4 CSS-first config: new colors/animations go in `@theme`; component classes go in `@layer components`; utilities in `@layer utilities`.

### Developer tools
Each `/tools/*` page is a static Astro page whose interactivity is implemented with a `<script>` tag (vanilla client-side JS), not a framework. The Todo tool persists state in `localStorage`. Markdown Preview uses `marked`. No server logic is involved (static output).

### Path alias
`tsconfig.json` maps `@/*` → `src/*`. Import components as e.g. `import Header from '@/components/Header.astro'`.

## Conventions

- **New blog/wiki posts:** add an `.mdx` file under `src/content/blog/` or `src/content/wiki/` with full frontmatter per the schemas above; filename = slug. Set `draft: true` to keep it out of production.
- **New tools:** create `src/pages/tools/<name>.astro` using `ToolLayout`, add client logic in a `<script>` tag, and mirror the entry in the `search.astro` tool index so it is searchable.
- **Components/pages:** Astro `.astro` syntax; reuse the existing design-system tokens and component classes rather than inventing new color values.
- Fonts (Inter, JetBrains Mono) are loaded via a Google Fonts `@import` at the top of `global.css`.
- Output is fully static; there is no API route or server runtime.
