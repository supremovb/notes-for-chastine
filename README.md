# Notes for Chastine

A private relationship journal for thoughts, POVs, letters, memories, and quiet reflections written for Chastine.

The app is built with React, TypeScript, Vite, Supabase, and a polished responsive UI. It supports local fallback notes when Supabase is not configured, so the interface still works during setup.

## Features

- Add, edit, pin, favorite, archive, and restore relationship notes
- Supabase-backed note storage with local fallback
- Hardcoded couple photos from the app assets
- Warm, dark, and minimal themes
- Responsive layout for desktop and mobile
- Full-note reader with scroll progress
- Photo lightbox and multiple-photo galleries
- Timeline and gallery views
- Mood calendar with month navigation
- Relationship weather daily check-in
- Important dates board
- Private letter mode for unsent letters
- Search, mood filters, healing filters, reactions, tags, and date ranges
- Timeline playback slideshow
- Favorite quote shelf
- PDF export for pinned or favorite notes
- Backup and import as JSON
- Per-note privacy locks with Supabase-stored salted passcode verifiers
- Voice note URL support
- Monthly recap, healing progress, and memory map
- Markdown-style formatting for bold, italic, and quotes
- Unsaved changes confirmation
- Custom toast and confirmation UI instead of browser alerts

## Tech Stack

- React 19
- TypeScript
- Vite
- Supabase
- Lucide React icons
- jsPDF
- Oxlint

## Getting Started

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Supabase Setup

1. Create a Supabase project.
2. Create a table by running [supabase-schema.sql](./supabase-schema.sql) in the Supabase SQL editor.
3. Add your keys to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app expects a table named:

```text
relationship_notes
```

If Supabase is not configured, the app uses local browser storage.

## Deployment

This repo includes a GitHub Pages workflow in [.github/workflows/deploy.yml](./.github/workflows/deploy.yml).

Expected live URL after deployment:

```text
https://supremovb.github.io/notes-for-chastine/
```

For GitHub Pages with Supabase, add these repository secrets:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Then push to `main`. GitHub Actions will build and deploy the site through GitHub Pages.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

Private note locks save a salted verifier in Supabase so the same note can be unlocked across browsers without storing the real passcode. If someone creates a private note, they should remember that note's passcode.
