import { ROLE_IDS, roleIdMap, roleMap } from '@/constants/auth';

export function isOrganizer(roleId: number | undefined): boolean {
  return roleId === ROLE_IDS.ORGANIZER;
}

export function isSpeaker(roleId: number | undefined): boolean {
  return roleId === ROLE_IDS.SPEAKER;
}

export function isAttendee(roleId: number | undefined): boolean {
  return roleId === ROLE_IDS.ATTENDEE;
}

// Fonctions de conversion
export function roleIdToRole(roleId: number): string {
  const role = roleIdMap.get(roleId);
  if (!role) {
    throw new Error(`Invalid roleId: ${roleId}`);
  }
  return role;
}

export function roleToRoleId(role: string): number {
  const roleId = roleMap.get(role.toLowerCase());
  if (!roleId) {
    throw new Error(`Invalid role: ${role}`);
  }
  return roleId;
}

// Fonction utilitaire pour vérifier si un utilisateur a un rôle spécifique
export function hasRole(userRoleId: number, requiredRoleId: number): boolean {
  // Cette implémentation simple vérifie l'égalité exacte
  // Vous pourriez l'adapter pour une vérification hiérarchique si nécessaire
  return userRoleId === requiredRoleId;
}
