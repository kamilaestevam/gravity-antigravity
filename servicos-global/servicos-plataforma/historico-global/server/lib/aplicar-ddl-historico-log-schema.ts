/**
 * DDL idempotente — alinha colunas de historico_log ao schema Prisma atual.
 *
 * Produção pode ter drift: ddd_final criou colunas em inglês (tenant_id, actor_id…)
 * e a migration 20260502 assume sufixo _historico_log que nunca existiu no chain.
 * Prisma findMany falha (P2022) → 500 na rota /historico-organizacao.
 */
import { Client } from 'pg'

const TABELA = 'historico_log'

/** Colunas mínimas para considerar o schema alinhado ao Prisma. */
const COLUNAS_CANONICAS = [
  'id_historico_log',
  'id_organizacao',
  'modulo_historico_log',
  'data_criacao_historico_log',
] as const

/**
 * Ordem importa: renomeações intermediárias (_historico_log) antes de colidir
 * com destinos já presentes; legado inglês por último onde aplicável.
 */
const RENOMEACOES_HISTORICO_LOG: ReadonlyArray<readonly [string, string]> = [
  ['id', 'id_historico_log'],
  ['id_organizacao_historico_log', 'id_organizacao'],
  ['id_usuario_historico_log', 'id_usuario'],
  ['tenant_id', 'id_organizacao'],
  ['user_id', 'id_usuario'],
  ['product_id', 'id_produto_historico_log'],
  ['actor_type', 'tipo_ator_historico_log'],
  ['actor_id', 'id_ator_historico_log'],
  ['actor_name', 'nome_ator_historico_log'],
  ['actor_ip', 'ip_ator_historico_log'],
  ['actor_metadata', 'metadata_ator_historico_log'],
  ['module', 'modulo_historico_log'],
  ['resource_type', 'tipo_recurso_historico_log'],
  ['resource_id', 'id_recurso_historico_log'],
  ['action', 'acao_historico_log'],
  ['action_detail', 'detalhe_acao_historico_log'],
  ['before', 'estado_anterior_historico_log'],
  ['after', 'estado_posterior_historico_log'],
  ['status', 'status_historico_log'],
  ['error_message', 'mensagem_erro_historico_log'],
  ['integrity_hash', 'hash_integridade_historico_log'],
  ['created_at', 'data_criacao_historico_log'],
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

function schemaHistoricoLogCanonico(colunas: Set<string>): boolean {
  return COLUNAS_CANONICAS.every((c) => colunas.has(c))
}

export type ResultadoDdlHistoricoLog = 'skip' | 'ok' | 'repair'

/**
 * Aplica renomeações idempotentes em public.historico_log.
 * Retorna `skip` se tabela ausente ou já canônica; `repair` se alterou algo.
 */
export async function aplicarDdlHistoricoLogSchema(
  databaseUrl: string,
): Promise<ResultadoDdlHistoricoLog> {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    const { rows } = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1
       ) AS exists`,
      [TABELA],
    )
    if (!rows[0]?.exists) return 'skip'

    let colunas = await listarColunas(client, TABELA)
    if (schemaHistoricoLogCanonico(colunas)) return 'skip'

    let alterou = false
    for (const [de, para] of RENOMEACOES_HISTORICO_LOG) {
      if (await renomearSePossivel(client, TABELA, colunas, de, para)) {
        alterou = true
      }
    }

    colunas = await listarColunas(client, TABELA)
    if (!schemaHistoricoLogCanonico(colunas)) {
      const faltando = COLUNAS_CANONICAS.filter((c) => !colunas.has(c))
      throw new Error(
        `historico_log ainda incompatível após repair — colunas ausentes: ${faltando.join(', ')}`,
      )
    }

    return alterou ? 'repair' : 'ok'
  } finally {
    await client.end()
  }
}
