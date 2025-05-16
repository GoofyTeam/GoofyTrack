import { prisma } from '@/lib/prisma';
import { getAvailableTimesForRoom } from '@/services/scheduleService';
import { asApiError } from '@/types/error';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API pour récupérer les créneaux disponibles pour une salle à une date spécifique
 * GET: Retourne les créneaux disponibles
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pour les requêtes GET, nous permettons l'accès sans authentification
  // Vérifier l'authentification
  // const session = await getSession({ req });
  // if (!session?.user) {
  //   return res.status(401).json({ error: 'Authentification requise' });
  // }
  // L'authentification sera vérifiée côté front-end pour afficher ou non les fonctionalités de planification

  // Accepter uniquement les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { roomId, date } = req.query;

    // Si roomId et date sont fournis, retourner les créneaux disponibles pour cette salle et cette date
    if (roomId && date) {
      const availableTimes = await getAvailableTimesForRoom(
        parseInt(roomId as string),
        date as string,
      );
      return res.status(200).json(availableTimes);
    }

    // Si aucun paramètre n'est fourni, retourner tous les créneaux horaires disponibles
    // Générer des créneaux horaires de 9h à 19h par défaut
    const defaultSlots = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // On génère des créneaux pour aujourd'hui et demain
    for (let day = 0; day < 2; day++) {
      const date = day === 0 ? today : tomorrow;
      const [dateString] = date.toISOString().split('T');

      const rooms = await prisma.rooms.findMany();
      for (const room of rooms) {
        for (let hour = 9; hour < 19; hour++) {
          const startHour = `${hour.toString().padStart(2, '0')}:00`;
          const endHour = `${(hour + 1).toString().padStart(2, '0')}:00`;

          const existingSchedule = await prisma.schedules.findFirst({
            where: {
              room_id: room.id,
              start_time: {
                gte: new Date(`${dateString}T${startHour}:00`),
                lt: new Date(`${dateString}T${endHour}:00`),
              },
            },
          });

          // Si le créneau n'est pas réservé, l'ajouter à la liste
          if (!existingSchedule) {
            defaultSlots.push({
              id: `${room.id}-${dateString}-${hour}`,
              date: dateString,
              start_time: startHour,
              end_time: endHour,
              room_id: room.id,
              talk_id: null,
            });
          }
        }
      }
    }

    return res.status(200).json(defaultSlots);
  } catch (error: unknown) {
    const apiError = asApiError(error);
    return res
      .status(apiError.status || 500)
      .json({ error: apiError.message || 'Une erreur est survenue' });
  }
}
