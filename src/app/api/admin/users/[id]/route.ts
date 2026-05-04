import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, role } = body

    if (id === (session.user as any).id && role) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Failed to update user:', error)
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    if (error.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (id === (session.user as any).id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    if (error.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
