import { prisma } from '@/lib/prisma';
import { isOrganizer } from '@/utils/auth.utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { z } from 'zod';

// Schema pour la validation des données POST
const createScheduleSchema = z.object({
  talk_id: z.number().int().positive(),
  room_id: z.number().int().positive(),
  start_time: z.string().or(z.date()),
  end_time: z.string().or(z.date()),
  date: z.string().or(z.date()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Gérer les requêtes GET pour récupérer tous les schedules
  if (req.method === 'GET') {
    try {
      // Si aucun schedule n'est encore créé, générer des créneaux par défaut
      const schedulesCount = await prisma.schedules.count();

      if (schedulesCount === 0) {
        // Retourner des créneaux fictifs pour le MVP
        const defaultSchedules = [];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // On génère quelques créneaux fictifs pour démo
        const rooms = await prisma.rooms.findMany({ take: 5 });
        const talks = await prisma.talks.findMany({
          where: { status: 'accepted' },
          take: 5,
          include: {
            subjects: true,
            users: {
              select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        });

        if (rooms.length > 0 && talks.length > 0) {
          // Créer quelques schedules fictifs
          for (let i = 0; i < Math.min(talks.length, 3); i++) {
            const startHour = 9 + i * 2; // 9h, 11h, 13h...
            const endHour = startHour + 1;

            // Créer un schedule avec les bonnes relations au singulier comme dans le schéma Prisma
            await prisma.schedules.create({
              data: {
                talk_id: talks[i].id,
                room_id: rooms[i % rooms.length].id,
                start_time: new Date(today.setHours(startHour, 0, 0, 0)),
                end_time: new Date(today.setHours(endHour, 0, 0, 0)),
              },
            });

            // Ajouter à notre tableau pour la réponse
            defaultSchedules.push({
              id: i + 1,
              talk_id: talks[i].id,
              room_id: rooms[i % rooms.length].id,
              start_time: new Date(today.setHours(startHour, 0, 0, 0)),
              end_time: new Date(today.setHours(endHour, 0, 0, 0)),
              talk: talks[i],
              room: rooms[i % rooms.length],
            });
          }

          return res.status(200).json(defaultSchedules);
        }
      }

      // Récupérer tous les schedules avec leurs informations associées
      const schedules = await prisma.schedules.findMany({
        include: {
          talk: {
            include: {
              subjects: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          rooms: true,
        },
        orderBy: {
          start_time: 'asc',
        },
      });

      return res.status(200).json(schedules);
    } catch (error) {
      console.error('[GET /api/schedules]', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Gérer les requêtes POST pour créer un nouveau schedule
  if (req.method === 'POST') {
    // Vérifier l'authentification
    const session = await getSession({ req });
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Vérifier les permissions (seuls les organisateurs peuvent créer des schedules)
    const userRoleId = session.user.roleId;
    if (!isOrganizer(userRoleId)) {
      return res.status(403).json({ error: 'Seuls les organisateurs peuvent planifier des talks' });
    }

    try {
      // Valider les données reçues
      const validationResult = createScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }

      const { talk_id, room_id, start_time, end_time } = validationResult.data;

      // Vérifier si le talk existe
      const talk = await prisma.talks.findUnique({
        where: { id: talk_id },
      });

      if (!talk) {
        return res.status(404).json({ error: 'Talk non trouvé' });
      }

      // Vérifier si la salle existe
      const room = await prisma.rooms.findUnique({
        where: { id: room_id },
      });

      if (!room) {
        return res.status(404).json({ error: 'Salle non trouvée' });
      }

      // Vérifier les conflits de planning
      const conflictSchedule = await prisma.schedules.findFirst({
        where: {
          room_id: room_id,
          OR: [
            {
              // Conflit si un autre talk commence pendant celui-ci
              start_time: {
                gte: new Date(start_time),
                lt: new Date(end_time),
              },
            },
            {
              // Conflit si un autre talk se termine pendant celui-ci
              end_time: {
                gt: new Date(start_time),
                lte: new Date(end_time),
              },
            },
            {
              // Conflit si un autre talk englobe celui-ci
              AND: [
                { start_time: { lte: new Date(start_time) } },
                { end_time: { gte: new Date(end_time) } },
              ],
            },
          ],
        },
      });

      if (conflictSchedule) {
        return res.status(409).json({ error: 'Conflit de planning détecté pour cette salle' });
      }

      // Créer le nouveau schedule
      const schedule = await prisma.schedules.create({
        data: {
          talk_id,
          room_id,
          start_time: new Date(start_time),
          end_time: new Date(end_time),
        },
        include: {
          talk: {
            include: {
              subjects: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          rooms: true,
        },
      });

      // Mettre à jour le statut du talk à "scheduled"
      await prisma.talks.update({
        where: { id: talk_id },
        data: { status: 'scheduled' },
      });

      return res.status(201).json(schedule);
    } catch (error) {
      console.error('[POST /api/schedules]', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Pour toute autre méthode HTTP
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
