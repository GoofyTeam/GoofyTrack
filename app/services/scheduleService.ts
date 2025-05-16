import { prisma } from '@/lib/prisma';
import { isOrganizer } from '@/utils/auth.utils';
import { Prisma } from '@prisma/client';
import { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react';

// Constantes pour les horaires
const MIN_HOUR = 9; // 9h
const MAX_HOUR = 19; // 19h

/**
 * Vérifie si une salle est disponible pour une plage horaire donnée
 * @param roomId ID de la salle
 * @param startTime Heure de début
 * @param endTime Heure de fin
 * @param excludeTalkId ID du talk à exclure de la vérification (pour les updates)
 * @returns true si la salle est disponible, false sinon
 */
export async function checkRoomAvailability(
  roomId: number,
  startTime: Date,
  endTime: Date,
  excludeTalkId?: number,
) {
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();

  if (startHour < MIN_HOUR) {
    throw new Error('Les talks doivent commencer après 9h');
  }

  if (endHour > MAX_HOUR || (endHour === MAX_HOUR && endMinutes > 0)) {
    throw new Error('Les talks doivent se terminer avant 19h');
  }

  if (startTime >= endTime) {
    throw new Error("L'heure de début doit être antérieure à l'heure de fin");
  }

  const room = await prisma.rooms.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Salle non trouvée');
  }
  const conflictCondition: Prisma.schedulesWhereInput = {
    room_id: roomId,
    OR: [
      { start_time: { gte: startTime, lt: endTime } },
      { end_time: { gt: startTime, lte: endTime } },
      { AND: [{ start_time: { lte: startTime } }, { end_time: { gte: endTime } }] },
    ],
  };

  // Si on exclut un talk (pour les mises à jour), ajouter cette condition
  if (excludeTalkId) {
    conflictCondition['talk_id'] = { not: excludeTalkId };
  }

  const existingSchedules = await prisma.schedules.findMany({
    where: conflictCondition,
    include: {
      talk: {
        select: {
          title: true,
        },
      },
    },
  });

  return {
    available: existingSchedules.length === 0,
    conflicts: existingSchedules.map((schedule) => ({
      id: schedule.id,
      talkId: schedule.talk_id,
      talkTitle: schedule.talk.title,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
    })),
  };
}

/**
 * Récupère les horaires disponibles pour une salle donnée à une date spécifique
 * @param roomId ID de la salle
 * @param date Date à vérifier
 * @returns Les plages horaires disponibles pour la salle
 */
