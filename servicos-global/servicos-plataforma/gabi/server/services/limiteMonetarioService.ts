/**
 * limiteMonetarioService.ts — F2 do API Cockpit Monitor LLM
 *
 * Avalia se uma chamada GABI deve ser permitida, avisada ou bloqueada com
 * base em LIMITES MONETARIOS (USD) configurados em tres escopos. O mais
 * restritivo vence (MODELO > ORGANIZACAO > GLOBAL).
 *
 * Fontes de dados (todas com cache Redis):
 *   1. GLOBAL (cross-org)        — via S2S /api/v1/internal/gabi/limites-globais
 *      key: "organizacao:__global__:gabi:limite_global:{modelo|all}:{YYYY-MM}"
 *      TTL: 300s (5 min — mudam raramente)
 *
 *   2. ORGANIZACAO (per-org)     — schema da org, tabela gabi_limite_monetario
 *      key: "organizacao:{idOrg}:gabi:limite_org:{modelo|all}:{YYYY-MM}"
 *      TTL: 60s
 *
 *   3. SPEND MTD (per-org)       — SUM(custo_usd_gabi_log_uso) >= startOfMonth
 *      key: "organizacao:{idOrg}:gabi:gasto_mtd:{YYYY-MM}"
 *      TTL: 60s + invalidacao por evento (apos cada gabi_log_uso novo)
 *
 * Janela de overshoot conhecida (v1): entre cache miss e proxima invalidacao
 * podemos servir gasto desatualizado por ate ~60s. Solucao exata exigiria
 * contador atomico Redis (INCRBY) — TODO para evolucao futura.
 *
 * Validacao do schema name (anti-SQL-injection) replica o padrao do SDK:
 *   /^tenant_c[a-z0-9]{24}$/
 *
 * Sem ioredis disponivel (REDIS_URL ausente) o service degrada para
 * leitura direta no DB — log de aviso por chamada para nao mascarar bug.
 */

import Redis from 'ioredis'
import { prisma } from '../lib/prisma.js'
import { listarLimitesGlobais, type LimiteGlobalRedePayload } from './configurador-client.js'

// ---------------------------------------------------------------------------
// Tipos publicos
// ---------------------------------------------------------------------------

export type StatusLimite = 'ok' | 'aviso' | 'bloqueio'
export type OrigemLimite = 'GLOBAL' | 'ORGANIZACAO' | 'MODELO' | 'sem_limite'

export interface ResultadoAvaliacaoLimite {
  gasto_mtd_usd:       number
  limite_aviso_usd:    number | null
  limite_bloqueio_usd: number | null
  status:              StatusLimite
  origem_limite:       OrigemLimite
  id_limite_aplicado:  string | null
}

// ---------------------------------------------------------------------------
// Constantes / utilidades
// ---------------------------------------------------------------------------

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

const TTL_GLOBAL_SEC    = 300
const TTL_ORG_SEC       = 60
const TTL_GASTO_MTD_SEC = 60

const SENTINEL_TODOS_MODELOS = '__ALL__'

function mesRefAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function inicioDoMes(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function inicioDoProximoMes(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

function chaveCacheLimiteGlobal(modelo: string | null, mesRef: string): string {
  const m = modelo ?? SENTINEL_TODOS_MODELOS
  return `organizacao:__global__:gabi:limite_global:${m}:${mesRef}`
}

function chaveCacheLimiteOrg(idOrg: string, modelo: string | null, mesRef: string): string {
  const m = modelo ?? SENTINEL_TODOS_MODELOS
  return `organizacao:${idOrg}:gabi:limite_org:${m}:${mesRef}`
}

function chaveCacheGastoMtd(idOrg: string, mesRef: string): string {
  return `organizacao:${idOrg}:gabi:gasto_mtd:${mesRef}`
}

// ---------------------------------------------------------------------------
// Conexao Redis (lazy + singleton)
// ---------------------------------------------------------------------------

let _redis: Redis | null | undefined

/**
 * Retorna o client Redis, ou null se REDIS_URL nao configurado.
 * Lazy: criacao adiada para a primeira chamada (apos dotenv.config()).
 */
function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis
  const url = process.env.REDIS_URL
  if (!url) {
    console.warn('[limiteMonetarioService] REDIS_URL ausente — service vai degradar para leitura direta no DB (sem cache)')
    _redis = null
    return null
  }
  _redis = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue:   false,
    lazyConnect:          true,
  })
  _redis.on('error', (err) => {
    console.warn('[limiteMonetarioService] redis erro', err.message)
  })
  return _redis
}

