import { getAvailableRoomsForTimeSlot } from '@/services/scheduleService';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour récupérer les salles disponibles pour un créneau horaire spécifique
 * GET: Retourne les salles disponibles
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
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime et endTime sont requis' });
    }

    const availableRooms = await getAvailableRoomsForTimeSlot(
      new Date(startTime as string),
      new Date(endTime as string),
    );

    return res.status(200).json(availableRooms);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Une erreur inconnue est survenue' });
  }
}
