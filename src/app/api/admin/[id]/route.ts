import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, email, role, password } = body; // Password optional here for update

    const updateData: any = {
      nama,
      email,
      role,
    };

    if (password) {
      updateData.password = await hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: parseInt(session.user?.id || '0'),
        action: 'update',
        module: 'admin',
        description: `Update admin: ${updatedAdmin.username}`,
        metadata: { updatedAdminId: updatedAdmin.id, changes: updateData },
      },
    });

    return NextResponse.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const adminId = parseInt(id);

    // Prevent deleting self
    if (adminId === parseInt(session.user?.id || '0')) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
    }

    const deletedToken = await prisma.admin.delete({
      where: { id: adminId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: parseInt(session.user?.id || '0'),
        action: 'delete',
        module: 'admin',
        description: `Menghapus admin: ${deletedToken.username}`,
        metadata: { deletedAdminId: adminId },
      },
    });

    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}
