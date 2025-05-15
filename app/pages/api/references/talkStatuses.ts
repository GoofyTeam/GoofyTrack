import { NextApiRequest, NextApiResponse } from 'next';
import { getTalkStatuses } from '@/services/referenceDataService';

/**
 * API pour récupérer tous les statuts de talks disponibles
 * GET: Retourne la liste des statuts
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const statuses = await getTalkStatuses();
    return res.status(200).json(statuses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
