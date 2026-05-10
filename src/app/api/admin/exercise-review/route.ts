import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function canPublish(status?: string) {
  return status === 'approved' || status === 'published'
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, table, qualityStatus, publishStatus, reviewNotes, rejectionReason } = body
    if (!id || !['official', 'generated'].includes(table)) {
      return NextResponse.json({ error: 'Missing exercise id or table.' }, { status: 400 })
    }

    const data = {
      qualityStatus,
      publishStatus,
      reviewNotes: reviewNotes || undefined,
      rejectionReason: rejectionReason || undefined,
      reviewedAt: new Date(),
      approvedAt: canPublish(publishStatus) || qualityStatus === 'approved' ? new Date() : undefined,
      archivedAt: publishStatus === 'archived' ? new Date() : undefined,
      isPublished: table === 'official' ? canPublish(publishStatus) : undefined,
      isPublic: table === 'official' ? canPublish(publishStatus) : undefined,
    }

    const exercise = table === 'official'
      ? await prisma.exercise.update({ where: { id }, data })
      : await prisma.aIGeneratedExercise.update({ where: { id }, data })

    return NextResponse.json({ success: true, exercise })
  } catch (error) {
    console.error('Exercise review update failed:', error)
    return NextResponse.json({ error: 'Could not update the exercise review status.' }, { status: 500 })
  }
}
