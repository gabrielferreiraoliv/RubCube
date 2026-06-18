import bcrypt from 'bcryptjs';
import { prisma } from '../src/infrastructure/database/prisma/client';

async function main(): Promise<void> {
  const email = 'admin@rubcube.com';
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Administrator',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Seeded admin user: ${email} / admin123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
