import { getAvailableTimesForRoom } from '@/services/scheduleService';
import { asApiError } from '@/types/error';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour récupérer les créneaux disponibles pour une salle à une date spécifique
 * GET: Retourne les créneaux disponibles
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier l'authentification
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  // Accepter uniquement les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { roomId, date } = req.query;

    if (!roomId || !date) {
      return res.status(400).json({ error: 'roomId et date sont requis' });
    }

    const availableTimes = await getAvailableTimesForRoom(
      parseInt(roomId as string),
      date as string,
    );

    return res.status(200).json(availableTimes);
  } catch (error: unknown) {
    const apiError = asApiError(error);
    return res
      .status(apiError.status || 500)
      .json({ error: apiError.message || 'Une erreur est survenue' });
  }
}
