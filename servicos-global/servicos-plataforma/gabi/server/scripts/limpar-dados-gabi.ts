/**
 * limpar-dados-gabi.ts — Remove TODOS os registros de uso LLM das tabelas GABI
 * em todos os tenant schemas. Limpa para teste limpo pos-otimizacao.
 *
 * Tabelas afetadas (em cada tenant schema):
 *   - gabi_log_uso          (auditoria de chamadas LLM)
 *   - gabi_token_consumido  (tokens consumidos por campo)
 *   - gabi_mensagem         (mensagens individuais de conversa)
 *   - gabi_conversa         (conversas completas)
 *
 * Uso:
 *   npx tsx servicos-global/servicos-plataforma/gabi/server/scripts/limpar-dados-gabi.ts
 */

import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../.env') })
dotenv.config({ path: resolve(__dir, '../../.env') })

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

const TABELAS = [
  'gabi_log_uso',
  'gabi_token_consumido',
  'gabi_mensagem',
  'gabi_conversa',
] as const

async function main() {
  const { default: prisma } = await import('../lib/prisma.js')
  const { listarOrganizacoes } = await import('../services/configurador-client.js')

  console.log('[limpar-gabi] Iniciando limpeza COMPLETA das tabelas GABI...')
  console.log(`[limpar-gabi] Tabelas: ${TABELAS.join(', ')}`)

  const organizacoes = await listarOrganizacoes({ incluirInativas: true })
  console.log(`[limpar-gabi] ${organizacoes.length} organizacoes encontradas`)

  const totais: Record<string, number> = {}
  for (const t of TABELAS) totais[t] = 0

  for (const org of organizacoes) {
    const schemaName = `tenant_${org.id_organizacao}`
    if (!SCHEMA_NAME_REGEX.test(schemaName)) {
      console.warn(`[limpar-gabi] Schema invalido, pulando: ${schemaName}`)
      continue
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)

        for (const tabela of TABELAS) {
          const deletados: number = await tx.$executeRawUnsafe(`DELETE FROM "${tabela}"`)
          if (deletados > 0) {
            console.log(`[limpar-gabi] ${schemaName}.${tabela}: ${deletados} registro(s)`)
            totais[tabela] += deletados
          }
        }
      })
    } catch (err) {
      console.warn(`[limpar-gabi] Falha em ${schemaName}:`, (err as Error).message)
    }
  }

  console.log('\n[limpar-gabi] === RESUMO ===')
  for (const [tabela, total] of Object.entries(totais)) {
    console.log(`  ${tabela}: ${total} registro(s) removido(s)`)
  }
  console.log('[limpar-gabi] Concluido.')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[limpar-gabi] Erro fatal:', err)
  process.exit(1)
})
