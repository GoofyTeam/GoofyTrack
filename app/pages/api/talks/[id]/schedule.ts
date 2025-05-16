// pages/api/talks/[id]/schedule.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const talkId = parseInt(req.query.id as string, 10);
  if (Number.isNaN(talkId)) {
    return res.status(400).json({ error: 'Invalid talk ID' });
  }

  // — AUTH —
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id, 10) },
    include: { roles: true },
  });
  if (!user || user.roles.name !== 'organizer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // — PARSE BODY —
  const { roomId, startTime, endTime } = req.body as {
    roomId?: number;
    startTime?: string;
    endTime?: string;
  };
  if (
    typeof roomId !== 'number' ||
    !startTime ||
    !endTime ||
    isNaN(new Date(startTime).getTime()) ||
    isNaN(new Date(endTime).getTime())
  ) {
    return res.status(400).json({ error: 'roomId, startTime & endTime are required' });
  }
  const start = new Date(startTime);
  const end = new Date(endTime);

  // — CHECK OVERLAP —
  const conflict = await prisma.schedules.findFirst({
    where: {
      room_id: roomId,
      AND: [{ start_time: { lt: end } }, { end_time: { gt: start } }],
    },
  });
  if (conflict) {
    return res.status(409).json({ error: 'Slot already taken' });
  }

  // — CREATE SCHEDULE & UPDATE TALK STATUS —
  const [newSchedule, updatedTalk] = await prisma.$transaction([
    prisma.schedules.create({
      data: {
        talk_id: talkId,
        room_id: roomId,
        start_time: start,
        end_time: end,
      },
    }),
    prisma.talks.update({
      where: { id: talkId },
      data: { status: 'scheduled', updated_at: new Date() },
    }),
  ]);

  return res.status(200).json({
    slot: {
      id: newSchedule.id,
      roomId: newSchedule.room_id,
      startTime: newSchedule.start_time,
      endTime: newSchedule.end_time,
      talkId: newSchedule.talk_id,
    },
    talk: updatedTalk,
  });
}
