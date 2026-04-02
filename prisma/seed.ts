import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Protocol SEED-RULES: Initializing...')

  const rules = [
    {
      city: 'Chennai',
      maxHeight: 18.3,
      minSetback: 3.5,
      maxFSI: 2.0,
      description: 'CMA Regulatory Standard - Zone A'
    },
    {
      city: 'Bangalore',
      maxHeight: 24.0,
      minSetback: 4.0,
      maxFSI: 2.5,
      description: 'BBMP Building Bye-laws 2024'
    },
    {
      city: 'Mumbai',
      maxHeight: 32.0,
      minSetback: 5.0,
      maxFSI: 3.0,
      description: 'MCGM Development Control Regulations'
    },
    {
      city: 'Delhi',
      maxHeight: 15.0,
      minSetback: 3.0,
      maxFSI: 2.25,
      description: 'DDA Master Plan 2021'
    }
  ]

  for (const rule of rules) {
    // Ensuring the upsert matches the current schema schema.prisma:L137-145
    await prisma.complianceRule.upsert({
      where: { city: rule.city },
      update: {
        maxHeight: rule.maxHeight,
        minSetback: rule.minSetback,
        maxFSI: rule.maxFSI,
        description: rule.description
      },
      create: {
        city: rule.city,
        maxHeight: rule.maxHeight,
        minSetback: rule.minSetback,
        maxFSI: rule.maxFSI,
        description: rule.description
      },
    })
  }

  console.log('✅ Protocol SEED-RULES: Execution Complete')
}

main()
  .catch((e) => {
    console.error('❌ Protocol SEED-RULES: Failure', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
