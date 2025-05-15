// lib/mock-data.ts
import { Talk, Room, Slot, LevelOption, DurationOption } from './types';

// Mock data pour le MVP
export const mockData: {
  talks: Talk[];
  rooms: Room[];
  slots: Slot[];
} = {
  talks: [
    {
      id: '1',
      title: 'Introduction à React',
      topic: 'Frontend',
      description: 'Une introduction à React pour les débutants',
      durationMinutes: 60,
      level: 'beginner',
      status: 'accepted',
      speakerId: '1',
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      topic: 'Programming',
      description: 'Découvrez les fonctionnalités avancées de TypeScript',
      durationMinutes: 45,
      level: 'advanced',
      status: 'accepted',
      speakerId: '2',
    },
    {
      id: '3',
      title: 'M: CSS Grid Layout',
      topic: 'Frontend',
      description: 'Comment utiliser CSS Grid pour des mises en page complexes',
      durationMinutes: 30,
      level: 'intermediate',
      status: 'accepted',
      speakerId: '6',
    },
    {
      id: '4',
      title: 'M: Introduction à Vue.js',
      topic: 'Frontend',
      description: 'Découvrez Vue.js et ses avantages',
      durationMinutes: 45,
      level: 'beginner',
      status: 'pending',
      speakerId: '6',
    },
    {
      id: '5',
      title: 'DevOps pour débutants',
      topic: 'Operations',
      description: 'Les bases du DevOps et CI/CD',
      durationMinutes: 60,
      level: 'beginner',
      status: 'pending',
      speakerId: '5',
    },
  ],

  rooms: [
    { id: '1', name: 'Salle A', capacity: 50 },
    { id: '2', name: 'Salle B', capacity: 100 },
    { id: '3', name: 'Salle C', capacity: 30 },
    { id: '4', name: 'Salle D', capacity: 200 },
    { id: '5', name: 'Salle E', capacity: 75 },
  ],

  slots: [
    {
      id: '1',
      date: new Date(2025, 4, 15),
      startTime: '09:00',
      endTime: '10:00',
      roomId: '1',
      talkId: null,
    },
    {
      id: '2',
      date: new Date(2025, 4, 15),
      startTime: '10:15',
      endTime: '11:00',
      roomId: '1',
      talkId: null,
    },
    {
      id: '3',
      date: new Date(2025, 4, 15),
      startTime: '09:00',
      endTime: '10:00',
      roomId: '2',
      talkId: null,
    },
    {
      id: '4',
      date: new Date(2025, 4, 15),
      startTime: '11:15',
      endTime: '12:15',
      roomId: '1',
      talkId: null,
    },
    {
      id: '5',
      date: new Date(2025, 4, 15),
      startTime: '13:00',
      endTime: '14:00',
      roomId: '3',
      talkId: null,
    },
    {
      id: '6',
      date: new Date(2025, 4, 16),
      startTime: '09:00',
      endTime: '10:00',
      roomId: '1',
      talkId: null,
    },
    {
      id: '7',
      date: new Date(2025, 4, 16),
      startTime: '10:15',
      endTime: '11:15',
      roomId: '2',
      talkId: null,
    },
  ],
};

// Constantes pour les options de formulaires
export const topics: string[] = [
  'Frontend',
  'Backend',
  'DevOps',
  'Mobile',
  'AI/ML',
  'Security',
  'Design',
  'Programming',
  'Architecture',
  'Operations',
];

export const levels: LevelOption[] = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
];

export const durations: DurationOption[] = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1 heure 30' },
  { value: 120, label: '2 heures' },
];

export const emptyTalk: Omit<Talk, 'id'> = {
  title: '',
  topic: '',
  description: '',
  durationMinutes: 30,
  level: 'beginner',
  status: 'pending',
  speakerId: 'user1', // Normalement l'ID de l'utilisateur connecté
};
