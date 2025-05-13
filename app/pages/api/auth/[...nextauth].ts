import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required environment variables for authentication providers.');
}

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

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isRegister: { label: 'Register', type: 'hidden' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { email, password, name, isRegister } = credentials;

        if (isRegister === 'true') {
          console.log('register');

          return { id: email.toString(), name, email: email };
        } else {
          const user = await authenticateUser(email, password);
          if (user) {
            return user;
          }

          throw new Error('Invalid email or password.');
        }
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) throw new Error('no account');

      if (account.provider === 'google') {
        console.log('google');
      }

      return true; // Allow sign-in
    },
    async session({ session }) {
      if (!session.user?.email) throw new Error('no account');

      console.log('session');

      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});

async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && user.password === Buffer.from(password).toString('base64')) {
    return { id: user.id.toString(), name: user.username, email: user.email };
  }

  return null;
}
