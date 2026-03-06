import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  pages: {
    signIn: '/sign-in',
  },

  callbacks: {
    session({ session, user }) {
      // Inject id + role into the session object
      session.user.id = user.id;
      session.user.role = (user as { role?: string }).role ?? 'user';
      return session;
    },
  },
});
