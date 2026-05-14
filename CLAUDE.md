# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fatty's personal website - a modern dark tech aesthetic site built with Astro, deployed to GitHub Pages at https://lystrosaurus.github.io.

## Tech Stack

- **Framework:** Astro 4.x (Static Site Generation)
- **Content:** MDX via @astrojs/mdx
- **Styling:** Tailwind CSS 3.4 + @tailwindcss/typography
- **Deployment:** GitHub Pages via GitHub Actions

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── content/
│   ├── blog/       # Blog posts (MDX)
│   ├── wiki/       # Knowledge base entries (MDX)
│   └── config.ts   # Content collection schemas
├── layouts/        # Page layouts (BaseLayout, PostLayout, ToolLayout)
├── pages/
│   ├── index.astro # Homepage
│   ├── blog/       # Blog list + detail pages
│   ├── wiki/       # Wiki list + detail pages
│   └── tools/      # Developer tools (7 tools)
└── styles/
    └── global.css  # Tailwind imports + custom components
```

## Content Collections

Two collections defined in `src/content/config.ts`:

- **blog:** `{title, description, date, tags, draft}`
- **wiki:** `{title, description, category, order, tags, draft}`

## Design System

Dark theme with cyan (#00fff2) and purple (#a855f7) accents. Custom Tailwind colors:
- `bg/bg-secondary/bg-tertiary` - Background layers
- `cyan/purple` - Accent colors
- `text-primary/text-secondary/text-muted` - Text hierarchy
- `border/border-hover` - Border colors

Custom CSS classes in global.css: `.glass-card`, `.neon-text`, `.btn-primary`, `.btn-secondary`, `.input-field`

## Developer Tools

7 client-side tools at `/tools/`:
- JSON Formatter, Base64, Timestamp, Regex Tester, Markdown Preview, Pomodoro, Todo

Tools use `<script>` tags for client-side interactivity. Todo list uses localStorage for persistence.
