import { acceptTalk } from '@/services/scheduleService';
import { isOrganizer } from '@/utils/auth.utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * API pour accepter un talk (sans lui attribuer une salle/créneau)
 * POST: Accepte un talk en attente
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const userRoleId = session.user.roleId;
  if (!isOrganizer(userRoleId)) {
    return res.status(403).json({ error: 'Autorisation refusée: Réservé aux organisateurs' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'ID de talk invalide' });
    }

    const talkId = parseInt(id);

    const acceptResult = await acceptTalk(talkId, req);

    return res.status(200).json(acceptResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
