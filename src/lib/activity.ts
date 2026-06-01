import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function logActivity(action: 'create' | 'update' | 'delete' | 'login' | 'logout', module: 'siswa' | 'guru' | 'sarpras' | 'kegiatan' | 'dokumen', description: string, entityId?: number, metadata?: any) {
  try {
    const session = await auth();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // If no session (e.g. login attempt), we might not have adminId
    const adminId = session?.user?.id ? parseInt(session.user.id) : null;

    await prisma.activityLog.create({
      data: {
        adminId,
        action,
        module,
        entityId,
        description,
        metadata: metadata ?? undefined,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid blocking the main action
  }
}
