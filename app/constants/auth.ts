export const roleIdMap = new Map<number, string>([
  // [1, 'admin'],
  [2, 'organizer'],
  [3, 'speaker'],
  [4, 'attendee'],
]);

export const roleMap = new Map<string, number>([
  // ['admin', 1],
  ['organizer', 2],
  ['speaker', 3],
  ['attendee', 4],
]);

// Constantes pour les IDs des rôles
export const ROLE_IDS = {
  // ADMIN: 1,
  ORGANIZER: 2,
  SPEAKER: 3,
  ATTENDEE: 4,
} as const;
