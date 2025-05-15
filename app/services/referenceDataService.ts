import { prisma } from '@/lib/prisma';
import { talks_level, talks_status } from '@prisma/client';

/**
 * Récupère tous les niveaux de talks disponibles
 * @returns Array de tous les niveaux de talks
 */
export async function getTalkLevels() {
  return Object.values(talks_level);
}

/**
 * Récupère tous les statuts de talks disponibles
 * @returns Array de tous les statuts de talks
 */
export async function getTalkStatuses() {
  return Object.values(talks_status);
}

/**
 * Récupère tous les sujets disponibles
 * @returns Liste des sujets avec leur id et nom
 */
export async function getSubjects() {
  return prisma.subjects.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Récupère toutes les salles
 * @returns Liste des salles avec leurs détails
 */
export async function getRooms() {
  return prisma.rooms.findMany({
    select: {
      id: true,
      name: true,
      capacity: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
