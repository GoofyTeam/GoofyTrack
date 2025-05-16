import { roomAvailabilitySchema } from '@/schemas/talkSchemas';
import { checkRoomAvailability } from '@/services/scheduleService';
import { asApiError } from '@/types/error';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour vérifier la disponibilité d'une salle à un créneau horaire
 * GET: Vérifier si une salle est disponible
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const validationResult = roomAvailabilitySchema.safeParse({
      roomId: parseInt(req.query.roomId as string),
      startTime: req.query.startTime as string,
      endTime: req.query.endTime as string,
      excludeTalkId: req.query.excludeTalkId
        ? parseInt(req.query.excludeTalkId as string)
        : undefined,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { roomId, startTime, endTime, excludeTalkId } = validationResult.data;

    const result = await checkRoomAvailability(
      roomId,
      new Date(startTime),
      new Date(endTime),
      excludeTalkId,
    );

    return res.status(200).json(result);
  } catch (error: unknown) {
    const apiError = asApiError(error);
    return res
      .status(apiError.status || 500)
      .json({ error: apiError.message || 'Une erreur est survenue' });
  }
}
