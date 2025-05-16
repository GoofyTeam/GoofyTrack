// pages/api/talks/[id]/status.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { TalkStatus } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse and validate talk ID
  const talkId = parseInt(req.query.id as string, 10);
  if (Number.isNaN(talkId)) {
    return res.status(400).json({ error: 'Invalid talk ID' });
  }

  // Only allow PUT for status updates
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate
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

  // Validate incoming status
  const { status } = req.body as { status?: TalkStatus };
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'Invalid status; must be "accepted" or "rejected"' });
  }

  // Ensure the talk exists
  const existing = await prisma.talks.findUnique({ where: { id: talkId } });
  if (!existing) {
    return res.status(404).json({ error: 'Talk not found' });
  }

  // Update status
  const updated = await prisma.talks.update({
    where: { id: talkId },
    data: {
      status,
      updated_at: new Date(),
    },
  });

  return res.status(200).json(updated);
}
