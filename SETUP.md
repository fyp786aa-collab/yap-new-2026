# AKYSB YAP 2026 – Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database (tables pre-created)
- Gmail account with App Password
- Google Cloud service account with Drive API enabled

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

### Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or use an existing one
3. Enable the **Google Drive API**
4. Go to **IAM & Admin → Service Accounts**
5. Create a service account
6. Create a JSON key for the service account
7. Base64 encode the JSON key file:
   ```bash
   base64 -i service-account-key.json | tr -d '\n'
   ```
8. Set the result as `GOOGLE_SERVICE_ACCOUNT_KEY`
9. Create a folder in Google Drive and share it with the service account email
10. Copy the folder ID from the URL and set as `GOOGLE_DRIVE_FOLDER_ID`

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
