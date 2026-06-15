/**
 * One-shot: migra data/taxas-moeda-agendamento.json → taxa_moeda_sync_agendamento.
 * Preserva ultima_execucao e alertas existentes no JSON legado.
 *
 * Uso: npm run migrar:taxa-moeda-agendamento-json
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import {
  TIPOS_AGENDAMENTO_TAXA_MOEDA,
  taxaMoedaAgendamentoConfigSchema,
} from '../lib/taxas-moeda-agendamento-store.js'

const storeFileSchema = z.object({
  ptax: taxaMoedaAgendamentoConfigSchema,
  focus: taxaMoedaAgendamentoConfigSchema,
})

function jsonPath(): string {
  return join(process.cwd(), 'data', 'taxas-moeda-agendamento.json')
}

async function main(): Promise<void> {
  const path = jsonPath()
  if (!existsSync(path)) {
    console.log(`[migrar] JSON não encontrado em ${path} — nada a migrar`)
    return
  }

  const parsed = storeFileSchema.safeParse(JSON.parse(readFileSync(path, 'utf-8')))
  if (!parsed.success) {
    console.error('[migrar] JSON inválido:', parsed.error.flatten())
    process.exit(1)
  }

  for (const tipo of TIPOS_AGENDAMENTO_TAXA_MOEDA) {
    const cfg = parsed.data[tipo]
    await prisma.taxaMoedaSyncAgendamento.upsert({
      where: { id_taxa_moeda_sync_agendamento: tipo },
      create: {
        id_taxa_moeda_sync_agendamento: tipo,
        ativo_taxa_moeda_sync_agendamento: cfg.ativo,
        frequencia_taxa_moeda_sync_agendamento: cfg.frequencia,
        hora_taxa_moeda_sync_agendamento: cfg.hora,
        minuto_taxa_moeda_sync_agendamento: cfg.minuto,
        alertas_taxa_moeda_sync_agendamento: cfg.alertas,
        ultima_execucao_taxa_moeda_sync_agendamento: cfg.ultima_execucao
          ? new Date(cfg.ultima_execucao)
          : null,
      },
      update: {
        ativo_taxa_moeda_sync_agendamento: cfg.ativo,
        frequencia_taxa_moeda_sync_agendamento: cfg.frequencia,
        hora_taxa_moeda_sync_agendamento: cfg.hora,
        minuto_taxa_moeda_sync_agendamento: cfg.minuto,
        alertas_taxa_moeda_sync_agendamento: cfg.alertas,
        ultima_execucao_taxa_moeda_sync_agendamento: cfg.ultima_execucao
          ? new Date(cfg.ultima_execucao)
          : null,
      },
    })
    console.log(`[migrar] ${tipo} → banco ok (ativo=${cfg.ativo}, ${cfg.frequencia} ${cfg.hora}:${cfg.minuto})`)
  }
}

main()
  .catch(err => {
    console.error('[migrar] falha:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
