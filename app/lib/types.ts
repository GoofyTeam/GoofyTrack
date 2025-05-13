// lib/types.ts

// Définition des types pour l'application
export type TalkStatus = 'pending' | 'accepted' | 'refused' | 'scheduled';
export type TalkLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Talk {
  id: string;
  title: string;
  topic: string;
  description: string;
  durationMinutes: number;
  level: TalkLevel;
  status: TalkStatus;
  speakerId: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface Slot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  roomId: string;
  talkId: string | null;
}

export interface ScheduledTalk {
  talk: Talk;
  slot: Slot;
  room: Room;
}

// Types pour les options de formulaires
export interface LevelOption {
  value: TalkLevel;
  label: string;
}

export interface DurationOption {
  value: number;
  label: string;
}
