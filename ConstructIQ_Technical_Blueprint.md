# 🏗️ ConstructIQ: Production-Ready MVP Technical Blueprint
**Goal:** A highly scalable, monetizable Next.js SaaS MVP designed to be shipped in 14 days.

---

## 🏗️ STEP 1 — SYSTEM ARCHITECTURE

### Architecture Overview
*   **Framework:** Next.js (App Router) for Server-Side Rendering (SSR) and API routing.
*   **Database:** PostgreSQL (hosted on Supabase/Neon) managed via Prisma ORM.
*   **Auth:** Clerk for drop-in, secure B2B authentication.
*   **Storage:** AWS S3 for CAD file, image, and PDF storage.
*   **PDF Generation:** Puppeteer (via `@sparticuz/chromium` for serverless environments) triggered by a Next.js API route.
*   **Payments:** Razorpay API for immediate monetization in India.
*   **UI/Styling:** Tailwind CSS + Shadcn UI for a fast, accessible, Notion-like interface.

### Folder Structure (Next.js App Router)
```text
construct-iq/
├── prisma/
│   └── schema.prisma         # Database models
├── src/
│   ├── app/
│   │   ├── (auth)/           # Clerk sign-in/sign-up
│   │   ├── api/              # Backend Next.js API Routes
│   │   │   ├── projects/
│   │   │   ├── chat/
│   │   │   ├── approval-pdf/
│   │   │   └── razorpay/
│   │   ├── dashboard/        # Dashboard layout & pages
│   │   ├── projects/         # Project details, chat, files
│   │   ├── layout.tsx        # Root layout, providers
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Shadcn components (buttons, dialogs)
│   │   ├── forms/            # Government Approval multi-step form
│   │   └── shared/           # Sidebar, Navbar
│   ├── lib/
│   │   ├── db.ts             # Prisma client initialization
│   │   ├── s3.ts             # AWS S3 upload utility
│   │   └── razorpay.ts       # Razorpay config
│   └── types/                # TypeScript interfaces
├── package.json
└── tailwind.config.ts
```

---

## 🧩 STEP 2 — DATABASE DESIGN (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  name      String
  role      String   @default("CONTRACTOR") // ARCHITECT, CONTRACTOR, OWNER
  projects  ProjectMember[]
  messages  Message[]
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(uuid())
  name        String
  location    String
  budget      Float?
  status      String   @default("ACTIVE") // ACTIVE, COMPLETED
  members     ProjectMember[]
  messages    Message[]
  files       File[]
  approvals   ApprovalForm[]
  payments    Payment[]
  createdAt   DateTime @default(now())
}

model ProjectMember {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  role      String   @default("MEMBER") // ADMIN, MEMBER
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
}

model Message {
  id        String   @id @default(uuid())
  content   String
  userId    String
  projectId String
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())

  @@index([projectId])
}

model File {
  id        String   @id @default(uuid())
  name      String
  url       String   // S3 URL
  type      String   // PDF, DWG, JPG
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
}

model ApprovalForm {
  id           String   @id @default(uuid())
  projectId    String
  pdfUrl       String?  // URL to generated PDF
  status       String   @default("DRAFT") // DRAFT, GENERATED, SUBMITTED
  formData     Json     // Stores all dynamic form fields
  project      Project  @relation(fields: [projectId], references: [id])
  createdAt    DateTime @default(now())
}

model Payment {
  id            String   @id @default(uuid())
  projectId     String
  amount        Float
  currency      String   @default("INR")
  razorpayId    String   @unique
  status        String   @default("PENDING") // PENDING, SUCCESS, FAILED
  project       Project  @relation(fields: [projectId], references: [id])
  createdAt     DateTime @default(now())
}
```

---

## 🎨 STEP 3 — UI/UX DESIGN (MODERN SAAS)

**Vibe:** Notion meets Procore. Clean, utilitarian, high-contrast borders, minimal shadows.

**Key Layouts:**
1.  **Dashboard (`/dashboard`):** 
    *   *Sidebar:* Projects, Templates, Billing, Settings.
    *   *Main Area:* Grid cards of Active Projects showing a progress bar and quick-link to the Approval Status.
2.  **Project Detail (`/projects/[id]`):** 
    *   *Tabs:* Overview, Team Chat, Files, Approvals.
3.  **Chat Interface:** 
    *   Like Slack. Messages on the left, sticky input bar at the bottom.
4.  **Approval Form Generator:** 
    *   Multi-step wizard (Step 1: Project Details -> Step 2: Site Dimensions -> Step 3: Architect details -> Step 4: Pay & Generate).

---

## 💻 STEP 4 — FRONTEND CODE (NEXT.JS)

### Dashboard Layout (Sidebar + Content)
```tsx
// src/app/dashboard/layout.tsx
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h1 className="font-bold text-2xl mb-8 tracking-tight">ConstructIQ</h1>
          <nav className="space-y-4 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="block hover:text-black">Projects</Link>
            <Link href="/dashboard/approvals" className="block hover:text-black">Approvals</Link>
          </nav>
        </div>
        <UserButton afterSignOutUrl="/" />
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

