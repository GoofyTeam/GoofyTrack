// pages/api/rooms/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const rooms = await prisma.rooms.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ rooms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to load rooms' });
  }
}
