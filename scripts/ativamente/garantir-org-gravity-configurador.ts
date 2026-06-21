/**
 * Boot idempotente — org Gravity para convite SUPER_ADMIN (TASK-000302).
 * Roda em start-site.sh após migrations Configurador (best-effort).
 */
import pg from 'pg'

const url = process.env.CONFIGURADOR_DATABASE_URL?.trim() ?? process.env.DATABASE_URL?.trim()
if (!url) {
  console.warn('[garantir-org-gravity] CONFIGURADOR_DATABASE_URL ausente — skip')
  process.exit(0)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()

  await client.query(`
    ALTER TABLE "organizacao"
    ADD COLUMN IF NOT EXISTS "hospeda_colaboradores_gravity" BOOLEAN NOT NULL DEFAULT false
  `)

  const updated = await client.query(`
    UPDATE organizacao
    SET nome_organizacao = TRIM(nome_organizacao),
        hospeda_colaboradores_gravity = true
    WHERE status_organizacao = 'ATIVO'
      AND (
        TRIM(nome_organizacao) = 'Gravity - Interno'
        OR subdominio_organizacao = 'gravity'
      )
  `)
  console.log(`[garantir-org-gravity] UPDATE rowCount=${updated.rowCount ?? 0}`)

  const { rows } = await client.query<{ n: number }>(`
    SELECT COUNT(*)::int AS n FROM organizacao
    WHERE hospeda_colaboradores_gravity = true AND status_organizacao = 'ATIVO'
  `)
  const n = rows[0]?.n ?? 0
  if (n === 0) {
    console.error(
      '[garantir-org-gravity] AVISO: nenhuma org ATIVA com hospeda_colaboradores_gravity — convite SUPER_ADMIN pode retornar 503',
    )
  } else {
    const { rows: orgs } = await client.query<{ id_organizacao: string; nome_organizacao: string }>(`
      SELECT id_organizacao, nome_organizacao FROM organizacao
      WHERE hospeda_colaboradores_gravity = true AND status_organizacao = 'ATIVO'
      ORDER BY data_criacao_organizacao ASC LIMIT 3
    `)
    console.log(`[garantir-org-gravity] OK — ${n} org(s):`, orgs)
  }
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('[garantir-org-gravity] ERRO (best-effort):', msg)
} finally {
  await client.end().catch(() => {})
}
