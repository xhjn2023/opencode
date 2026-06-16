# AGENTS.md

## Project overview

Two static HTML pages (no build step) deployed on Netlify, backed by a shared Supabase project.

| File | Purpose | Supabase access |
|---|---|---|
| `sleep-tracker.html` | Daily sleep log (date, bedtime, waketime, duration) | REST API directly via `fetch`; anon/public access |
| `notes.html` | Rich-text daily notes with Quill editor, tags, search | Supabase JS client (CDN `window.supabase`); requires Supabase Auth (email/password) |

## Key commands

- No build, test, lint, or typecheck commands — pure static HTML
- Deploy: push to `main` → Netlify auto-deploys

## Supabase

- Project: `https://gtgtbsylalibqhxztcta.supabase.co`
- Anon key: `sb_publishable_...` (hardcoded in both HTML files)
- Tables: `sleep_records`, `daily_notes`
- `sleep-tracker.html` calls Supabase REST API directly — no JS client loaded
- `notes.html` loads `@supabase/supabase-js@2` from CDN and uses `window.supabase.createClient()`

## Netlify

- Config in `netlify.toml`: publish root `.`, redirect `/notes` → `notes.html`, `/*` → `sleep-tracker.html`
- `notes.html` accessible at `/notes`

## Gotchas

- Both HTML files embed the same Supabase credentials in plaintext — never commit to a public repo without rotating
- `notes.html` Supabase Auth requires enabling email/password provider in Supabase dashboard
- `sleep_records` table must have RLS policy allowing all operations (anon access); `daily_notes` table uses per-user RLS tied to `auth.uid()`
- No package.json, no lockfile — don't try to install dependencies
