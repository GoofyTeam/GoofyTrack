// pages/api/talks/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Authenticate
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = parseInt(session.user.id, 10);

  // 2. Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 3. Fetch all talks where the current user is the speaker
    const talks = await prisma.talks.findMany({
      where: { speaker_id: userId },
      include: {
        subjects: true, // if you want the topic name
        schedules: true, // if you want any scheduled slots
        feedback: true, // feedback for each talk
        favorites: true, // who favorited it
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ talks });
  } catch (error) {
    console.error('Error fetching user talks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
