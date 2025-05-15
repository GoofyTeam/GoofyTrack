import { getTalkLevels } from '@/services/referenceDataService';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API pour récupérer tous les niveaux de talks disponibles
 * GET: Retourne la liste des niveaux
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const levels = await getTalkLevels();
    return res.status(200).json(levels);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
