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

    const { projectId, title, description, priority, dueDate } = await req.json()

    if (!projectId || !title?.trim()) {
      return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
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

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId
      }
    })

    // Log the event
    await logActivity(user.id, projectId, 'task_created', `Task "${task.title}" was added.`)

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
