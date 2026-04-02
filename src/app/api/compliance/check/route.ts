import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { runComplianceCheck } from '@/lib/complianceEngine'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, plotSize, floors, buildingHeight, city } = await req.json()

    if (!projectId || !city) {
      return NextResponse.json({ error: 'Project ID and City are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 1. Run the engine
    const checkResult = await runComplianceCheck(projectId, {
      plotSize: Number(plotSize),
      floors: Number(floors),
      buildingHeight: Number(buildingHeight),
      city
    });

    // 2. Save check result to database
    const complianceCheck = await db.complianceCheck.create({
      data: {
        projectId,
        inputData: { plotSize, floors, buildingHeight, city },
        result: checkResult.status,
        violations: {
          create: checkResult.violations.map(v => ({
            message: v.message,
            severity: v.severity,
            suggestion: v.suggestion
          }))
        }
      },
      include: {
        violations: true
      }
    });

    return NextResponse.json({ 
      check: complianceCheck,
      violations: complianceCheck.violations
    });
  } catch (error) {
    console.error('Compliance Check failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
