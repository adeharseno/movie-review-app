import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const email = 'reviewer@example.com'
const prisma = new PrismaClient()

try {
  const passwordHash = await bcrypt.hash('Movie123!', 12)

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`Seeded ${email}`)
} finally {
  await prisma.$disconnect()
}
