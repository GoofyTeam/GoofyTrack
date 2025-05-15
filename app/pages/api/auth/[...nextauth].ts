import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import NextAuth, { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role; // ← now an enum value
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface ExtendedUser extends User {
  role: Role;
}

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isRegister: { label: 'Register', type: 'boolean' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' }, // expect one of Role enum keys
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const { email, password, name, role, isRegister } = credentials;

        if (isRegister === 'true') {
          // ─── Registration ───────────────────────────────────────────────
          const exists = await prisma.users.findUnique({ where: { email } });
          if (exists) {
            throw new Error('User already exists');
          }

          // hash & create with enum role
          const hashed = await bcrypt.hash(password, 12);

          // validate & coerce role string → Role enum
          const userRole = (role && Role[role as keyof typeof Role]) || Role.USER;

          const newUser = await prisma.users.create({
            data: {
              email,
              password: hashed,
              username: name!,
              role: userRole,
            },
          });

          return {
            id: newUser.id.toString(),
            name: newUser.username,
            email: newUser.email,
            role: newUser.role,
          };
        }

        // ─── Login ────────────────────────────────────────────────────────
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
});

