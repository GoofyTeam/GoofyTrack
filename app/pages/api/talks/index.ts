// pages/api/talks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const payloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.coerce.number().int().positive(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  /* ---------- 1. authenticate ---------- */
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthenticated' });

  /* ---------- 2. validate body ---------- */
  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { data } = parse;

  try {
    /* ---------- 3. fetch role name ---------- */
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        id: true,
        roles: { select: { name: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const roleName = user.roles.name; // e.g. "attendee" | "speaker" | "admin"
    const talkStatus = roleName === 'attendee' ? 'pending' : 'accepted';

    /* ---------- 4. create talk ---------- */
    const talk = await prisma.talks.create({
      data: {
        title: data.title,
        description: data.description,
        speaker_id: user.id,
        subject_id: data.subjectId,
        duration: data.durationMinutes,
        level: data.level,
        status: talkStatus,
      },
    });

    return res.status(201).json(talk);
  } catch (err) {
    console.error('[POST /api/talks]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
