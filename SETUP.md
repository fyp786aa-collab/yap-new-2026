# AKYSB YAP 2026 – Setup Guide

## Prerequisites

- Node.js 20+ and pnpm
- Neon PostgreSQL database (tables pre-created)
- Resend account (domain verified)
- Gmail account with App Password (fallback)
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

### Resend (Primary Email Provider)

1. Log in to [Resend](https://resend.com/)
2. Go to **Domains** and add your sending domain (for example, `mail.yourdomain.com`)
3. Add the required DNS records in your DNS provider (SPF/DKIM, and DMARC if recommended)
4. Wait until domain status is **Verified** in Resend
5. Go to **API Keys** and create an API key
6. Set `RESEND_API_KEY` in `.env`
7. Set `RESEND_FROM` to a verified sender, for example: `AKYSB Pakistan - YAP <noreply@mail.yourdomain.com>`

### Gmail SMTP (Fallback)

1. Go to Google Account → Security → 2-Step Verification → App Passwords
2. Generate an app password for "Mail"
3. Set `GMAIL_USER` to your Gmail address
4. Set `GMAIL_APP_PASSWORD` to the 16-character app password

### Shared Email Variables

1. Set `EMAIL_FROM` to your default sender identity. Recommended to match `RESEND_FROM`
2. If Resend fails at runtime, the app automatically falls back to Gmail SMTP

### Google Drive Setup (OAuth2)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or use an existing one
3. Enable the **Google Drive API**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
6. Choose **Web application** as the type
7. Add `https://developers.google.com/oauthplayground` as an **Authorized redirect URI**
8. Copy the **Client ID** and **Client Secret** → set as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
9. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
10. Click the ⚙️ gear icon (top right) → check **Use your own OAuth credentials** → paste your Client ID and Secret
11. In Step 1, select **Google Drive API v3** → `https://www.googleapis.com/auth/drive.file`
12. Click **Authorize APIs** and sign in with the Google account that owns the folder
13. In Step 2, click **Exchange authorization code for tokens**
14. Copy the **Refresh Token** → set as `GOOGLE_REFRESH_TOKEN`
15. Create a folder in Google Drive for uploads
16. Copy the folder ID from the URL (e.g., `https://drive.google.com/drive/folders/FOLDER_ID`) → set as `GOOGLE_DRIVE_FOLDER_ID`

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
- **Email**: Resend (primary) + Nodemailer/Gmail (fallback)
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
