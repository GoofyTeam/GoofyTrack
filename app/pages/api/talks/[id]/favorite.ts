// pages/api/talks/[id]/favorite.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const talkId = parseInt(req.query.id as string, 10);
  if (!talkId || (req.method !== 'POST' && req.method !== 'DELETE')) {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = parseInt(session.user.id, 10);
  // optional: check role is attendee
  // if (!isAttendee(session.user.roleId)) return res.status(403).json({ error: 'Forbidden' })

  try {
    if (req.method === 'POST') {
      // Create favorite (unique constraint guards duplicates)
      const fav = await prisma.favorites.create({
        data: { user_id: userId, talk_id: talkId },
      });
      return res.status(201).json(fav);
    } else {
      // DELETE: remove the favorite
      await prisma.favorites.deleteMany({
        where: { user_id: userId, talk_id: talkId },
      });
      return res.status(204).end();
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation on POST
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Already favorited' });
      }
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
