import { db } from './db'

export async function seedComplianceRules() {
  const rules = [
    {
      city: 'Mumbai',
      ruleType: 'height',
      value: 32,
      description: 'Maximum allowable height for residential buildings in Mumbai specific zones.'
    },
    {
      city: 'Mumbai',
      ruleType: 'floors',
      value: 10,
      description: 'Standard floor height limit for low-rise developments.'
    },
    {
      city: 'Mumbai',
      ruleType: 'FSI',
      value: 2.5,
      description: 'Standard Floor Space Index (FSI) for Mumbai city region.'
    },
    {
      city: 'Bangalore',
      ruleType: 'height',
      value: 50,
      description: 'Maximum allowable height for Bangalore urban developments.'
    }
  ];

  console.log('Seeding compliance rules...');

  for (const rule of rules) {
    await db.complianceRule.upsert({
      where: { id: `rule-${rule.city}-${rule.ruleType}` },
      update: rule,
      create: {
        id: `rule-${rule.city}-${rule.ruleType}`,
        ...rule
      }
    });
  }

  console.log('Compliance rules seeded successfully.');
}
