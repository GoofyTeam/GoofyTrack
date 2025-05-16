import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed pour les rôles
  await seedRoles();

  // Seed pour les sujets
  await seedSubjects();

  // Seed pour les salles
  await seedRooms();

  // Seed pour les utilisateurs
  await seedUsers();

  // Seed pour les talks
  await seedTalks();

  // Seed pour quelques favoris et planning
  await seedFavoritesAndSchedules();
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

async function seedUsers() {
  // Note: nous allons toujours créer nos utilisateurs de test
  // même s'il y en a déjà (ils seront identifiés par leur email)
  const roles = await prisma.roles.findMany();
  const roleMap = new Map(roles.map((role) => [role.name, role.id]));

  // Créer les mots de passe hachés
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('password123', saltRounds);

  // Créer les utilisateurs
  await prisma.user.createMany({
    data: [
      // Admin
      {
        username: 'admin',
        email: 'admin@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('admin') || 1,
        bio: 'Administrateur principal de la plateforme',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
      // Organisateurs
      {
        username: 'organizer1',
        email: 'organizer1@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('organizer') || 2,
        bio: 'Responsable de la planification des talks',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=organizer1',
      },
      {
        username: 'organizer2',
        email: 'organizer2@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('organizer') || 2,
        bio: 'Chargé de la sélection des talks',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=organizer2',
      },
      // Conférenciers
      {
        username: 'speaker1',
        email: 'speaker1@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('speaker') || 3,
        bio: 'Expert JavaScript et React',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speaker1',
      },
      {
        username: 'speaker2',
        email: 'speaker2@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('speaker') || 3,
        bio: 'Systèmes distribués et architecture microservices',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speaker2',
      },
      {
        username: 'speaker3',
        email: 'speaker3@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('speaker') || 3,
        bio: 'Design UX/UI et accessibilité',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speaker3',
      },
      // Participants
      {
        username: 'attendee1',
        email: 'attendee1@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('attendee') || 4,
        bio: 'Développeur front-end passionné',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attendee1',
      },
      {
        username: 'attendee2',
        email: 'attendee2@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('attendee') || 4,
        bio: 'DevOps enthusiast',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attendee2',
      },
      {
        username: 'attendee3',
        email: 'attendee3@goofy.com',
        password: defaultPassword,
        role_id: roleMap.get('attendee') || 4,
        bio: 'Data scientist',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attendee3',
      },
    ],
  });

  console.log(
    'Utilisateurs de test créés ou mis à jour avec succès. Mot de passe par défaut: password123',
  );
}

async function seedTalks() {
  // Nous allons toujours créer nos talks de test
  const speakers = await prisma.user.findMany({
    where: {
      roles: {
        name: 'speaker',
      },
    },
  });

  const subjects = await prisma.subjects.findMany();
  const subjectMap = new Map(subjects.map((subject) => [subject.name, subject.id]));

  // Créer les talks
  await prisma.talks.createMany({
    data: [
      {
        title: 'Introduction à React',
        description:
          'Découvrez les fondamentaux de React, de la création de composants à la gestion d"état. Ce talk est destiné aux débutants qui souhaitent comprendre pourquoi React est devenu si populaire et comment commencer à l’utiliser efficacement.',
        speaker_id: speakers[0].id,
        subject_id: subjectMap.get('React') || subjects[0].id,
        duration: 60,
        level: 'beginner',
        status: 'accepted',
      },
      {
        title: 'Advanced TypeScript',
        description:
          'Plongez dans les fonctionnalités avancées de TypeScript: types conditionnels, mapped types, infer, et bien plus. Ce talk s’adresse aux développeurs ayant déjà une expérience avec TypeScript et souhaitant améliorer leurs compétences.',
        speaker_id: speakers[1].id,
        subject_id: subjectMap.get('TypeScript') || subjects[0].id,
        duration: 45,
        level: 'advanced',
        status: 'accepted',
      },
      {
        title: 'CSS Grid Layout',
        description:
          'Comment utiliser CSS Grid pour des mises en page complexes. Nous explorerons les concepts fondamentaux de Grid, les techniques responsives et les cas d’utilisation les plus courants.',
        speaker_id: speakers[2].id,
        subject_id: subjectMap.get('UX/UI') || subjects[0].id,
        duration: 30,
        level: 'intermediate',
        status: 'accepted',
      },
      {
        title: 'Introduction à Next.js',
        description:
          'Découvrez comment construire des applications React performantes avec Next.js, le framework qui simplifie le SSR, le routage et l’optimisation du SEO.',
        speaker_id: speakers[0].id,
        subject_id: subjectMap.get('Next.js') || subjects[0].id,
        duration: 45,
        level: 'beginner',
        status: 'pending',
      },
      {
        title: 'Les microservices avec Node.js',
        description:
          'Architecture, implémentation et déploiement de microservices avec Node.js. Ce talk présentera les meilleures pratiques pour construire des systèmes distribués robustes.',
        speaker_id: speakers[1].id,
        subject_id: subjectMap.get('Node.js') || subjects[0].id,
        duration: 60,
        level: 'advanced',
        status: 'pending',
      },
      {
        title: 'Accessibilité Web: Pourquoi et Comment',
        description:
          'Comprendre l’importance de l’accessibilité web et apprendre à mettre en œuvre les bonnes pratiques WCAG dans vos projets.',
        speaker_id: speakers[2].id,
        subject_id: subjectMap.get('Accessibility') || subjects[0].id,
        duration: 45,
        level: 'intermediate',
        status: 'rejected',
      },
      {
        title: 'Prisma: L’ORM de nouvelle génération',
        description:
          'Découvrez comment Prisma simplifie les interactions avec la base de données et améliore la productivité des développeurs.',
        speaker_id: speakers[0].id,
        subject_id: subjectMap.get('Prisma') || subjects[0].id,
        duration: 30,
        level: 'intermediate',
        status: 'scheduled',
      },
      {
        title: 'Sécurité des API REST',
        description:
          'Meilleures pratiques pour sécuriser vos API REST contre les attaques les plus courantes.',
        speaker_id: speakers[1].id,
        subject_id: subjectMap.get('Security') || subjects[0].id,
        duration: 60,
        level: 'advanced',
        status: 'scheduled',
      },
    ],
  });

  console.log('Talks de test créés ou mis à jour avec succès');
}

async function seedFavoritesAndSchedules() {
  // Nous allons planifier tous les talks avec le statut accepted ou scheduled
  // Récupérer les talks acceptés et scheduled
  const acceptedTalks = await prisma.talks.findMany({
    where: {
      OR: [{ status: 'accepted' }, { status: 'scheduled' }],
    },
  });

  // Récupérer les salles
  const rooms = await prisma.rooms.findMany();

  // Créer des plannings pour les talks acceptés
  if (acceptedTalks.length > 0 && rooms.length > 0) {
    // Date de l'événement (demain)
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 1);
    eventDate.setHours(9, 0, 0, 0); // Commence à 9h

    for (let i = 0; i < acceptedTalks.length; i++) {
      const talk = acceptedTalks[i];
      const room = rooms[i % rooms.length]; // Alterne entre les salles disponibles

      // Calcule l'heure de début (9h + i heures)
      const startTime = new Date(eventDate);
      startTime.setHours(9 + i, 0, 0, 0);

      // Calcule l'heure de fin (heure de début + durée du talk)
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + talk.duration);

      // Vérifie que l'heure de fin ne dépasse pas 19h
      if (endTime.getHours() < 19) {
        if (talk.status === 'accepted') {
          await prisma.talks.update({
            where: { id: talk.id },
            data: { status: 'scheduled' },
          });
        }

        // Vérifier si un schedule existe déjà pour ce talk
        const existingSchedule = await prisma.schedules.findFirst({
          where: { talk_id: talk.id },
        });

        if (existingSchedule) {
          // Mettre à jour le schedule existant
          await prisma.schedules.update({
            where: { id: existingSchedule.id },
            data: {
              room_id: room.id,
              start_time: startTime,
              end_time: endTime,
            },
          });
        } else {
          // Créer un nouveau schedule
          await prisma.schedules.create({
            data: {
              talk_id: talk.id,
              room_id: room.id,
              start_time: startTime,
              end_time: endTime,
            },
          });
        }
      }
    }

    console.log('Plannings créés ou mis à jour avec succès');
  }

  // Créer quelques favoris
  const favoritesCount = await prisma.favorites.count();

  if (favoritesCount === 0) {
    const talks = await prisma.talks.findMany({
      take: 3,
    });

    const attendees = await prisma.user.findMany({
      where: { roles: { name: 'attendee' } },
    });

    if (talks.length > 0 && attendees.length > 0) {
      for (const attendee of attendees) {
        for (const talk of talks) {
          // Ajoute aléatoirement des favoris (pas pour tous les talks)
          if (Math.random() > 0.3) {
            await prisma.favorites.create({
              data: {
                user_id: attendee.id,
                talk_id: talk.id,
              },
            });
          }
        }
      }

      console.log('Favoris créés avec succès');
    }
  } else {
    console.log('Des favoris existent déjà, aucune action nécessaire');
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
