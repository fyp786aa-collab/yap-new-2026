# AKYSB YAP 2026 – Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database (tables pre-created)
- Gmail account with App Password
- Google Cloud project with Drive API enabled (OAuth2 credentials)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in all values in .env

# Run development server
pnpm dev
```

## Environment Variables

### DATABASE_URL

Your Neon PostgreSQL connection string:

```
postgresql://neondb_owner:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require
```

### NEXTAUTH_SECRET

Generate with:

```bash
openssl rand -base64 32
```

### Gmail SMTP

1. Go to Google Account → Security → 2-Step Verification → App Passwords
2. Generate an app password for "Mail"
3. Set `GMAIL_USER` to your Gmail address
4. Set `GMAIL_APP_PASSWORD` to the 16-character app password

### Google Drive Setup (Service Account)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services → Credentials**
3. Click **Create Credentials → Service Account**, name it (e.g. `neon-backup-bot`)
4. On the service account page → **Keys tab → Add Key → Create new key → JSON** → download it
5. Copy the `client_email` from the JSON (e.g. `neon-backup-bot@project.iam.gserviceaccount.com`)
6. Open your Google Drive backup folder → **Share** → paste the email → grant **Editor** access
7. In GitHub → **Settings → Secrets → Actions**, add:
   - `GDRIVE_SERVICE_ACCOUNT_JSON` — paste the entire contents of the downloaded JSON file
   - `GDRIVE_FOLDER_ID` — the folder ID from the Drive URL (`.../folders/FOLDER_ID`)

## Database Schema

The database tables should be pre-created in Neon. Required tables:

- `users` – accounts with email verification
- `applicants` – personal information
- `applications` – application tracking
- `location_info` – regional/council data
- `emergency_contacts` – emergency contact info
- `academic_background` – education details
- `placement_readiness` – placement preferences
- `internship_preferences` – agency rankings
- `skills_competencies` – self-rated skills
- `experience_engagement` – experience essay
- `motivation_alignment` – motivation essay
- `availability_commitment` – availability confirmation
- `documents` – uploaded file records
- `application_references` – reference contacts

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: NextAuth v5 (beta) with Credentials provider
- **Database**: Neon PostgreSQL (serverless)
- **Validation**: Zod + React Hook Form
- **Email**: Nodemailer (Gmail SMTP)
- **File Storage**: Google Drive API
- **Password Hashing**: Argon2

## Project Structure

```
src/
├── actions/          # Server actions
├── app/
│   ├── (auth)/       # Auth pages (login, signup, etc.)
│   ├── (protected)/  # Dashboard + form sections
│   └── api/          # API routes (upload, auth)
├── components/
│   ├── forms/        # Form components (per section)
│   ├── layout/       # Sidebar, top bar
│   └── ui/           # Reusable UI (shadcn + custom)
├── data/             # Councils, jamatkhanas
├── lib/
│   ├── db-queries/   # Database query functions
│   ├── email-templates/
│   ├── validations/  # Zod schemas
│   └── utils/        # Helpers
└── types/            # TypeScript interfaces
```
