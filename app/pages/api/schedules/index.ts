// pages/api/schedules.ts
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

type RawSchedule = {
  id: number;
  talk_id: number;
  room_id: number;
  start_time: Date;
  end_time: Date;
  // **Here** we use `speaker_id`, not `speakerId`
  talk: {
    id: number;
    title: string;
    speaker_id: number;
    // …other fields if you need them
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date } = req.query as { date?: string };
  if (req.method !== 'GET' || !date) {
    return res.status(400).json({ error: 'Use GET & provide ?date=YYYY-MM-DD' });
  }

  const day = new Date(date);
  const start = new Date(day);
  start.setHours(9, 0, 0, 0);
  const end = new Date(day);
  end.setHours(18, 0, 0, 0);

  // no more type‐assertion here: let TS infer the raw type
  const raw: RawSchedule[] = await prisma.schedules.findMany({
    where: {
      start_time: { gte: start, lt: end },
    },
    include: {
      talk: true,
    },
  });

  const schedules = raw.map((s) => ({
    id: s.id,
    roomId: s.room_id, // ← note room_id → roomId
    startTime: s.start_time.toISOString(),
    endTime: s.end_time.toISOString(),
    talk: {
      id: s.talk.id,
      title: s.talk.title,
      speakerId: s.talk.speaker_id, // ← speaker_id → speakerId
    },
  }));

  return res.status(200).json({ schedules });
}
