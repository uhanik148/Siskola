import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const adminId = parseInt(id);

    // Default reset password or from body?
    // Best practice: Admin sets a temporary password manually, OR system generates one.
    // The user requirement implies "Reset Password" feature.
    // We'll accept a 'newPassword' from the body, provided by the super admin.

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 10);

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: parseInt(session.user?.id || '0'),
        action: 'reset_password',
        module: 'admin',
        description: `Reset password admin: ${updatedAdmin.username}`,
        metadata: { targetAdminId: adminId },
      },
    });

    return NextResponse.json({ success: true, message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
