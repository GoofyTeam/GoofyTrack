import { NextApiRequest, NextApiResponse } from 'next';
import { getSubjects } from '@/services/referenceDataService';

/**
 * API pour récupérer tous les sujets disponibles
 * GET: Retourne la liste des sujets
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const subjects = await getSubjects();
    return res.status(200).json(subjects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
