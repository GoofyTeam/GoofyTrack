// lib/types.ts

import { RoomWithSlots } from '@/components/talks/TalksSchedule';

// Définition des types pour l'application
export type TalkStatus = 'pending' | 'accepted' | 'rejected' | 'scheduled';
export type TalkLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Talk {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: TalkLevel;
  status: TalkStatus;
  speakerId: number;
  subjectId: number;
  createdAt: string;
  updatedAt: string;
  subjects?: {
    id: number;
    name: string;
    created_at: string;
  };
  schedules?: Array<{
    id: number;
    talk_id: number;
    room_id: number;
    start_time: string;
    end_time: string;
    created_at: string;
    updated_at: string;
  }>;
  // feedback?: any[];
  // favorites?: any[];
  users?: {
    id: number;
    username: string;
    email: string;
  };
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
  room: RoomWithSlots;
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