### Dashboard Page (Fetching Projects)
```tsx
// src/app/dashboard/page.tsx
import db from "@/lib/db";
import { auth } from "@clerk/nextjs";

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  
  const projects = await db.project.findMany({
    where: { members: { some: { userId: user.id } } }
  });

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Active Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(p => (
           <div key={p.id} className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-gray-500 text-sm">{p.location}</p>
              <a href={`/projects/${p.id}`} className="mt-4 block text-blue-600 font-medium text-sm">View Project &rarr;</a>
           </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 STEP 5 — BACKEND API

### Project Creation API
```tsx
// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { name, location } = await req.json();

    const user = await db.user.findUnique({ where: { clerkId: userId } });

    const project = await db.project.create({
      data: {
        name,
        location,
        members: {
          create: { userId: user.id, role: "ADMIN" }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
```

---

## 📄 STEP 6 — PDF GENERATION (CORE FEATURE)

This relies on Puppeteer generating an A4 PDF from an HTML string via a Next.js API route.

```tsx
// src/app/api/approval-pdf/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium"; // Required for Serverless

export async function POST(req: Request) {
  const { projectData, formData } = await req.json();

  const htmlTemplate = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px;}
          .content { margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Application for Building Permission</h2>
          <p>Local Municipal Corporation</p>
        </div>
        <div class="content">
          <p><strong>Project Name:</strong> ${projectData.name}</p>
          <p><strong>Architect:</strong> ${formData.architectName}</p>
          <p><strong>Plot Area:</strong> ${formData.plotArea} sq.m</p>
        </div>
      </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
    
    // Generate PDF Buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // TODO: Upload pdfBuffer to AWS S3 and return the S3 URL.
    // For MVP, return as base64 or a success state after upload.

    return NextResponse.json({ success: true, message: "PDF Generated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "PDF Generation Failed" }, { status: 500 });
  }
}
```

---

## 💬 STEP 7 — REAL-TIME COLLABORATION (POLLING)

For a 2-4 week MVP, implementing WebSockets (Socket.io/Pusher) adds massive DevOps overhead. We will use **SWR Polling** for the chat.

```tsx
// src/components/ChatBox.tsx
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function ChatBox({ projectId }) {
  const [text, setText] = useState("");
  // Polling every 3 seconds
  const { data: messages, mutate } = useSWR(`/api/chat?projectId=${projectId}`, fetcher, { refreshInterval: 3000 });

  const sendMessage = async () => {
    if(!text) return;
    await fetch('/api/chat', {
       method: 'POST', 
       body: JSON.stringify({ projectId, content: text })
    });
    setText("");
    mutate(); // Optimistic update
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map(msg => (
          <div key={msg.id} className="bg-gray-100 p-3 rounded-lg w-fit max-w-[80%]">
            <span className="text-xs font-bold text-gray-500">{msg.user.name}</span>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="flex-1 border rounded px-3" 
          placeholder="Type a message..." 
        />
        <button onClick={sendMessage} className="bg-black text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
```

---

## 💰 STEP 8 — PAYMENT INTEGRATION (RAZORPAY)

**Monetization Flow:** User fills approval form -> Clicks "Generate PDF" -> Razorpay Modal opens -> User pays ₹999 -> PDF is generated and saved.

```tsx
// 1. Backend Route: src/app/api/razorpay/route.ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST(req: Request) {
  const { amount } = await req.json();
  const options = {
    amount: amount * 100, // Amount in paise
    currency: "INR",
    receipt: `rcpt_${Math.random()}`
  };
  const order = await razorpay.orders.create(options);
  return NextResponse.json(order);
}
```

*Client-side flow:* Trigger the Razorpay checkout script, and upon the `handler` success callback, call the `/api/approval-pdf` route.

---

## 🚀 STEP 9 — DEPLOYMENT GUIDE

1.  **Database (Supabase):** Create a project. Copy the Connection Pooling URL to `DATABASE_URL` in `.env`. Run `npx prisma db push`.
2.  **Auth (Clerk):** Create a project. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env`.
3.  **Storage (AWS S3):** Create a bucket. Disable block public access (if files are public), setup IAM user. Add Keys to `.env`.
4.  **Backend/Frontend (Vercel):**
    *   Push repo to GitHub.
    *   Import project on Vercel.
    *   Add all production `.env` variables in Vercel settings.
    *   **CRITICAL LIMITATION:** Vercel serverless functions have a 50MB size limit. The `@sparticuz/chromium` package is ~47MB. It works, but if it times out often, offload PDF generation to a separate **Render.com** Node/Express microservice.

---

## 🧪 STEP 10 — TESTING & MVP LAUNCH

### First 10 Users Launch Plan:
1.  **The "Done-For-You" B2B Sale:** Do not expect contractors to sign up organically on Day 1. Approach 10 mid-tier architects. Offer to run their current pending project files through your Approval Auto-generator for 50% of the cost of their usual consultant.
2.  **Manual Testing Checklist:**
    *   Can a user invite a team member securely?
    *   Does chat polling cause memory leaks? (Check network tab).
    *   Does the generated PDF layout correctly across multiple pages?
    *   Does the Razorpay webhook accurately update the DB to prevent double charging?

---

## ⚡ STEP 11 — BUILD PLAN (14 DAYS)

*   **Day 1-2 (Foundation):** Next.js setup, Tailwind config, Clerk Auth integration, Supabase DB & Prisma schema connection.
*   **Day 3-4 (Dashboard & Projects):** Build sidebar layout, project creation modal, project detail page tabs.
*   **Day 5-6 (Team Collaboration):** S3 bucket setup for file uploads. Implement SWR Polling Chat system and UI.
*   **Day 7-9 (The Core - PDF Gen):** Build the multi-step approval form. Hook up Puppeteer API. Design the strict HTML template for municipal compliance.
*   **Day 10 (Payments):** Integrate Razorpay order creation and success callbacks. Lock PDF generation behind the payment layer.
*   **Day 11-12 (Polish):** Refine ShadCN UI elements, ensure loading states (loaders, disabled buttons) are active everywhere (Critical for preventing double-clicks on payments).
*   **Day 13 (Deployment):** Deploy to Vercel/Supabase. Test environment variables.
*   **Day 14 (Launch Testing):** Complete end-to-end testing with dummy Razorpay cards. Fix UI bugs. Go live.
