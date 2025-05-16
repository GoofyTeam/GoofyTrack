// pages/api/talks/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const talkId = parseInt(req.query.id as string, 10);
  if (Number.isNaN(talkId)) {
    return res.status(400).json({ error: 'Invalid talk ID' });
  }

  // Only support PUT and DELETE
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate user
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id, 10);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const role = user.roles.name;
  if (role !== 'speaker') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'PUT') {
    // Validate payload
    const { title, description, topic, durationMinutes, level } = req.body;
    if (!title || !description || !topic || !durationMinutes || !level) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Resolve subject
    const subject = await prisma.subjects.findUnique({
      where: { name: topic },
    });
    if (!subject) {
      return res.status(400).json({ error: `Subject ${topic} not found` });
    }

    // Ensure ownership
    const existing = await prisma.talks.findUnique({ where: { id: talkId } });
    if (!existing || existing.speaker_id !== user.id) {
      return res.status(404).json({ error: `Talk #${talkId} not found or you’re not the owner` });
    }

    // Perform update
    const updated = await prisma.talks.update({
      where: { id: talkId },
      data: {
        title,
        description,
        subject_id: subject.id,
        duration: durationMinutes,
        level,
        updated_at: new Date(),
      },
    });

    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    // Delete the talk owned by the speaker
    const result = await prisma.talks.deleteMany({
      where: {
        id: talkId,
        speaker_id: user.id,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: `Talk #${talkId} not found or you’re not the owner` });
    }

    return res.status(204).end();
  }
}
