import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Validate and coerce the `id` route parameter to a positive integer
const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow the DELETE method for this endpoint
  if (req.method !== 'DELETE')
    return res.setHeader('Allow', ['DELETE']).status(405).end('Method Not Allowed');

  try {
    // Validate the `id` param from the query string (e.g. /api/talks/123)
    const { id } = paramsSchema.parse({ id: req.query.id });

    // Attempt to delete the talk; Prisma will throw if the record is not found
    const deletedTalk = await prisma.talks.delete({
      where: { id },
    });

    return res.status(200).json(deletedTalk);
  } catch (err) {
    // Validation error — the `id` param was missing or invalid
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: 'Invalid `id` parameter' });

    // Record not found — translate Prisma error code P2025 into a 404
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    )
      return res.status(404).json({ error: 'Talk not found' });

    // Any other unexpected error
    console.error('[DELETE /api/talks/:id]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
