/**
 * Repara drift de colunas em public (historico_log, notificacoes) no ORGANIZACAO_DATABASE_URL.
 * Roda no boot do site-usegravity após migrate deploy — mesmo padrão do DDL GABI.
 */
import { aplicarDdlHistoricoLogSchema } from '../../servicos-global/servicos-plataforma/historico-global/server/lib/aplicar-ddl-historico-log-schema.js'
import { aplicarDdlNotificacoesSchema } from '../../servicos-global/servicos-plataforma/notificacoes/server/lib/aplicar-ddl-notificacoes-schema.js'

function mascararUrl(url: string): string {
  const host = url.split('@')[1]?.split('/')[0]
  return host ? `***@${host}` : '(invalida)'
}

async function main(): Promise<void> {
  const url = process.env.ORGANIZACAO_DATABASE_URL?.trim()
  if (!url) {
    console.warn('[ddl-plataforma-public] ORGANIZACAO_DATABASE_URL ausente — skip.')
    return
  }

  console.log(`[ddl-plataforma-public] Banco: ${mascararUrl(url)}`)

  const historico = await aplicarDdlHistoricoLogSchema(url)
  console.log(`[ddl-plataforma-public] historico_log: ${historico}`)

  const notificacoes = await aplicarDdlNotificacoesSchema(url)
  console.log(`[ddl-plataforma-public] notificacoes: ${notificacoes}`)
}

main().catch((err) => {
  console.error(
    '[ddl-plataforma-public] ERRO:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
