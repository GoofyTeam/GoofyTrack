// /pages/api/talks/index.ts
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const payloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  speakerId: z.coerce.number().int().positive(), // ← will turn "1" into 1
  subjectId: z.coerce.number().int().positive(),
  durationMinutes: z.coerce.number().int().positive(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.setHeader('Allow', ['POST']).status(405).end('Method Not Allowed');

  try {
    const data = payloadSchema.parse(req.body); // throws if invalid

    const talk = await prisma.talks.create({
      data: {
        title: data.title,
        description: data.description,
        speaker_id: data.speakerId,
        subject_id: data.subjectId,
        duration: data.durationMinutes,
        level: data.level,
      },
    });

    return res.status(201).json(talk);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('[POST /api/talks]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
