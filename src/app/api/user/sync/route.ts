import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import db from '@/lib/db'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: '', // Will be updated with actual email from Clerk
        name: '', // Will be updated with actual name from Clerk
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
