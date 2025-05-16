import { prisma } from '@/lib/prisma';
import { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react';

/**
 * Toggle un talk en favoris pour un utilisateur connecté
 * @param talkId ID du talk à ajouter/supprimer des favoris
 * @param req Requête API contenant les informations de session
 * @returns Un objet indiquant si le talk a été ajouté ou supprimé des favoris
 */
export async function toggleFavorite(talkId: number, req: NextApiRequest) {
  // Vérifier l'authentification de l'utilisateur
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userId = parseInt(session.user.id);

  // Vérifier que le talk existe
  const talk = await prisma.talks.findUnique({
    where: { id: talkId },
  });

  if (!talk) {
    throw new Error('Talk not found');
  }

  // Vérifier si le talk est déjà en favoris
  const existingFavorite = await prisma.favorites.findUnique({
    where: {
      user_id_talk_id: {
        user_id: userId,
        talk_id: talkId,
      },
    },
  });

  // Si le favoris existe, le supprimer
  if (existingFavorite) {
    await prisma.favorites.delete({
      where: {
        id: existingFavorite.id,
      },
    });
    return { added: false, removed: true, talkId };
  }

  // Sinon, créer un nouveau favoris
  await prisma.favorites.create({
    data: {
      user_id: userId,
      talk_id: talkId,
    },
  });

  return { added: true, removed: false, talkId };
}

/**
 * Récupère les talks favoris d'un utilisateur
 * @param req Requête API contenant les informations de session
 * @returns Liste des talks favoris avec leurs détails
 */
export async function getUserFavorites(req: NextApiRequest) {
  const session = await getSession({ req });

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userId = parseInt(session.user.id);

  return prisma.favorites.findMany({
    where: {
      user_id: userId,
    },
    include: {
      talks: {
        include: {
          users: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          subjects: true,
          schedules: {
            include: {
              rooms: true,
            },
          },
        },
      },
    },
  });
}