// ---------------------------------------------------------------------------
// Schema lookup helpers
// ---------------------------------------------------------------------------

interface LimiteOrgLido {
  id_gabi_limite_monetario:    string
  modelo_gabi_limite_monetario: string | null
  limite_aviso_usd_gabi_limite_monetario:    string  // Decimal -> string
  limite_bloqueio_usd_gabi_limite_monetario: string
  ativo_gabi_limite_monetario: boolean
}

/** Schema-per-org: SET LOCAL search_path + raw query.
 *  SAFETY: schemaName validated by SCHEMA_NAME_REGEX; all data via positional params.
 *  OWASP A01: whitelist validada — schema name via regex, dados via params posicionais */
async function lerLimitesDaOrg(idOrganizacao: string, modelo: string): Promise<LimiteOrgLido[]> {
  const schemaName = `tenant_${idOrganizacao}`
  if (!SCHEMA_NAME_REGEX.test(schemaName)) {
    throw new Error(`[limiteMonetarioService] Schema name invalido: ${schemaName}`)
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
    // Buscamos todos os ativos da org; filtramos modelo no caller (precisamos
    // tanto do "todos modelos" (NULL) quanto do especifico, para regra
    // "mais restritivo vence").
    const linhas = await tx.$queryRawUnsafe<LimiteOrgLido[]>(
      `SELECT
         id_gabi_limite_monetario,
         modelo_gabi_limite_monetario,
         limite_aviso_usd_gabi_limite_monetario::text  AS "limite_aviso_usd_gabi_limite_monetario",
         limite_bloqueio_usd_gabi_limite_monetario::text AS "limite_bloqueio_usd_gabi_limite_monetario",
         ativo_gabi_limite_monetario
       FROM gabi_limite_monetario
       WHERE ativo_gabi_limite_monetario = true
         AND id_organizacao_gabi_limite_monetario = $1
         AND (modelo_gabi_limite_monetario IS NULL OR modelo_gabi_limite_monetario = $2)`,
      idOrganizacao,
      modelo,
    )
    return linhas
  })
}

/** SUM(custo_usd) MTD para a org.
 *  SAFETY: schemaName validated by SCHEMA_NAME_REGEX; date range via positional params.
 *  OWASP A01: whitelist validada — schema name via regex, dados via params posicionais */
async function lerGastoMtdDaOrg(idOrganizacao: string): Promise<number> {
  const schemaName = `tenant_${idOrganizacao}`
  if (!SCHEMA_NAME_REGEX.test(schemaName)) {
    throw new Error(`[limiteMonetarioService] Schema name invalido: ${schemaName}`)
  }

  const startDate = inicioDoMes()
  const endDate   = inicioDoProximoMes()

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
    const rows = await tx.$queryRawUnsafe<{ total: number | null }[]>(
      `SELECT COALESCE(SUM(custo_usd_gabi_log_uso), 0)::float8 AS total
       FROM gabi_log_uso
       WHERE data_criacao_gabi_log_uso >= $1
         AND data_criacao_gabi_log_uso <  $2`,
      startDate,
      endDate,
    )
    return Number(rows[0]?.total ?? 0)
  })
}

// ---------------------------------------------------------------------------
// Cache wrappers
// ---------------------------------------------------------------------------

async function cacheGet<T>(chave: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    const raw = await redis.get(chave)
    return raw ? (JSON.parse(raw) as T) : null
  } catch (err) {
    console.warn('[limiteMonetarioService] cacheGet falhou', { chave, err: (err as Error).message })
    return null
  }
}

async function cacheSet<T>(chave: string, valor: T, ttlSec: number): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.set(chave, JSON.stringify(valor), 'EX', ttlSec)
  } catch (err) {
    console.warn('[limiteMonetarioService] cacheSet falhou', { chave, err: (err as Error).message })
  }
}

async function cacheDel(chave: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.del(chave)
  } catch (err) {
    console.warn('[limiteMonetarioService] cacheDel falhou', { chave, err: (err as Error).message })
  }
}

