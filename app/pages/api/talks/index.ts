// pages/api/talks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) For GET, decide which talks to show based on role
  if (req.method === 'GET') {
    // now strongly typed
    const filter: Prisma.talksWhereInput = { status: 'scheduled' };

    const talks = await prisma.talks.findMany({
      where: filter,
      include: {
        subjects: true,
        schedules: true,
        feedback: true,
        favorites: true,
        users: { select: { id: true, username: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ talks });
  }

  // 2) For other methods (POST, etc), we still require auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // 3) Load user
  const userId = parseInt(session.user.id, 10);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // 4) Branch POST (only speakers/orgs)
  if (req.method === 'POST') {
    const role = user.roles.name;
    if (role !== 'speaker' && role !== 'organizer')
      return res.status(403).json({ error: 'Forbidden' });

    const { title, description, topic, durationMinutes, level } = req.body;
    if (!title || !description || !topic || !durationMinutes || !level)
      return res.status(400).json({ error: 'Missing fields' });

    const subject = await prisma.subjects.findUnique({ where: { name: topic } });
    if (!subject) return res.status(400).json({ error: `Subject "${topic}" not found` });

    const newTalk = await prisma.talks.create({
      data: {
        title,
        description,
        speaker_id: user.id,
        subject_id: subject.id,
        duration: durationMinutes,
        level,
        status: role === 'organizer' ? 'accepted' : 'pending',
      },
    });
    return res.status(201).json(newTalk);
  }

  // 5) All other methods — 405
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
