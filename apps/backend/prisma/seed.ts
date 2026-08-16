import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type SeedProvider = {
  id: number;
  category: string;
  name: string;
  hasDebtCheck: boolean;
  prefixes?: string[];
  fields: { key: string; label: string; type: string; placeholder?: string }[];
};

const providers: SeedProvider[] = [
  {
    id: 1,
    category: 'mobile',
    name: 'Azercell',
    hasDebtCheck: false,
    prefixes: ['050', '051'],
    fields: [
      {
        key: 'phoneNumber',
        label: 'Telefon nömrəsi',
        type: 'tel',
        placeholder: '0XX XXX XX XX',
      },
    ],
  },
  {
    id: 2,
    category: 'mobile',
    name: 'Bakcell',
    hasDebtCheck: false,
    prefixes: ['055', '099'],
    fields: [
      {
        key: 'phoneNumber',
        label: 'Telefon nömrəsi',
        type: 'tel',
        placeholder: '',
      },
    ],
  },
  {
    id: 3,
    category: 'internet',
    name: 'Aztelekom',
    hasDebtCheck: false,
    fields: [
      {
        key: 'contractNumber',
        label: 'Müqavilə nömrəsi',
        type: 'text',
        placeholder: '',
      },
    ],
  },
  {
    id: 4,
    category: 'utilities',
    name: 'Azərişıq',
    hasDebtCheck: true,
    fields: [
      {
        key: 'subscriberCode',
        label: 'Abonent kodu',
        type: 'text',
        placeholder: '',
      },
      {
        key: 'period',
        label: 'Dövr (AA.İİİİ)',
        type: 'text',
        placeholder: '07.2026',
      },
    ],
  },
  {
    id: 5,
    category: 'utilities',
    name: 'Azərsu',
    hasDebtCheck: true,
    fields: [
      {
        key: 'subscriberCode',
        label: 'Abonent kodu',
        type: 'text',
        placeholder: '',
      },
      { key: 'period', label: 'Dövr (AA.İİİİ)', type: 'text', placeholder: '' },
    ],
  },
  {
    id: 6,
    category: 'fines',
    name: 'Yol Polisi',
    hasDebtCheck: true,
    fields: [
      {
        key: 'protocolNumber',
        label: 'Protokol nömrəsi',
        type: 'text',
        placeholder: '',
      },
    ],
  },
  {
    id: 7,
    category: 'education',
    name: 'ADA University',
    hasDebtCheck: true,
    fields: [
      { key: 'studentId', label: 'Tələbə ID', type: 'text', placeholder: '' },
    ],
  },
];

async function main() {
  for (const provider of providers) {
    await prisma.paymentProvider.upsert({
      where: { id: provider.id },
      update: {
        category: provider.category,
        name: provider.name,
        hasDebtCheck: provider.hasDebtCheck,
        prefixes: provider.prefixes ?? [],
        fields: provider.fields,
      },
      create: {
        id: provider.id,
        category: provider.category,
        name: provider.name,
        hasDebtCheck: provider.hasDebtCheck,
        prefixes: provider.prefixes ?? [],
        fields: provider.fields,
      },
    });
  }

  // fixing lint errors

  console.log(`✅ ${providers.length} payment provider seed edildi`);
}

main()
  .catch((e) => {
    console.error('❌ Seed xətası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
