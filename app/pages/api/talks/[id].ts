import { deleteTalk, updateTalk } from '@/services/talkService';
import { Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validate and coerce the `id` route parameter to a positive integer
const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = paramsSchema.parse({ id: req.query.id });

    switch (req.method) {
      case 'DELETE': {
        const deletedTalk = await deleteTalk(id, req);
        return res.status(200).json(deletedTalk);
      }
      case 'PUT': {
        const updatedTalk = await updateTalk(id, req.body, req);
        return res.status(200).json(updatedTalk);
      }
      default:
        return res.setHeader('Allow', ['DELETE', 'PUT']).status(405).end('Method Not Allowed');
    }
  } catch (err) {
    // Validation error — the `id` param was missing or invalid
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid `id` parameter' });
    }

    // Record not found — translate Prisma error code P2025 into a 404
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Talk not found' });
    }

    if (err instanceof Error && err.message.startsWith('Unauthorized')) {
      return res.status(401).json({ error: err.message });
    }

    if (
      err instanceof Error &&
      (err.message.startsWith('Invalid schedule') || err.message.startsWith('Schedule conflict'))
    ) {
      return res.status(400).json({ error: err.message });
    }

    console.error('[API /talks/:id]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
