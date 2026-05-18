import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.user.updateMany({
  where: { email: 'admin@langgo.com' },
  data: { role: 'ADMIN' },
})

console.log('Done! admin@langgo.com is now an admin.')
await prisma.$disconnect()