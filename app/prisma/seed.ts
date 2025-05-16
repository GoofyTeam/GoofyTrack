import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed pour les rôles
  await seedRoles();

  // Seed pour les sujets
  await seedSubjects();

  // Seed pour les salles
  await seedRooms();
}

async function seedRoles() {
  // Vérifier si les rôles existent déjà
  const rolesCount = await prisma.roles.count();

  if (rolesCount === 0) {
    // Créer les rôles de base
    await prisma.roles.createMany({
      data: [{ name: 'admin' }, { name: 'organizer' }, { name: 'speaker' }, { name: 'attendee' }],
    });
    // console.log('Rôles de base créés avec succès');
  } else {
    // console.log('Les rôles existent déjà, aucune action nécessaire');
  }
}

async function seedSubjects() {
  // Vérifier si les sujets existent déjà
  const subjectsCount = await prisma.subjects.count();

  if (subjectsCount === 0) {
    // Créer les sujets de base
    await prisma.subjects.createMany({
      data: [
        { name: 'JavaScript' },
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'Next.js' },
        { name: 'Node.js' },
        { name: 'Prisma' },
        { name: 'GraphQL' },
        { name: 'DevOps' },
        { name: 'Architecture' },
        { name: 'UX/UI' },
        { name: 'Mobile' },
        { name: 'Security' },
        { name: 'Testing' },
        { name: 'Performance' },
        { name: 'Accessibility' },
      ],
    });
    // console.log('Sujets de base créés avec succès');
  } else {
    // console.log('Les sujets existent déjà, aucune action nécessaire');
  }
}

async function seedRooms() {
  // Vérifier si les salles existent déjà
  const roomsCount = await prisma.rooms.count();

  if (roomsCount === 0) {
    // Créer les 5 salles comme indiqué dans l'énoncé du projet
    await prisma.rooms.createMany({
      data: [
        {
          name: 'Salle Amphithéâtre',
          capacity: 300,
          description: 'Grande salle principale pour les keynotes et sessions populaires',
        },
        {
          name: 'Salle Ateliers',
          capacity: 100,
          description: 'Salle équipée pour les ateliers pratiques et hands-on labs',
        },
        {
          name: 'Salle Conférences A',
          capacity: 150,
          description: 'Salle de conférence standard pour les présentations techniques',
        },
        {
          name: 'Salle Conférences B',
          capacity: 150,
          description: 'Salle de conférence standard pour les présentations techniques',
        },
        {
          name: 'Salle Innovation',
          capacity: 80,
          description: 'Espace dédié aux démonstrations et nouvelles technologies',
        },
      ],
    });
    // console.log('Les 5 salles ont été créées avec succès');
  } else {
    // console.log('Les salles existent déjà, aucune action nécessaire');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
