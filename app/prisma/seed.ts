import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed pour les rôles
  await seedRoles();

  // Seed pour les sujets
  await seedSubjects();
}

async function seedRoles() {
  // Vérifier si les rôles existent déjà
  const rolesCount = await prisma.roles.count();

  if (rolesCount === 0) {
    // Créer les rôles de base
    await prisma.roles.createMany({
      data: [{ name: 'admin' }, { name: 'organizer' }, { name: 'speaker' }, { name: 'attendee' }],
    });
    console.log('Rôles de base créés avec succès');
  } else {
    console.log('Les rôles existent déjà, aucune action nécessaire');
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
    console.log('Sujets de base créés avec succès');
  } else {
    console.log('Les sujets existent déjà, aucune action nécessaire');
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
