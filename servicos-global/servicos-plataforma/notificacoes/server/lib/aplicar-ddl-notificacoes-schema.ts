/**
 * DDL idempotente — alinha notificacoes_titulo_corpo e configuracao_canal_organizacao.
 * Mesmo drift de migrations que historico_log (inglês → DDD).
 */
import { Client } from 'pg'

const RENOMEACOES_NOTIFICACAO: ReadonlyArray<readonly [string, string]> = [
  ['id', 'id_notificacoes_titulo_corpo'],
  ['tenant_id', 'id_organizacao'],
  ['product_id', 'id_produto_gravity'],
  ['user_id', 'id_usuario'],
  ['type', 'tipo_notificacoes_titulo_corpo'],
  ['title', 'titulo_notificacoes_titulo_corpo'],
  ['message', 'mensagem_notificacoes_titulo_corpo'],
  ['read', 'lida_notificacoes_titulo_corpo'],
  ['target_entity', 'entidade_alvo_notificacoes_titulo_corpo'],
  ['target_id', 'id_alvo_notificacoes_titulo_corpo'],
  ['delivery_status', 'status_entrega_notificacoes_titulo_corpo'],
  ['external_id', 'id_externo_notificacoes_titulo_corpo'],
  ['created_at', 'data_criacao_notificacoes_titulo_corpo'],
  ['updated_at', 'data_atualizacao_notificacoes_titulo_corpo'],
]

const RENOMEACOES_CANAL: ReadonlyArray<readonly [string, string]> = [
  ['id', 'id_configuracao_canal_organizacao'],
  ['tenant_id', 'id_organizacao'],
  ['updated_by', 'id_usuario'],
  ['email_enabled', 'email_habilitado_configuracao_canal_organizacao'],
  ['whatsapp_enabled', 'whatsapp_habilitado_configuracao_canal_organizacao'],
  ['created_at', 'data_criacao_configuracao_canal_organizacao'],
  ['updated_at', 'data_atualizacao_configuracao_canal_organizacao'],
]

async function listarColunas(client: Client, tabela: string): Promise<Set<string>> {
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tabela],
  )
  return new Set(rows.map((r) => r.column_name))
}

async function tabelaExiste(client: Client, tabela: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tabela],
  )
  return Boolean(rows[0]?.exists)
}

async function renomearSePossivel(
  client: Client,
  tabela: string,
  colunas: Set<string>,
  de: string,
  para: string,
): Promise<boolean> {
  if (!colunas.has(de) || colunas.has(para)) return false
  await client.query(`ALTER TABLE "${tabela}" RENAME COLUMN "${de}" TO "${para}"`)
  colunas.delete(de)
  colunas.add(para)
  return true
}

export type ResultadoDdlNotificacoes = 'skip' | 'ok' | 'repair'

export async function aplicarDdlNotificacoesSchema(
  databaseUrl: string,
): Promise<ResultadoDdlNotificacoes> {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    let alterou = false

    if (await tabelaExiste(client, 'configuracao_canal_tenant')) {
      await client.query(
        `ALTER TABLE "configuracao_canal_tenant" RENAME TO "configuracao_canal_organizacao"`,
      )
      alterou = true
    }

    if (await tabelaExiste(client, 'notificacoes_titulo_corpo')) {
      let colunas = await listarColunas(client, 'notificacoes_titulo_corpo')
      if (!colunas.has('id_organizacao')) {
        for (const [de, para] of RENOMEACOES_NOTIFICACAO) {
          if (await renomearSePossivel(client, 'notificacoes_titulo_corpo', colunas, de, para)) {
            alterou = true
          }
        }
      }
    }

    if (await tabelaExiste(client, 'configuracao_canal_organizacao')) {
      let colunas = await listarColunas(client, 'configuracao_canal_organizacao')
      if (!colunas.has('id_organizacao')) {
        for (const [de, para] of RENOMEACOES_CANAL) {
          if (await renomearSePossivel(client, 'configuracao_canal_organizacao', colunas, de, para)) {
            alterou = true
          }
        }
      }
      colunas = await listarColunas(client, 'configuracao_canal_organizacao')
      if (!colunas.has('id_produto_gravity')) {
        await client.query(
          `ALTER TABLE "configuracao_canal_organizacao" ADD COLUMN IF NOT EXISTS "id_produto_gravity" TEXT`,
        )
        alterou = true
      }
    }

    return alterou ? 'repair' : 'skip'
  } finally {
    await client.end()
  }
}
