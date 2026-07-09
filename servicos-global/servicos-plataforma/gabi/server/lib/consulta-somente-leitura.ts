// server/lib/consulta-somente-leitura.ts
// Executor de consulta SQL SOMENTE-LEITURA no schema da organizacao.
// Defesa em profundidade (nenhuma camada e suficiente sozinha):
//   1. Validacao: unico statement, comeca com SELECT/WITH, sem palavras de escrita.
//   2. search_path travado no schema tenant_<id> (isolamento por organizacao).
//   3. Transacao READ ONLY (Postgres rejeita qualquer escrita).
//   4. statement_timeout (mata consulta lenta).
//   5. LIMIT forcado via subquery (teto de linhas independe do SQL do modelo).
// A identidade da organizacao vem SEMPRE do contexto (nunca do SQL/modelo).

import prisma from './prisma.js'
import { resolverNomeSchemaOrganizacao } from './nome-schema-organizacao.js'
import { AppError } from './errors.js'

const MAX_LINHAS_PADRAO = 100
const TIMEOUT_PADRAO_MS = 5_000

// Palavras que NUNCA podem aparecer numa consulta de leitura (word-boundary).
// Cobre escrita, DDL, controle de transacao/sessao e funcoes perigosas.
const PALAVRAS_PROIBIDAS = [
  'insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate',
  'grant', 'revoke', 'merge', 'call', 'do', 'vacuum', 'analyze', 'reindex',
  'cluster', 'comment', 'copy', 'into', 'set', 'reset', 'listen', 'notify',
  'lock', 'prepare', 'execute', 'deallocate', 'begin', 'commit', 'rollback',
  'savepoint', 'refresh', 'import', 'dblink', 'pg_sleep', 'pg_read_file',
  'pg_ls_dir', 'lo_import', 'lo_export', 'pg_read_binary_file',
]

const REGEX_PROIBIDAS = new RegExp(`\\b(${PALAVRAS_PROIBIDAS.join('|')})\\b`, 'i')

export interface ResultadoConsultaSql {
  linhas: Record<string, unknown>[]
  total_linhas: number
  truncado: boolean
  sql_executado: string
}

/**
 * Valida que o SQL e uma unica consulta de leitura. Lanca AppError (400) se nao.
 * Retorna o SQL limpo (sem `;` final e sem comentarios de linha).
 */
export function validarSelectSomenteLeitura(sqlBruto: string): string {
  if (typeof sqlBruto !== 'string' || sqlBruto.trim().length === 0) {
    throw new AppError('Consulta SQL vazia', 400, 'CONSULTA_INVALIDA')
  }

  // Remove comentarios (-- linha e /* bloco */) que poderiam esconder palavras.
  const semComentarios = sqlBruto
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .trim()

  // Remove um unico `;` final, se houver.
  const sql = semComentarios.replace(/;\s*$/, '').trim()

  // Nenhum `;` no meio — impede empilhar statements.
  if (sql.includes(';')) {
    throw new AppError('Apenas uma consulta por vez e permitida', 400, 'CONSULTA_INVALIDA')
  }

  // Deve comecar com SELECT ou WITH (CTE de leitura).
  if (!/^(select|with)\b/i.test(sql)) {
    throw new AppError('Apenas consultas SELECT sao permitidas', 400, 'CONSULTA_INVALIDA')
  }

  // Nenhuma palavra de escrita/DDL/controle.
  const match = sql.match(REGEX_PROIBIDAS)
  if (match) {
    throw new AppError(`Palavra nao permitida em consulta de leitura: "${match[1]}"`, 400, 'CONSULTA_INVALIDA')
  }

  return sql
}

/**
 * Executa uma consulta de leitura no schema da organizacao, com todos os
 * trilhos. `idOrganizacao` define o schema — nunca vem do SQL.
 */
export async function executarConsultaSomenteLeitura(
  idOrganizacao: string,
  sqlBruto: string,
  opcoes: { maxLinhas?: number; timeoutMs?: number } = {},
): Promise<ResultadoConsultaSql> {
  const maxLinhas = Math.min(Math.max(1, opcoes.maxLinhas ?? MAX_LINHAS_PADRAO), MAX_LINHAS_PADRAO)
  const timeoutMs = Math.min(Math.max(500, opcoes.timeoutMs ?? TIMEOUT_PADRAO_MS), TIMEOUT_PADRAO_MS)

  const sql = validarSelectSomenteLeitura(sqlBruto)
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)

  // LIMIT forcado via subquery: teto de linhas mesmo que o SQL nao tenha LIMIT.
  const sqlLimitado = `SELECT * FROM (${sql}) AS _consulta_gabi LIMIT ${maxLinhas + 1}`

  const linhas = await prisma.$transaction(
    async (tx) => {
      // Ordem importa: READ ONLY antes de qualquer acesso a dados.
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}"`)
      await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = ${timeoutMs}`)
      return tx.$queryRawUnsafe<Record<string, unknown>[]>(sqlLimitado)
    },
    { timeout: timeoutMs + 2_000, isolationLevel: 'ReadCommitted' },
  )

  const truncado = linhas.length > maxLinhas
  const linhasFinais = truncado ? linhas.slice(0, maxLinhas) : linhas

  return {
    linhas: serializarLinhas(linhasFinais),
    total_linhas: linhasFinais.length,
    truncado,
    sql_executado: sql,
  }
}

/** BigInt/Date/Buffer -> tipos serializaveis em JSON para o modelo. */
function serializarLinhas(linhas: Record<string, unknown>[]): Record<string, unknown>[] {
  return linhas.map((linha) => {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(linha)) {
      if (typeof v === 'bigint') out[k] = Number(v)
      else if (v instanceof Date) out[k] = v.toISOString()
      else if (Buffer.isBuffer(v)) out[k] = '[binario]'
      else out[k] = v
    }
    return out
  })
}
