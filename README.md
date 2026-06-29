# Hirenum CRM

Internal outreach CRM for Hirenum and its clients. Tracks LinkedIn prospects across three profiles (Hirenum, Talha Saleem, Abdul Moez Habib), uses AI to validate fit and draft personalized DMs, and gives clear pipeline visibility on every contact.

**Status:** Working prototype, deployed on Vercel. Used internally by authorized Hirenum employees only.

**Live URL:** [hirenum-crm.vercel.app](https://hirenum-crm.vercel.app)
**Repo:** [github.com/muhammadhamza6002/HirenumCRM](https://github.com/muhammadhamza6002/HirenumCRM)

---

## What It Does

Hirenum manages LinkedIn outreach for multiple clients. Each client's pipeline lived in scattered spreadsheets, manual DMs, and Apollo email exports — no funnel visibility, easy to lose track. This CRM consolidates everything:

- One dashboard per client (Hirenum / Talha / Abdul Moez)
- AI Assistant that takes a pasted LinkedIn profile + optional Apollo email + optional comment text, validates the fit, scores the lead, and drafts a personalized DM in that client's exact voice
- Funnel stats at the top of every dashboard, clickable as filters
- Full contact lifecycle: Not Contacted → DM Sent → Replied → Interested → Converted (or Cold)
- Email capture with source tagging (Apollo / Manual)
- Post Engagement vs Outbound DM tracking with engagement context

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (pages router) |
| UI | React 18, Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| AI | Groq (Llama 3.3 70B free tier) with OpenRouter fallback |
| Auth | Hardcoded `admin` / `admin` via sessionStorage (prototype-only) |
| Hosting | Vercel (auto-deploy from `main`) |
| Brand | Hirenum design system — teal `#1AC9C4` + pink `#E8158E` on `#0A0A0A`, Plus Jakarta Sans |

---

## Features Built

### Auth
- Simple login screen at `/login` (admin / admin)
- Session-based guard via `sessionStorage`, redirects unauth users
- Sign out from the home page

### Profile Selector (`/`)
- Lists 3 client profiles from Supabase
- Cards with teal-glow hover, brand-accurate hirenum. wordmark

### Per-Profile Dashboard (`/dashboard/[profile]`)
- Sticky dark navbar with hirenum. wordmark + back link + action buttons
- **Funnel stat cards** (6) — Total, From Engagement, DM Sent, Replied, Interested, Converted. All clickable as filters; active filter shows pink-glow border
- **AI Assistant panel:**
  - Source toggle (Outbound DM / Post Engagement)
  - LinkedIn profile paste area
  - Engagement comment textarea (when Post Engagement active)
  - Validates fit (strong / weak / not_fit) with reason
  - Returns score (0–100) and personalized DM following each client's exact rules
  - Extracts company, role, industry, email separately
  - "I sent the DM" → saves contact at `dm_sent` stage
  - "Save without sending" → saves at `not_contacted` stage
- **Add Contact form** — manual entry with all fields incl. email
- **Contacts table:**
  - Name, Company, Role, Email, Source, Score, Stage, Sentiment columns
  - Pill-shaped stage selector with brand color mapping
  - Pill-shaped sentiment selector
  - Apollo email badge (yellow) or Manual badge (gray)
  - Score color-coded by tier
  - Floating three-dot menu per row → Edit / Delete
- **Edit modal** — every contact field editable, brand-aligned

### AI Assistant Prompts
Each client has a custom system prompt baked in (`pages/api/assistant.js`):
- **Talha:** 3 gold-standard sample DMs, ozone/data-center/food-bev ICPs, exact intro paragraph, strong vs weak-fit CTA logic
- **Abdul Moez:** 4 gold-standard sample DMs, sugar/FMCG/dairy/distillery/pharma industries, Assalamualaikum greeting, NEQS rules, in-execution vs delivered distinction
- **Hirenum (default):** generic agency outreach prompt
- Global profile-extraction directive: AI must mine the pasted text for concrete details (past employers, equipment, certs) — generic openers banned
- Email extraction from pasted text only (never invented)

### Branding
- Hirenum design system applied throughout — teal/pink dual-color, dark canvas, pill buttons, Plus Jakarta Sans, dot-period accents
- Footer with oversized HIRENUM wordmark gradient sign-off on every page
- Floating "Back to top" pink pill button (appears on scroll)
- Login page with subtle teal/pink ambient glow blurs

---

## Database Schema

Three tables in Supabase:

```sql
profiles (id, name, slug, created_at)
contacts (id, profile_id, name, linkedin_url, company, role, industry,
          email, email_source, source, stage, sentiment, score,
          comment_text, draft_message, notes, created_at, updated_at)
touchpoints (id, contact_id, type, notes, created_at)
```

Open Row Level Security policies (prototype phase). Full schema in `supabase_schema.sql`.

---

## Project Structure

```
pulse-crm/
├── pages/
│   ├── _app.js              # Auth guard + global Layout wrapper
│   ├── index.js             # Profile selector
│   ├── login.js             # Admin login
│   ├── api/
│   │   └── assistant.js     # Groq/OpenRouter AI endpoint with client prompts
│   └── dashboard/
│       └── [profile].js     # Main dashboard — stats, AI panel, contacts table
├── components/
│   └── Layout.js            # Footer + back-to-top button
├── lib/
│   └── supabaseClient.js    # Supabase init
├── styles/
│   └── globals.css          # Dark theme, brand tokens, custom selects
├── tailwind.config.js       # Brand colors, fonts, pill radius
├── supabase_schema.sql      # Database init
└── .env.local               # Local env vars (gitignored)
```

---

## Environment Variables

Set these in `.env.local` (local) AND Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GROQ_KEY=gsk_...            # primary AI provider
OPENROUTER_KEY=sk-or-v1-... # fallback AI provider
```

---

## Running Locally

```
npm install
npm run dev
# → http://localhost:3000
```

Login with `admin` / `admin`.

## Deploying

Push to `main` → Vercel auto-deploys. ~1 minute build time.

---

## Roadmap / Next Steps

Things considered but not yet built:

- **Real auth** — replace hardcoded admin/admin with proper login (Supabase Auth, Google OAuth)
- **Touchpoints UI** — schema exists; need a timeline panel per contact showing every DM, reply, call
- **Follow-up surfacing** — flag contacts where DM was sent >N days ago with no reply
- **Bulk import** — CSV upload for migrating existing prospect lists
- **Landing page background** — discussed, design TBD
- **Apollo API integration** — if/when paid tier is acquired, auto-pull emails instead of copy-paste

---

## Brand Reference

Full design system documented in `design.md` (Hirenum brand reference) — teal/pink palette, Plus Jakarta Sans, pill buttons, dark canvas, dot-period accents, oversized typography hierarchy. The CRM follows it exactly.

---

©2026 Hirenum<span style="color:#E8158E">.</span>
