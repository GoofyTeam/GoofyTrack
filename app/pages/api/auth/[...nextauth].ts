import { prisma } from '@/lib/prisma';
import { roleToRoleId } from '@/utils/auth.utils';
import bcrypt from 'bcrypt';
import NextAuth, { User } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roleId: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface ExtendedUser extends User {
  roleId: number;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isRegister: { label: 'Register', type: 'boolean' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing email or password');
          throw new Error('Missing email or password');
        }

        const { email, password, name, role, isRegister } = credentials;

        try {
          if (isRegister === 'true') {
            // Handle registration
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
              console.error('User already exists');
              throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const roleId = roleToRoleId(role);
            const newUser = await prisma.user.create({
              data: {
                email,
                password: hashedPassword,
                username: name,
                role_id: roleId,
              },
            });

            return {
              id: newUser.id.toString(),
              name: newUser.username,
              email: newUser.email,
              roleId: roleId,
            };
          } else {
            // Handle login
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              console.error('User not found');
              throw new Error('Invalid email or password');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
              console.error('Invalid password');
              throw new Error('Invalid email or password');
            }

            return {
              id: user.id.toString(),
              name: user.username,
              email: user.email,
              roleId: user.role_id,
            };
          }
        } catch (error) {
          console.error('Error in authorize function:', error);
          throw new Error('Internal server error');
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roleId = token.roleId as number;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = (user as ExtendedUser).roleId;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