// ---------------------------------------------------------------------------
// Loaders com cache
// ---------------------------------------------------------------------------

async function carregarLimitesGlobaisCached(modelo: string): Promise<LimiteGlobalRedePayload[]> {
  const mesRef = mesRefAtual()
  const chave  = chaveCacheLimiteGlobal(modelo, mesRef)
  const hit = await cacheGet<LimiteGlobalRedePayload[]>(chave)
  if (hit) return hit

  // Pega TODOS os globais ativos (modelo NULL e modelo igual) — depois filtramos
  const todos    = await listarLimitesGlobais({ somenteAtivos: true })
  const filtrado = todos.filter(
    (l) =>
      l.modelo_gabi_limite_monetario_global === null ||
      l.modelo_gabi_limite_monetario_global === modelo,
  )
  await cacheSet(chave, filtrado, TTL_GLOBAL_SEC)
  return filtrado
}

async function carregarLimitesOrgCached(idOrg: string, modelo: string): Promise<LimiteOrgLido[]> {
  const mesRef = mesRefAtual()
  const chave  = chaveCacheLimiteOrg(idOrg, modelo, mesRef)
  const hit = await cacheGet<LimiteOrgLido[]>(chave)
  if (hit) return hit

  const valor = await lerLimitesDaOrg(idOrg, modelo)
  await cacheSet(chave, valor, TTL_ORG_SEC)
  return valor
}

async function carregarGastoMtdCached(idOrg: string): Promise<number> {
  const mesRef = mesRefAtual()
  const chave  = chaveCacheGastoMtd(idOrg, mesRef)
  const hit = await cacheGet<number>(chave)
  if (hit !== null) return hit

  const valor = await lerGastoMtdDaOrg(idOrg)
  await cacheSet(chave, valor, TTL_GASTO_MTD_SEC)
  return valor
}

// ---------------------------------------------------------------------------
// Selecao do limite mais restritivo
// ---------------------------------------------------------------------------

interface LimiteCandidato {
  id:                  string
  origem:              OrigemLimite
  limite_aviso_usd:    number
  limite_bloqueio_usd: number
  modelo:              string | null
}

/**
 * Escolhe o limite mais restritivo. Regras:
 *  1. Limite com `modelo` setado vence limite NULL (escopo MODELO > ORG/GLOBAL).
 *  2. Limite ORG vence limite GLOBAL.
 *  3. Em empate de escopo, vence o de menor `limite_bloqueio_usd`.
 */
function escolherMaisRestritivo(
  globais: LimiteGlobalRedePayload[],
  orgs:    LimiteOrgLido[],
  modelo:  string,
): LimiteCandidato | null {
  const candidatos: LimiteCandidato[] = [
    ...globais.map((l): LimiteCandidato => ({
      id:                  l.id_gabi_limite_monetario_global,
      origem:              l.modelo_gabi_limite_monetario_global === modelo ? 'MODELO' : 'GLOBAL',
      limite_aviso_usd:    Number(l.limite_aviso_usd_gabi_limite_monetario_global),
      limite_bloqueio_usd: Number(l.limite_bloqueio_usd_gabi_limite_monetario_global),
      modelo:              l.modelo_gabi_limite_monetario_global,
    })),
    ...orgs.map((l): LimiteCandidato => ({
      id:                  l.id_gabi_limite_monetario,
      origem:              l.modelo_gabi_limite_monetario === modelo ? 'MODELO' : 'ORGANIZACAO',
      limite_aviso_usd:    Number(l.limite_aviso_usd_gabi_limite_monetario),
      limite_bloqueio_usd: Number(l.limite_bloqueio_usd_gabi_limite_monetario),
      modelo:              l.modelo_gabi_limite_monetario,
    })),
  ]

  if (candidatos.length === 0) return null

  // Prioridade de escopo (MODELO > ORGANIZACAO > GLOBAL); empate = menor bloqueio
  const ordemEscopo: Record<OrigemLimite, number> = {
    MODELO:       0,
    ORGANIZACAO:  1,
    GLOBAL:       2,
    sem_limite:   3,
  }
  candidatos.sort((a, b) => {
    const dif = ordemEscopo[a.origem] - ordemEscopo[b.origem]
    if (dif !== 0) return dif
    return a.limite_bloqueio_usd - b.limite_bloqueio_usd
  })
  return candidatos[0]
}

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/**
 * Avalia limite combinado para uma chamada GABI.
 * Tolerante a falhas: se Configurador estiver fora ou cache cair, degrada
 * para "sem_limite" + log de erro (nao bloqueia chamada legitima por falha
 * de infra).
 */
