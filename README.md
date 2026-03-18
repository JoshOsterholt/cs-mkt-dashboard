# Contract Source — 2026 Marketing Command Center

## Deploy to Vercel (2 minutes, free)

### Prerequisites
- A GitHub account (free): https://github.com/signup
- A Vercel account (free): https://vercel.com/signup (sign up with GitHub)

### Step 1: Push to GitHub
1. Go to https://github.com/new
2. Name the repo: `cs-marketing-dashboard`
3. Keep it **Private**
4. Click **Create repository**
5. Upload all the files from this folder to the repo:
   - Click "uploading an existing file" on the repo page
   - Drag the entire contents of this folder into the upload area
   - Click "Commit changes"

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Click **Import** next to your `cs-marketing-dashboard` repo
3. Leave all settings as default (Vite is auto-detected)
4. Click **Deploy**
5. Wait ~60 seconds for the build
6. Your dashboard is live at `https://cs-marketing-dashboard.vercel.app` (or similar)

### Step 3: Bookmark It
- Bookmark the Vercel URL — that's your daily marketing command center
- Pin it in your browser for quick access

## How Data Works

- **Data is stored in your browser** using IndexedDB (via localforage)
- It persists between sessions, browser restarts, and page refreshes
- It does NOT sync between devices or browsers
- **Export regularly** using the 📤 Export button as a backup
- **Import** backups on a new device using the 📥 Import button

## Daily Workflow

1. Open your bookmarked dashboard
2. Check **Overview** tab for KPI snapshot
3. Hit **Inbox** — dump any new ideas, leads, notes
4. Work from the relevant tab for today's focus
5. Cycle task statuses as you complete work
6. Enter scorecard numbers at month-end

## Features

- 9 tabs: Overview, 8421 Goals, Prospecting, Trade Shows, Email, LinkedIn, Rebrand, Signage, Inbox
- Persistent data (survives browser restarts)
- Add/edit/delete tasks, opportunities, trade shows, inbox items
- Interactive scorecard with weighted scoring
- Signage quarterly tracking with charts
- Trade show ROI tracking (leads, meetings, revenue)
- Export/Import JSON backups
- Dark theme, mobile-responsive

## Updating the Dashboard

To make changes, either:
1. Ask Claude to modify the code, then re-upload to GitHub (Vercel auto-deploys)
2. Edit files directly in GitHub (Vercel auto-deploys on every commit)

## Tech Stack

- React 18 + Vite
- Recharts (charts)
- localforage (persistent browser storage)
- Deployed on Vercel (free tier)
