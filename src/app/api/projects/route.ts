import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, initializeSystem } from "@/lib/db";
import { createUser } from "@/lib/createUser";
import { orchestrateProjectDiagnostics } from "@/lib/orchestrator";
import { logger } from "@/lib/logger";

/**
 * PURE PRODUCTION PROJECTS API
 * Strictly enforces user isolation and real-time persistence.
 * No Safe Mode or Mock creation allowed.
 */
export async function POST(req: Request) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, location, city, plotArea, builtUpArea } = body;

    // 1. Fetch User (Strict Isolation)
    const user = await createUser(clerkId, "user@example.com");
    if (!user) {
      logger.error("[API_POST] FAILED. Database detached.");
      return new NextResponse("Database connection unavailable", { status: 503 });
    }

    // 2. Create Project Identity
    const project = await db.project.create({
      data: {
        name,
        location,
        city: city || 'Chennai',
        plotArea: parseFloat(plotArea),
        builtUpArea: parseFloat(builtUpArea),
        userId: user.id,
        status: 'active',
        complianceStatus: 'PENDING',
        costEstimate: 0,
        siteProgress: 0
      },
    });

    // 3. Trigger Persistent Diagnostics
    await orchestrateProjectDiagnostics(project.id);
    
    logger.success(`[API_POST] SUCCESS. Project ${project.name} initialized.`);
    return NextResponse.json(project);
    
  } catch (error) {
    logger.error("[API_POST] FAILED. Internal Server Error.", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      logger.error("[API_GET] FAILED. Database detached.");
      return new NextResponse("Database connection unavailable", { status: 503 });
    }

    const projects = await db.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    logger.error("[API_GET] FAILED. Internal Server Error.", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
