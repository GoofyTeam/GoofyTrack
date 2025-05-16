// pages/api/talks/index.ts
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
// import le schéma de validation, à remplacer par votre schema réel
import { z } from 'zod';

// Définir un schéma de validation pour les talks
const createTalkSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  topic: z.string(),
  durationMinutes: z.number().int().positive(),
  level: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Traitement de la méthode GET
  if (req.method === 'GET') {
    try {
      let filter: Prisma.talksWhereInput = { status: 'accepted' };
      const session = await getServerSession(req, res, authOptions);

      if (session) {
        const userId = parseInt(session.user.id, 10);
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { roles: true },
        });

        // Si l'utilisateur est un organisateur, montrer tous les talks
        if (user?.roles.name === 'organizer') {
          filter = {};
        }
      }

      // Récupérer tous les talks avec leurs relations
      const talks = await prisma.talks.findMany({
        where: filter,
        include: {
          subjects: true,
          schedules: true,
          users: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      return res.status(200).json(talks);
    } catch (err) {
      console.error('[GET /api/talks]', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 2. Vérification de l'authentification pour les autres méthodes
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 3. Authentification pour POST
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthenticated' });

  // 4. Récupération de l'utilisateur et vérification du rôle
  const userId = parseInt(session.user.id, 10);
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const role = user.roles.name;
  if (role !== 'speaker' && role !== 'organizer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 5. Validation du corps de la requête pour POST
  try {
    const { title, description, subject_id, duration, level } = req.body;

    if (!title || !description || !subject_id || !duration || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Vérifier que le sujet existe
    const subject = await prisma.subjects.findUnique({
      where: { id: parseInt(subject_id) },
    });

    if (!subject) {
      return res.status(400).json({ error: `Subject with ID ${subject_id} not found` });
    }

    // 6. Création du talk
    const newTalk = await prisma.talks.create({
      data: {
        title,
        description,
        speaker_id: user.id,
        subject_id: parseInt(subject_id),
        duration: parseInt(duration),
        level: level.toUpperCase(),
        status: role === 'organizer' ? 'ACCEPTED' : 'PENDING',
      },
    });

    return res.status(201).json(newTalk);
  } catch (err) {
    console.error('[POST /api/talks]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
