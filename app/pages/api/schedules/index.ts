// pages/api/schedules/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET is allowed
  if (req.method === 'GET') {
    try {
      const schedules = await prisma.schedules.findMany({
        include: {
          rooms: true, // include room details for each schedule
        },
        orderBy: {
          start_time: 'asc', // optional: sort by start time
        },
      });

      return res.status(200).json({ schedules });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ error: 'Unable to load schedules' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
