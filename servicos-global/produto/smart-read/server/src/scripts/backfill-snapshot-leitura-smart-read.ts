/**
 * backfill-snapshot-leitura-smart-read.ts — importa o histórico do DATI para o
 * snapshot Postgres Gravity (TASK-000424, decisão «backfill único»).
 *
 * Contexto: o agregado do workspace (GET /leituras/agregado-workspace) passou a
 * ler 100% do Postgres. Leituras anteriores ao espelhamento não têm snapshot e
 * ficariam fora do contador «Tempo reduzido acumulado». Este script preenche o
 * histórico UMA vez, quando a rota de listagem do DATI estiver estável.
 *
 * Uso (na raiz do serviço, com .env carregado):
 *   npx tsx src/scripts/backfill-snapshot-leitura-smart-read.ts \
 *     --id-organizacao=org_xxx --id-workspace=ws_xxx --id-usuario=user_xxx
 *
 * Idempotente: leituras que já têm snapshot são puladas. Somente leituras
 * COMPLETED são importadas (falhas antigas não somam saving).
 */

import { PrismaClient } from '../generated/client/index.js'
import {
  listarLeiturasLegado,
  obterLeituraLegado,
  resolverCompanyLegado,
} from '../lib/cliente-legado-smart-read.js'
import { extrairItensListaLegado } from '../lib/normalizar-transacao-leitura-smart-read.js'
import { persistirSnapshotLeituraSmartRead } from '../lib/snapshot-leitura-smart-read.js'
import { normalizarLeitura, type LeituraLegado } from '../schemas/leitura-smart-read.js'

const LIMITE_PAGINA = 100

function argumento(nome: string): string {
  const prefixo = `--${nome}=`
  const bruto = process.argv.find((arg) => arg.startsWith(prefixo))
  const valor = bruto?.slice(prefixo.length).trim()
  if (!valor) {
    console.error(`[backfill] argumento obrigatorio ausente: --${nome}=...`)
    process.exit(1)
  }
  return valor
}

async function executarBackfill(): Promise<void> {
  const idOrganizacao = argumento('id-organizacao')
  const idWorkspace = argumento('id-workspace')
  const idUsuario = argumento('id-usuario')

  const prisma = new PrismaClient()
  const companyId = await resolverCompanyLegado(idOrganizacao)

  let pagina = 1
  let importadas = 0
  let puladas = 0
  let falhas = 0

  try {
    for (;;) {
      const bruto = await listarLeiturasLegado(companyId, { pagina, limite: LIMITE_PAGINA })
      const itens = extrairItensListaLegado(bruto)
      if (itens.length === 0) break

      for (const item of itens) {
        const existente = await prisma.snapshotLeituraSmartRead.findFirst({
          where: { id_leitura_legado_snapshot_leitura_smart_read: item._id },
          select: { id_snapshot_leitura_smart_read: true },
        })
        if (existente) {
          puladas += 1
          continue
        }

        try {
          const legado = await obterLeituraLegado(companyId, item._id)
          const leitura = normalizarLeitura(legado as LeituraLegado)
          if (leitura.status_leitura !== 'COMPLETED') {
            puladas += 1
            continue
          }

          await persistirSnapshotLeituraSmartRead({
            prisma,
            idOrganizacao,
            idUsuario,
            idWorkspace,
            leitura,
            motivo: 'extracao_concluida',
            extras: {
              data_envio: legado.createdAt ?? null,
              created_at: legado.createdAt ?? null,
              completed_at: legado.completedAt ?? null,
            },
          })
          importadas += 1
          console.log(`[backfill] importada ${item._id} (${leitura.nome_leitura ?? 'sem nome'})`)
        } catch (erro) {
          falhas += 1
          console.warn(
            `[backfill] falha ao importar ${item._id}: ${erro instanceof Error ? erro.message : erro}`,
          )
        }
      }

      if (itens.length < LIMITE_PAGINA) break
      pagina += 1
    }
  } finally {
    await prisma.$disconnect()
  }

  console.log(
    `[backfill] concluido — importadas: ${importadas}, puladas: ${puladas}, falhas: ${falhas}`,
  )
}

void executarBackfill()
