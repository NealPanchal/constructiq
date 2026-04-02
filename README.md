# 🏗️ ConstructIQ

**Production-Ready Construction Project Management SaaS**

ConstructIQ bridges the gap between private project execution and complex government approval workflows in India. Built with Next.js, Clerk, and Prisma.

---

## 🚀 Quick Start (Professional Setup)

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **NPM** (v9.x or higher)
- **PostgreSQL** (Local or [Supabase](https://supabase.com))

### 2. Automated Initialization
We provide a setup script to handle environment configuration and dependency installation:
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment
Open the newly created `.env` file and strictly fill in the following credentials:
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`
- **Database**: `DATABASE_URL` (PostgreSQL)
- **Razorpay**: `RAZORPAY_KEY_ID` & `RAZORPAY_SECRET`
- **Storage**: `UPLOADTHING_SECRET` & `UPLOADTHING_APP_ID`

### 4. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org)
- **Authentication**: [Clerk](https://clerk.com)
- **Database ORM**: [Prisma](https://prisma.io)
- **Payments**: [Razorpay](https://razorpay.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com)
- **Storage**: [Uploadthing](https://uploadthing.com)

---

## 📄 Core Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npx prisma studio` | Opens a GUI to manage your database |
| `npx prisma db push` | Synchronizes your schema with the database |
| `npx prisma generate` | Regenerates the Prisma Client |
