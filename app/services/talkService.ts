import { prisma } from '@/lib/prisma';
import { isOrganizer } from '@/utils/auth.utils';
import { Prisma } from '@prisma/client';
import { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react';

// Définir les interfaces pour les données de schedule
interface ScheduleInput {
  room_id: number;
  start_time: string | Date;
  end_time: string | Date;
}

interface ScheduleData {
  room_id: number;
  start_time: Date;
  end_time: Date;
}

// Constantes pour les horaires
const MIN_HOUR = 9; // 9h
const MAX_HOUR = 19; // 19h

/**
 * Vérifie si l'utilisateur est authentifié et a les droits pour modifier/supprimer un talk
 * @param req Requête API
 * @param talkId ID du talk
 * @returns Un objet contenant userId, isAuthorized et isOrganizer
 */
export async function checkTalkPermissions(req: NextApiRequest, talkId: number) {
  // Récupérer la session de l'utilisateur
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userId = parseInt(session.user.id);
  const userRoleId = session.user.roleId;

  // Vérifier si l'utilisateur est un organisateur
  const userIsOrganizer = isOrganizer(userRoleId);

  // Si l'utilisateur n'est pas un organisateur, vérifier s'il est le propriétaire du talk
  let isOwner = false;

  if (!userIsOrganizer) {
    const talk = await prisma.talks.findUnique({
      where: { id: talkId },
      select: { speaker_id: true },
    });

    if (!talk) {
      throw new Error('Talk not found');
    }

    isOwner = talk.speaker_id === userId;
  }

  const isAuthorized = userIsOrganizer || isOwner;

  if (!isAuthorized) {
    throw new Error('Unauthorized: You do not have permission to modify this talk');
  }

  return {
    userId,
    isAuthorized,
    isOrganizer: userIsOrganizer,
    isOwner,
  };
}

/**
 * Vérifie si les horaires du talk sont valides (entre 9h et 19h)
 * @param startTime Heure de début
 * @param endTime Heure de fin
 * @returns true si les horaires sont valides, false sinon
 */
export function validateTalkSchedule(startTime: Date, endTime: Date): boolean {
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();

  // Vérifier que l'heure de début est après 9h
  if (startHour < MIN_HOUR) {
    return false;
  }

  // Vérifier que l'heure de fin est avant 19h
  // Si l'heure est 19h, les minutes doivent être 0
  if (endHour > MAX_HOUR || (endHour === MAX_HOUR && endMinutes > 0)) {
    return false;
  }

  // Vérifier que l'heure de début est avant l'heure de fin
  if (startTime >= endTime) {
    return false;
  }

  return true;
}

/**
 * Supprime un talk
 * @param talkId ID du talk à supprimer
 * @param req Requête API
 * @returns Le talk supprimé
 */
export async function deleteTalk(talkId: number, req: NextApiRequest) {
  // Vérifier les permissions
  await checkTalkPermissions(req, talkId);

  // Supprimer le talk
  return prisma.talks.delete({
    where: { id: talkId },
  });
}

/**
 * Met à jour un talk
 * @param talkId ID du talk à mettre à jour
 * @param data Données à mettre à jour
 * @param req Requête API
 * @returns Le talk mis à jour
 */
// Utiliser un type d'intersection avec Prisma.talksUpdateInput pour garantir la compatibilité
type UpdateTalkData = {
  schedules?: ScheduleInput | ScheduleInput[];
  subject_id?: number; // Ajout de subject_id pour la connexion avec la table subjects
} & Omit<Prisma.talksUpdateInput, 'schedules' | 'users' | 'subjects' | 'favorites' | 'feedback'>;

export async function updateTalk(talkId: number, data: UpdateTalkData, req: NextApiRequest) {
  // Vérifier les permissions
  const { isOrganizer: userIsOrganizer } = await checkTalkPermissions(req, talkId);

  // Créer un objet de données de mise à jour compatible avec Prisma
  const updateData: Prisma.talksUpdateInput = {};

  // Copier les propriétés valides de data vers updateData
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.duration) updateData.duration = data.duration;
  if (data.level) updateData.level = data.level;
  if (data.subject_id) {
    updateData.subjects = {
      connect: { id: data.subject_id },
    };
  }

  // Si l'utilisateur est un organisateur, il peut modifier le statut
  if (userIsOrganizer && data.status) {
    updateData.status = data.status;
  }

  // Vérifier si le talk a des plannings
  const schedulesToCreate: ScheduleData[] = [];

  if (data.schedules) {
    // Gérer le cas où schedules est un tableau (plusieurs jours/salles)
    const schedulesArray: ScheduleInput[] = Array.isArray(data.schedules)
      ? data.schedules
      : [data.schedules];

    // Vérifier chaque schedule
    for (const schedule of schedulesArray) {
      if (schedule && schedule.start_time && schedule.end_time) {
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
        const roomId = schedule.room_id;

        if (!roomId) {
          throw new Error('Room ID is required for scheduling a talk');
        }

        // Vérifier que les horaires sont valides
        if (!validateTalkSchedule(startTime, endTime)) {
          throw new Error('Invalid schedule: Talks must be scheduled between 9:00 and 19:00');
        }

        // Vérifier qu'il n'y a pas de conflit avec d'autres talks dans la même salle
        const existingSchedules = await prisma.schedules.findMany({
          where: {
            room_id: roomId,
            talk_id: { not: talkId },
            OR: [
              {
                // Commence pendant un autre talk
                start_time: {
                  gte: startTime,
                  lt: endTime,
                },
              },
              {
                // Finit pendant un autre talk
                end_time: {
                  gt: startTime,
                  lte: endTime,
                },
              },
              {
                // Englobe un autre talk
                AND: [{ start_time: { lte: startTime } }, { end_time: { gte: endTime } }],
              },
            ],
          },
        });

        if (existingSchedules.length > 0) {
          throw new Error(
            `Schedule conflict: Another talk is already scheduled in room ${roomId} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`,
          );
        }

        // Ajouter ce schedule à la liste à créer
        schedulesToCreate.push({
          room_id: roomId,
          start_time: startTime,
          end_time: endTime,
        });
      }
    }
  }

  // Utiliser une transaction pour mettre à jour le talk et gérer les schedules
  return prisma.$transaction(async (tx) => {
    // 1. Mettre à jour le talk
    const updatedTalk = await tx.talks.update({
      where: { id: talkId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        subjects: true,
      },
    });

    // 2. Gérer les schedules
    if (schedulesToCreate.length > 0) {
      // Récupérer les schedules existants pour ce talk
      const existingSchedules = await tx.schedules.findMany({
        where: { talk_id: talkId },
      });

      // Si l'utilisateur a envoyé des schedules, on supprime tous les anciens et on crée les nouveaux
      // Cette approche est plus simple que d'essayer de mettre à jour les existants
      if (existingSchedules.length > 0) {
        // Supprimer tous les schedules existants
        await tx.schedules.deleteMany({
          where: { talk_id: talkId },
        });
      }

      // Créer tous les nouveaux schedules
      for (const schedule of schedulesToCreate) {
        await tx.schedules.create({
          data: {
            talk_id: talkId,
            room_id: schedule.room_id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          },
        });
      }
    }

    // Récupérer le talk mis à jour avec son schedule
    return tx.talks.findUnique({
      where: { id: talkId },
      include: {
        schedules: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        subjects: true,
      },
    });
  });
}
