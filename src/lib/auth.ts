import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './prisma';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Only select needed fields to minimize data transfer
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
          select: {
            id: true,
            username: true,
            password: true,
            nama: true,
            email: true,
            role: true,
          },
        });

        if (!admin) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password as string, admin.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: admin.id.toString(),
          name: admin.nama,
          email: admin.email || admin.username,
          role: admin.role,
        };
      },
    }),
  ],
});
