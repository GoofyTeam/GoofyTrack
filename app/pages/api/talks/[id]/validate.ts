import { validateTalk } from '@/services/scheduleService';
import { isOrganizer } from '@/utils/auth.utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';

// Schéma de validation pour les données de planification
const validateScheduleSchema = z.object({
  roomId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

/**
 * API pour valider un talk et l'attribuer à une salle
 * POST: Valide un talk et lui attribue une salle et un créneau
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

    // Valider les données de planification
    const validationResult = validateScheduleSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { roomId, startTime, endTime } = validationResult.data;

    // Appeler le service pour valider et planifier le talk
    const result = await validateTalk(talkId, roomId, new Date(startTime), new Date(endTime), req);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
