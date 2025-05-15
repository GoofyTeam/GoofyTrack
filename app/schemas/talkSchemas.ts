import { talks_level } from '@prisma/client';
import { z } from 'zod';

// Schéma pour la création d'un talk par un conférencier
export const createTalkSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  subject: z.string().min(1, 'Le sujet est requis'),
  duration: z.number().int().positive().max(240, 'La durée maximale est de 240 minutes'),
  level: z.nativeEnum(talks_level).default('intermediate'),
});

// Schéma pour la validation d'un talk par un organisateur
export const validateTalkSchema = z.object({
  talkId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

// Schéma pour l'acceptation/rejet d'un talk par un organisateur
export const talkStatusUpdateSchema = z.object({
  talkId: z.number().int().positive(),
});

// Schéma pour la mise à jour d'un talk par un conférencier
export const updateTalkSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200).optional(),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').optional(),
  subject_id: z.number().int().positive().optional(),
  duration: z.number().int().positive().max(240, 'La durée maximale est de 240 minutes').optional(),
  level: z.nativeEnum(talks_level).optional(),
});

// Schéma pour le toggle des favoris
export const toggleFavoriteSchema = z.object({
  talkId: z.number().int().positive(),
});

// Schéma pour la vérification de disponibilité d'une salle
export const roomAvailabilitySchema = z.object({
  roomId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  excludeTalkId: z.number().int().positive().optional(),
});

// Schéma pour la récupération des créneaux disponibles
export const availableTimesSchema = z.object({
  roomId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
});

// Schéma pour la récupération des salles disponibles
export const availableRoomsSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
