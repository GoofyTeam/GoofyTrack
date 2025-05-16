import { getTalkStatuses } from '@/services/referenceDataService';
import { asApiError } from '@/types/error';
import { NextApiRequest, NextApiResponse } from 'next';

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
  } catch (error: unknown) {
    const apiError = asApiError(error);
    return res
      .status(apiError.status || 500)
      .json({ error: apiError.message || 'Une erreur est survenue' });
  }
}
