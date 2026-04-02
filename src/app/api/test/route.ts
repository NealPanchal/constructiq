import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    await db.$connect()
    return NextResponse.json({ message: 'DB Connected' })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ error: 'DB Connection Failed' }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