export async function getAvailableTimesForRoom(roomId: number, date: string | Date) {
  const targetDate = new Date(date);

  targetDate.setHours(0, 0, 0, 0);

  const dayStart = new Date(targetDate);
  dayStart.setHours(MIN_HOUR, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setHours(MAX_HOUR, 0, 0, 0);

  const schedules = await prisma.schedules.findMany({
    where: {
      room_id: roomId,
      start_time: {
        gte: dayStart,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Jour suivant
      },
    },
    orderBy: {
      start_time: 'asc',
    },
  });

  if (schedules.length === 0) {
    return [
      {
        startTime: dayStart,
        endTime: dayEnd,
      },
    ];
  }

  const availableSlots = [];
  let currentTime = dayStart;

  for (const schedule of schedules) {
    if (currentTime < schedule.start_time) {
      availableSlots.push({
        startTime: currentTime,
        endTime: schedule.start_time,
      });
    }
    currentTime = schedule.end_time;
  }

  if (currentTime < dayEnd) {
    availableSlots.push({
      startTime: currentTime,
      endTime: dayEnd,
    });
  }

  return availableSlots;
}

/**
 * Récupère les salles disponibles pour une plage horaire donnée
 * @param startTime Heure de début
 * @param endTime Heure de fin
 * @returns Liste des salles disponibles
 */
export async function getAvailableRoomsForTimeSlot(startTime: Date, endTime: Date) {
  // Vérifier que les horaires sont valides (entre 9h et 19h)
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();

  if (startHour < MIN_HOUR) {
    throw new Error('Les talks doivent commencer après 9h');
  }

  if (endHour > MAX_HOUR || (endHour === MAX_HOUR && endMinutes > 0)) {
    throw new Error('Les talks doivent se terminer avant 19h');
  }

  if (startTime >= endTime) {
    throw new Error("L'heure de début doit être antérieure à l'heure de fin");
  }

  // Récupérer toutes les salles
  const allRooms = await prisma.rooms.findMany();

  // Récupérer les salles qui ont déjà un schedule dans cette plage horaire
  const scheduledRooms = await prisma.schedules.findMany({
    where: {
      OR: [
        {
          start_time: {
            gte: startTime,
            lt: endTime,
          },
        },
        {
          end_time: {
            gt: startTime,
            lte: endTime,
          },
        },
        {
          AND: [{ start_time: { lte: startTime } }, { end_time: { gte: endTime } }],
        },
      ],
    },
    select: {
      room_id: true,
    },
  });

  // Construire un ensemble des IDs de salles occupées
  const occupiedRoomIds = new Set(scheduledRooms.map((schedule) => schedule.room_id));

  // Filtrer les salles disponibles
  const availableRooms = allRooms.filter((room) => !occupiedRoomIds.has(room.id));

  return availableRooms;
}

/**
 * Valide un talk et l'attribue à une salle pour une plage horaire donnée
 * @param talkId ID du talk à valider
 * @param roomId ID de la salle
 * @param startTime Heure de début
 * @param endTime Heure de fin
 * @param req Requête API
 * @returns Le talk mis à jour
 */
export async function validateTalk(
  talkId: number,
  roomId: number,
  startTime: Date,
  endTime: Date,
  req: NextApiRequest,
) {
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userRoleId = session.user.roleId;

  if (!isOrganizer(userRoleId)) {
    throw new Error('Unauthorized: Only organizers can validate talks');
  }

  // Vérifier que le talk existe et qu'il est en attente
  const talk = await prisma.talks.findUnique({
    where: { id: talkId },
  });

  if (!talk) {
    throw new Error('Talk not found');
  }

  if (talk.status !== 'pending') {
    throw new Error('Only pending talks can be validated');
  }

  const availability = await checkRoomAvailability(roomId, startTime, endTime);

  if (!availability.available) {
    throw new Error(
      `Room is not available at the requested time slot. Conflicts with: ${availability.conflicts
        .map((c) => c.talkTitle)
        .join(', ')}`,
    );
  }

  // Mettre à jour le talk et créer le schedule
  return prisma.$transaction(async (tx) => {
    // Mettre à jour le statut du talk
    const updatedTalk = await tx.talks.update({
      where: { id: talkId },
      data: {
        status: 'scheduled',
      },
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

    // Créer le schedule
    const schedule = await tx.schedules.create({
      data: {
        talk_id: talkId,
        room_id: roomId,
        start_time: startTime,
        end_time: endTime,
      },
    });

    return {
      ...updatedTalk,
      schedule,
    };
  });
}

/**
 * Rejette un talk
 * @param talkId ID du talk à rejeter
 * @param req Requête API
 * @returns Le talk mis à jour
 */
export async function rejectTalk(talkId: number, req: NextApiRequest) {
  // Vérifier que l'utilisateur est un organisateur
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userRoleId = session.user.roleId;

  if (!isOrganizer(userRoleId)) {
    throw new Error('Unauthorized: Only organizers can reject talks');
  }

  // Vérifier que le talk existe et qu'il est en attente
  const talk = await prisma.talks.findUnique({
    where: { id: talkId },
  });

  if (!talk) {
    throw new Error('Talk not found');
  }

  if (talk.status !== 'pending') {
    throw new Error('Only pending talks can be rejected');
  }

  // Mettre à jour le statut du talk
  return prisma.talks.update({
    where: { id: talkId },
    data: {
      status: 'rejected',
    },
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
}

/**
 * Accepte un talk
 * @param talkId ID du talk à accepter
 * @param req Requête API
 * @returns Le talk mis à jour
 */
export async function acceptTalk(talkId: number, req: NextApiRequest) {
  // Vérifier que l'utilisateur est un organisateur
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userRoleId = session.user.roleId;

  if (!isOrganizer(userRoleId)) {
    throw new Error('Unauthorized: Only organizers can accept talks');
  }

  const talk = await prisma.talks.findUnique({
    where: { id: talkId },
  });

  if (!talk) {
    throw new Error('Talk not found');
  }

  if (talk.status !== 'pending') {
    throw new Error('Only pending talks can be accepted');
  }

  return prisma.talks.update({
    where: { id: talkId },
    data: {
      status: 'accepted',
    },
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
}