export async function avaliarLimite(
  idOrganizacao: string,
  modelo: string,
): Promise<ResultadoAvaliacaoLimite> {
  const [globaisR, orgsR, gastoR] = await Promise.allSettled([
    carregarLimitesGlobaisCached(modelo),
    carregarLimitesOrgCached(idOrganizacao, modelo),
    carregarGastoMtdCached(idOrganizacao),
  ])

  const globais = globaisR.status === 'fulfilled' ? globaisR.value : []
  const orgs    = orgsR.status    === 'fulfilled' ? orgsR.value    : []
  const gasto   = gastoR.status   === 'fulfilled' ? gastoR.value   : 0

  if (globaisR.status === 'rejected') {
    console.warn('[limiteMonetarioService] falha lendo limites globais', {
      mensagem: (globaisR.reason as Error)?.message,
    })
  }
  if (orgsR.status === 'rejected') {
    console.warn('[limiteMonetarioService] falha lendo limites org', {
      idOrganizacao,
      mensagem: (orgsR.reason as Error)?.message,
    })
  }
  if (gastoR.status === 'rejected') {
    console.warn('[limiteMonetarioService] falha lendo gasto MTD', {
      idOrganizacao,
      mensagem: (gastoR.reason as Error)?.message,
    })
  }

  const escolhido = escolherMaisRestritivo(globais, orgs, modelo)

  if (!escolhido) {
    return {
      gasto_mtd_usd:       gasto,
      limite_aviso_usd:    null,
      limite_bloqueio_usd: null,
      status:              'ok',
      origem_limite:       'sem_limite',
      id_limite_aplicado:  null,
    }
  }

  let status: StatusLimite = 'ok'
  if (gasto >= escolhido.limite_bloqueio_usd)   status = 'bloqueio'
  else if (gasto >= escolhido.limite_aviso_usd) status = 'aviso'

  return {
    gasto_mtd_usd:       gasto,
    limite_aviso_usd:    escolhido.limite_aviso_usd,
    limite_bloqueio_usd: escolhido.limite_bloqueio_usd,
    status,
    origem_limite:       escolhido.origem,
    id_limite_aplicado:  escolhido.id,
  }
}

/**
 * Invalida cache de spend MTD.
 * Chamado por chat.ts/execute.ts apos INSERT em gabi_log_uso para garantir
 * que a proxima checagem leia o gasto atualizado (combina TTL + invalidacao).
 */
export async function invalidarCacheGastoMtd(idOrganizacao: string): Promise<void> {
  const mesRef = mesRefAtual()
  await cacheDel(chaveCacheGastoMtd(idOrganizacao, mesRef))
}

/**
 * Invalida cache de limites configurados.
 * Chamado pelo CRUD admin apos POST/PUT/DELETE de limite — invalida agressivo
 * (TODAS as chaves do escopo na org, todos os meses) para evitar drift.
 *
 * @param idOrganizacao — id_organizacao da org afetada, ou '__global__' para limites GLOBAIS
 */
export async function invalidarCacheLimites(idOrganizacao: string | '__global__'): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    const padrao = idOrganizacao === '__global__'
      ? 'organizacao:__global__:gabi:limite_global:*'
      : `organizacao:${idOrganizacao}:gabi:limite_org:*`
    // SCAN seguro em prod (KEYS bloqueia o servidor sob load)
    const chaves: string[] = []
    let cursor = '0'
    do {
      const [next, found] = await redis.scan(cursor, 'MATCH', padrao, 'COUNT', 200)
      cursor = next
      chaves.push(...found)
    } while (cursor !== '0')
    if (chaves.length > 0) await redis.del(...chaves)
  } catch (err) {
    console.warn('[limiteMonetarioService] invalidarCacheLimites falhou', {
      idOrganizacao,
      err: (err as Error).message,
    })
  }
}
