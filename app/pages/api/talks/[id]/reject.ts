import { rejectTalk } from '@/services/scheduleService';
import { isOrganizer } from '@/utils/auth.utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour rejeter un talk
 * POST: Rejette un talk en attente
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier l'authentification
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  // Vérifier que l'utilisateur est un organisateur
  const userRoleId = session.user.roleId;
  if (!isOrganizer(userRoleId)) {
    return res.status(403).json({ error: 'Autorisation refusée: Réservé aux organisateurs' });
  }

  // Accepter uniquement les requêtes POST
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

    // Appeler le service pour rejeter le talk
    const rejectResult = await rejectTalk(talkId, req);

    return res.status(200).json(rejectResult);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return res.status(500).json({ error: errorMessage });
  }
}
