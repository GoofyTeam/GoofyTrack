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
    const speakerTalks = await prisma.talks.findMany({
      where: { speaker_id: userId },
      include: {
        subjects: true,
        schedules: true,
        feedback: true,
        favorites: true,
        users: { select: { id: true, username: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    // 4. Fetch all other talks (exclude talks where the user is the speaker)
    const otherTalks = await prisma.talks.findMany({
      where: { speaker_id: { not: userId } },
      include: {
        subjects: true,
        schedules: true,
        feedback: true,
        favorites: true,
        users: { select: { id: true, username: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    // 5. Combine speakerTalks and otherTalks (no duplicates)
    const talks = [...speakerTalks, ...otherTalks];

    return res.status(200).json({ talks });
  } catch (error) {
    console.error('Error fetching user talks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
