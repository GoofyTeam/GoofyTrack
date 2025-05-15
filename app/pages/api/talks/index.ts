// pages/api/talks/index.ts
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { createTalkSchema } from '@/schemas/talkSchemas';
import { isConferencier } from '@/utils/auth.utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  /* ---------- 1. authenticate ---------- */
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthenticated' });

  /* ---------- 2. validate body ---------- */
  const parse = createTalkSchema.safeParse({
    ...req.body,
    subject: req.body.topic,
  });
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { data } = parse;

  try {
    /* ---------- 3. vérifier les permissions ---------- */
    const userId = Number(session.user.id);
    const userRoleId = session.user.roleId;

    const userIsConferencier = isConferencier(userRoleId);

    if (!userIsConferencier) {
      return res.status(403).json({ error: 'Seuls les conférenciers peuvent soumettre des talks' });
    }

    const talkStatus = 'pending';

    /* ---------- 4. create talk ---------- */
    // Find the subject by name (assuming 'topic' is the subject name)
    const subject = await prisma.subjects.findUnique({
      where: { name: data.subject },
      select: { id: true },
    });
    if (!subject) return res.status(400).json({ error: 'Subject not found' });

    const talk = await prisma.talks.create({
      data: {
        title: data.title,
        description: data.description,
        speaker_id: userId,
        subject_id: subject.id,
        duration: data.duration,
        level: data.level,
        status: talkStatus,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        subjects: true,
      },
    });

    return res.status(201).json(talk);
  } catch (err) {
    console.error('[POST /api/talks]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
