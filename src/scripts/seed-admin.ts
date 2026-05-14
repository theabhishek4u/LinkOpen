import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@linkverse.com'
  const password = 'admin123'
  const name = 'Admin'

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('Admin user already exists:', email)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      plan: 'enterprise',
    },
  })

  console.log('Admin user created successfully!')
  console.log('  Email:', user.email)
  console.log('  Name:', user.name)
  console.log('  Role:', user.role)
  console.log('  Plan:', user.plan)
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
