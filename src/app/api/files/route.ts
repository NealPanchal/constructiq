import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, name, url, type } = await req.json()

    if (!projectId || !name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Project ID, name, and URL are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify membership
    const member = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const file = await db.file.create({
      data: {
        name: name.trim(),
        url: url.trim(),
        type,
        projectId,
        uploadedBy: user.id
      }
    })

    // Log the event
    await logActivity(user.id, projectId, 'file_uploaded', `File "${file.name}" was uploaded.`)

    return NextResponse.json({ file })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
