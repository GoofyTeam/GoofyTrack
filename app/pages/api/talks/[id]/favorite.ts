import { toggleFavorite } from '@/services/favoriteService';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour toggle un talk en favoris
 * POST: Ajouter/retirer un talk des favoris
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer l'ID du talk depuis l'URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'ID de talk invalide' });
    }

    const talkId = parseInt(id);

    // Appeler le service pour toggle le favoris
    const result = await toggleFavorite(talkId, req);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
