// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = ['organizer', 'speaker', 'attendee'];

  for (const name of roles) {
    await prisma.roles.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Roles seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
