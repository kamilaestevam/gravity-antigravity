/**
 * limpar-logs-teste.ts — Script one-off para remover registros de teste
 * da tabela gabi_log_uso em todos os tenant schemas.
 *
 * Remove registros com modelo 'gpt-4o-mini' (inexistente no GABI — só usa Gemini).
 * Idempotente: pode rodar quantas vezes quiser.
 *
 * Uso:
 *   npx tsx servicos-global/servicos-plataforma/gabi/server/scripts/limpar-logs-teste.ts
 */

import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../.env') })
dotenv.config({ path: resolve(__dir, '../../.env') })

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/
const MODELOS_TESTE = ['gpt-4o-mini']

async function main() {
  const { default: prisma } = await import('../lib/prisma.js')
  const { listarOrganizacoes } = await import('../services/configurador-client.js')

  console.log('[limpar-logs-teste] Iniciando limpeza de registros de teste...')
  console.log(`[limpar-logs-teste] Modelos-alvo: ${MODELOS_TESTE.join(', ')}`)

  const organizacoes = await listarOrganizacoes({ incluirInativas: true })
  console.log(`[limpar-logs-teste] ${organizacoes.length} organizacoes encontradas`)

  let totalDeletados = 0

  for (const org of organizacoes) {
    const schemaName = `tenant_${org.id_organizacao}`
    if (!SCHEMA_NAME_REGEX.test(schemaName)) {
      console.warn(`[limpar-logs-teste] Schema invalido, pulando: ${schemaName}`)
      continue
    }

    try {
      // SAFETY: schemaName validated by SCHEMA_NAME_REGEX; MODELOS_TESTE is a
      // hardcoded const array passed as positional param $1.
      const deletados = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)

        const result = await tx.$executeRawUnsafe(
          `DELETE FROM gabi_log_uso WHERE modelo_gabi_log_uso = ANY($1::text[])`,
          MODELOS_TESTE,
        )

        return result as number
      })

      if (deletados > 0) {
        console.log(`[limpar-logs-teste] ${schemaName}: ${deletados} registro(s) removido(s)`)
        totalDeletados += deletados
      }
    } catch (err) {
      console.warn(`[limpar-logs-teste] Falha em ${schemaName}:`, (err as Error).message)
    }
  }

  console.log(`[limpar-logs-teste] Concluido. Total removido: ${totalDeletados}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[limpar-logs-teste] Erro fatal:', err)
  process.exit(1)
})
