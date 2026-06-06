/**
 * Reparo idempotente da tabela ganho_bid_frete_internacional (colunas legadas → DDD).
 */
import type { Client } from 'pg'

export const CREATE_GANHO_DDD = `
CREATE TABLE "ganho_bid_frete_internacional" (
  "id_ganho_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_workspace" TEXT,
  "id_produto_gravity" TEXT,
  "id_usuario" TEXT NOT NULL,
  "id_cotacao_bid_frete_internacional" TEXT NOT NULL,
  "valor_meta_ganho_bid_frete_internacional" DOUBLE PRECISION,
  "valor_aprovado_ganho_bid_frete_internacional" DOUBLE PRECISION NOT NULL,
  "valor_medio_ganho_bid_frete_internacional" DOUBLE PRECISION,
  "ganho_vs_meta_ganho_bid_frete_internacional" DOUBLE PRECISION,
  "ganho_vs_media_ganho_bid_frete_internacional" DOUBLE PRECISION,
  "ganho_percentual_ganho_bid_frete_internacional" DOUBLE PRECISION,
  "moeda_ganho_bid_frete_internacional" TEXT NOT NULL DEFAULT 'USD',
  "data_criacao_ganho_bid_frete_internacional" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ganho_bid_frete_internacional_pkey" PRIMARY KEY ("id_ganho_bid_frete_internacional")
);

CREATE INDEX IF NOT EXISTS "ganho_bid_frete_internacional_id_organizacao_idx"
  ON "ganho_bid_frete_internacional"("id_organizacao");
CREATE INDEX IF NOT EXISTS "ganho_bid_frete_internacional_id_organizacao_id_produto_gravity_idx"
  ON "ganho_bid_frete_internacional"("id_organizacao", "id_produto_gravity");
CREATE INDEX IF NOT EXISTS "ganho_bid_frete_internacional_id_organizacao_id_usuario_idx"
  ON "ganho_bid_frete_internacional"("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "ganho_bid_frete_internacional_id_organizacao_id_workspace_idx"
  ON "ganho_bid_frete_internacional"("id_organizacao", "id_workspace");
CREATE INDEX IF NOT EXISTS "ganho_bid_frete_internacional_id_organizacao_data_criacao_ganho_bid_frete_internacional_idx"
  ON "ganho_bid_frete_internacional"("id_organizacao", "data_criacao_ganho_bid_frete_internacional");
`

/** Renomeia colunas curtas/legadas → DDD (idempotente). */
export const RENAME_GANHO_LEGADO_PARA_DDD = `
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'id_ganho_bid_frete_internacional') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "id" TO "id_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_target') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_target" TO "valor_meta_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_aprovado') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_aprovado" TO "valor_aprovado_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_medio') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_medio" TO "valor_medio_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_vs_target') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_vs_target" TO "ganho_vs_meta_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_vs_media') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_vs_media" TO "ganho_vs_media_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_percentual') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_percentual" TO "ganho_percentual_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'moeda') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "moeda" TO "moeda_ganho_bid_frete_internacional";
  END IF;
END $$;
`

export const COLUNAS_GANHO_DDD_MINIMAS = [
  'id_ganho_bid_frete_internacional',
  'valor_meta_ganho_bid_frete_internacional',
  'valor_aprovado_ganho_bid_frete_internacional',
  'moeda_ganho_bid_frete_internacional',
] as const

async function tabelaGanhoExiste(client: Client): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional'
    ) AS exists`,
  )
  return rows[0]?.exists === true
}

async function colunaGanhoExiste(client: Client, coluna: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = $1
    ) AS exists`,
    [coluna],
  )
  return rows[0]?.exists === true
}

export async function ganhoDriftDetectado(client: Client): Promise<boolean> {
  if (!(await tabelaGanhoExiste(client))) return true
  for (const coluna of COLUNAS_GANHO_DDD_MINIMAS) {
    if (!(await colunaGanhoExiste(client, coluna))) {
      console.warn(`[migrations-bid] Drift ganho: coluna ausente — ${coluna}`)
      return true
    }
  }
  return false
}

async function contarRegistrosGanho(client: Client): Promise<number> {
  const { rows } = await client.query<{ n: string }>(
    'SELECT COUNT(*)::text AS n FROM ganho_bid_frete_internacional',
  )
  return Number(rows[0]?.n ?? 0)
}

/**
 * 1) RENAME colunas legadas; 2) se vazia e drift persiste → DROP + CREATE DDD.
 */
export async function repararTabelaGanhoBidFreteInternacional(client: Client): Promise<void> {
  if (!(await ganhoDriftDetectado(client))) return

  console.log('[migrations-bid] Reparo ganho_bid_frete_internacional — rename legado → DDD')
  await client.query(RENAME_GANHO_LEGADO_PARA_DDD)

  if (!(await ganhoDriftDetectado(client))) {
    console.log('[migrations-bid] Ganho OK após rename')
    return
  }

  const total = (await tabelaGanhoExiste(client)) ? await contarRegistrosGanho(client) : 0
  if (total > 0) {
    console.warn(
      `[migrations-bid] AVISO: ganho com ${total} registro(s) e drift residual — rename manual necessário`,
    )
    return
  }

  console.log('[migrations-bid] Ganho vazia/ausente com drift — DROP + CREATE schema DDD')
  await client.query('DROP TABLE IF EXISTS "ganho_bid_frete_internacional" CASCADE')
  await client.query(CREATE_GANHO_DDD)

  if (await ganhoDriftDetectado(client)) {
    throw new Error('ganho_bid_frete_internacional ainda com drift após DROP + CREATE')
  }
  console.log('[migrations-bid] Ganho recriada com schema DDD')
}
