import { getSubjects } from '@/services/referenceDataService';
import { asApiError } from '@/types/error';
import { NextApiRequest, NextApiResponse } from 'next';

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
  } catch (error: unknown) {
    const apiError = asApiError(error);
    return res
      .status(apiError.status || 500)
      .json({ error: apiError.message || 'Une erreur est survenue' });
  }
}
