/**
 * Seed idempotente — taxa_moeda_sync_agendamento (ptax + focus).
 * Uso: npm run seed:taxa-moeda-agendamento (a partir de servicos-global/configurador)
 */

import { prisma } from '../lib/prisma.js'
import { TIPOS_AGENDAMENTO_TAXA_MOEDA } from '../lib/taxas-moeda-agendamento-store.js'

const SEED_ROWS = [
  {
    id_taxa_moeda_sync_agendamento: 'ptax' as const,
    ativo_taxa_moeda_sync_agendamento: true,
    frequencia_taxa_moeda_sync_agendamento: 'Diario',
    hora_taxa_moeda_sync_agendamento: 10,
    minuto_taxa_moeda_sync_agendamento: 3,
    alertas_taxa_moeda_sync_agendamento: [] as object[],
  },
  {
    id_taxa_moeda_sync_agendamento: 'focus' as const,
    ativo_taxa_moeda_sync_agendamento: true,
    frequencia_taxa_moeda_sync_agendamento: 'Semanal',
    hora_taxa_moeda_sync_agendamento: 22,
    minuto_taxa_moeda_sync_agendamento: 0,
    alertas_taxa_moeda_sync_agendamento: [] as object[],
  },
]

async function main(): Promise<void> {
  for (const row of SEED_ROWS) {
    await prisma.taxaMoedaSyncAgendamento.upsert({
      where: { id_taxa_moeda_sync_agendamento: row.id_taxa_moeda_sync_agendamento },
      create: row,
      update: {},
    })
    console.log(`[seed] taxa_moeda_sync_agendamento — ${row.id_taxa_moeda_sync_agendamento} ok`)
  }

  const total = await prisma.taxaMoedaSyncAgendamento.count({
    where: {
      id_taxa_moeda_sync_agendamento: { in: [...TIPOS_AGENDAMENTO_TAXA_MOEDA] },
    },
  })
  console.log(`[seed] total registros ptax+focus: ${total}`)
}

main()
  .catch(err => {
    console.error('[seed] falha:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
