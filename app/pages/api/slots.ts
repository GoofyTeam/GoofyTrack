// pages/api/slots.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // require an authenticated user, but no role check:
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const schedules = await prisma.schedules.findMany({
    include: { rooms: true },
    orderBy: { start_time: 'asc' },
  });

  const slots = schedules.map((s) => ({
    id: s.id.toString(),
    roomId: s.room_id.toString(),
    date: s.start_time,
    startTime: s.start_time.toISOString(),
    endTime: s.end_time.toISOString(),
    talkId: s.talk_id?.toString() ?? '',
  }));

  return res.status(200).json({ slots });
}
