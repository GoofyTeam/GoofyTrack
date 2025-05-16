import { getRooms } from '@/services/referenceDataService';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API pour récupérer toutes les salles disponibles
 * GET: Retourne la liste des salles
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const rooms = await getRooms();
    return res.status(200).json(rooms);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return res.status(500).json({ error: errorMessage });
  }
}
