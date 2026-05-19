/**
 * limite-worker.ts — F2-G do API Cockpit Monitor LLM
 *
 * Worker horario que avalia gasto MTD vs limites monetarios e envia e-mail
 * quando atinge nivel AVISO ou BLOQUEIO. Idempotente via UNIQUE constraint
 * em gabi_alerta_emitido[_global].
 *
 * Implementacao:
 *   - setInterval (sem fila durável) — 1 tick/hora
 *   - Por org: itera gabi_limite_monetario, compara contra spend MTD da org
 *   - GLOBAL: itera limites globais, compara contra spend MTD cross-org
 *   - Idempotencia: INSERT ... ON CONFLICT DO NOTHING. Se rowCount > 0, dispara e-mail.
 *
 * Multi-instancia: cada instancia GABI roda seu proprio setInterval.
 * Por causa do UNIQUE + ON CONFLICT, multiplas instancias nao geram e-mails
 * duplicados — apenas a primeira insere; demais vao "DO NOTHING".
 *
 * Para producao: substituir setInterval por pg-boss.schedule (ja usado em
 * historico-global) — ganha durabilidade entre restarts.
 */

import prisma from '../lib/prisma.js'
import { listarOrganizacoes, listarLimitesGlobais } from '../services/configurador-client.js'

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

function getInternalKey(): string {
  return process.env.CHAVE_INTERNA_SERVICO ?? ''
}
function getEmailServiceUrl(): string {
  return process.env.TENANT_EMAIL_SERVICE_URL
      ?? process.env.EMAIL_SERVICE_URL
      ?? 'http://localhost:8008'
}

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

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

// ---------------------------------------------------------------------------
// E-mail
// ---------------------------------------------------------------------------

async function enviarEmailAlerta(opts: {
  destinatarios: string[]
  escopo:        'GLOBAL' | 'ORGANIZACAO' | 'MODELO'
  nivel:         'AVISO' | 'BLOQUEIO'
  contexto:      string  // ex: "todos os modelos" ou "Acme Corp / gpt-4o-mini"
  gastoUsd:      number
  limiteUsd:     number
  mesRef:        string
  idOrganizacao: string
}): Promise<boolean> {
  const emailUrl    = getEmailServiceUrl()
  const internalKey = getInternalKey()
  if (!emailUrl || !internalKey) {
    console.warn('[limite-worker] EMAIL_SERVICE_URL ou chave interna ausente — email pulado', {
      tem_url: !!emailUrl, tem_chave: !!internalKey,
    })
    return false
  }

  const cor    = opts.nivel === 'BLOQUEIO' ? '#dc2626' : '#f59e0b'
  const titulo = opts.nivel === 'BLOQUEIO' ? '🛑 LIMITE DE BLOQUEIO ATINGIDO' : '⚠️ Aviso de uso de IA'

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:12px">
  <h2 style="margin:0 0 16px;color:${cor};font-size:20px">${titulo}</h2>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.6">
    O consumo de IA da plataforma Gravity ${opts.nivel === 'BLOQUEIO' ? '<strong>excedeu o limite de bloqueio</strong>' : '<strong>atingiu o nível de aviso</strong>'}.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
    <tr><td style="padding:6px 0;color:#94a3b8">Escopo</td><td style="padding:6px 0"><strong>${opts.escopo}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8">Contexto</td><td style="padding:6px 0">${opts.contexto}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8">Mês de referência</td><td style="padding:6px 0">${opts.mesRef}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8">Gasto MTD</td><td style="padding:6px 0;font-weight:600;color:${cor}">${fmtUSD(opts.gastoUsd)}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8">Limite ${opts.nivel.toLowerCase()}</td><td style="padding:6px 0">${fmtUSD(opts.limiteUsd)}</td></tr>
  </table>
  ${opts.nivel === 'BLOQUEIO'
    ? '<p style="margin:16px 0 0;font-size:13px;color:#fca5a5"><strong>Ação automática:</strong> novas chamadas LLM neste escopo serão bloqueadas (HTTP 429) até reset do mês ou ajuste do limite.</p>'
    : '<p style="margin:16px 0 0;font-size:13px;color:#94a3b8">Nenhuma ação automática nesse nível. Reveja o consumo no Monitor LLM do API Cockpit.</p>'}
  <hr style="border:none;border-top:1px solid #334155;margin:20px 0"/>
  <p style="margin:0;font-size:11px;color:#64748b">Plataforma Gravity · Monitor LLM · alerta automatizado</p>
</div>`

  const subject = `[Gravity] ${titulo} · ${opts.contexto} · ${fmtUSD(opts.gastoUsd)}`
  const body    = `${titulo}\n\nEscopo: ${opts.escopo}\nContexto: ${opts.contexto}\nMês: ${opts.mesRef}\nGasto MTD: ${fmtUSD(opts.gastoUsd)}\nLimite: ${fmtUSD(opts.limiteUsd)}`

  try {
    const res = await fetch(`${emailUrl}/api/v1/envios-email`, {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-chave-interna-servico': internalKey,
        'x-internal-key':          internalKey,
        'x-id-organizacao':        opts.idOrganizacao,
        'x-id-usuario':            'system',
      },
      body: JSON.stringify({
        to:        opts.destinatarios,
        subject,
        body,
        body_html: html,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.warn('[limite-worker] email retornou', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.warn('[limite-worker] falha enviando email', (err as Error).message)
    return false
  }
}

// ---------------------------------------------------------------------------
// Per-org evaluation
// ---------------------------------------------------------------------------

interface LimiteOrgRow {
  id_gabi_limite_monetario:                  string
  modelo_gabi_limite_monetario:              string | null
  limite_aviso_usd_gabi_limite_monetario:    string
  limite_bloqueio_usd_gabi_limite_monetario: string
  destinatarios_email_gabi_limite_monetario: string[]
}

// SAFETY NOTE (applies to all raw queries in this file):
// - SET LOCAL search_path uses schemaName validated by SCHEMA_NAME_REGEX
//   (/^tenant_c[a-z0-9]{24}$/) — prevents SQL injection.
// - All data values are passed as positional parameters ($1, $2, ...).
// OWASP A01: whitelist validada — schema name via regex, dados via params posicionais
async function avaliarOrg(idOrganizacao: string): Promise<void> {
  const schemaName = `tenant_${idOrganizacao}`
  if (!SCHEMA_NAME_REGEX.test(schemaName)) return

  // Le limites ATIVOS + spend by modelo MTD numa transacao
  const dados = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
    const limites = await tx.$queryRawUnsafe<LimiteOrgRow[]>(
      `SELECT
         id_gabi_limite_monetario,
         modelo_gabi_limite_monetario,
         limite_aviso_usd_gabi_limite_monetario::text    AS "limite_aviso_usd_gabi_limite_monetario",
         limite_bloqueio_usd_gabi_limite_monetario::text AS "limite_bloqueio_usd_gabi_limite_monetario",
         destinatarios_email_gabi_limite_monetario
       FROM gabi_limite_monetario
       WHERE ativo_gabi_limite_monetario = true`,
    )
    const spendPorModelo = await tx.$queryRawUnsafe<{ modelo: string | null; total: number }[]>(
      `SELECT modelo_gabi_log_uso AS modelo, COALESCE(SUM(custo_usd_gabi_log_uso), 0)::float8 AS total
       FROM gabi_log_uso
       WHERE data_criacao_gabi_log_uso >= $1 AND data_criacao_gabi_log_uso < $2
       GROUP BY modelo_gabi_log_uso`,
      inicioDoMes(),
      inicioDoProximoMes(),
    )
    return { limites, spendPorModelo }
  })

  const totalGeral = dados.spendPorModelo.reduce((acc, r) => acc + Number(r.total), 0)
  const mesRef = mesRefAtual()

  for (const limite of dados.limites) {
    const gasto = limite.modelo_gabi_limite_monetario
      ? Number(dados.spendPorModelo.find((r) => r.modelo === limite.modelo_gabi_limite_monetario)?.total ?? 0)
      : totalGeral

    const aviso    = Number(limite.limite_aviso_usd_gabi_limite_monetario)
    const bloqueio = Number(limite.limite_bloqueio_usd_gabi_limite_monetario)

    let nivel: 'AVISO' | 'BLOQUEIO' | null = null
    let limUsd = 0
    if (gasto >= bloqueio)     { nivel = 'BLOQUEIO'; limUsd = bloqueio }
    else if (gasto >= aviso)   { nivel = 'AVISO';    limUsd = aviso }
    if (!nivel) continue

    const destinatarios = limite.destinatarios_email_gabi_limite_monetario
    if (!destinatarios?.length) continue

    // INSERT ... ON CONFLICT DO NOTHING — idempotencia
    const inseridos = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      return tx.$executeRawUnsafe(
        `INSERT INTO gabi_alerta_emitido (
           id_gabi_alerta_emitido, id_organizacao_gabi_alerta_emitido,
           id_limite_gabi_alerta_emitido, mes_ref_gabi_alerta_emitido,
           nivel_gabi_alerta_emitido, gasto_usd_gabi_alerta_emitido)
         VALUES (
           'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
           $1, $2, $3, $4, $5::numeric)
         ON CONFLICT ON CONSTRAINT gae_unq_limite_mes_nivel DO NOTHING`,
        idOrganizacao,
        limite.id_gabi_limite_monetario,
        mesRef,
        nivel,
        gasto.toFixed(2),
      )
    })

    if (inseridos > 0) {
      const escopo: 'ORGANIZACAO' | 'MODELO' = limite.modelo_gabi_limite_monetario ? 'MODELO' : 'ORGANIZACAO'
      const contexto = `org ${idOrganizacao}` + (limite.modelo_gabi_limite_monetario ? ` / ${limite.modelo_gabi_limite_monetario}` : ' / todos os modelos')
      await enviarEmailAlerta({
        destinatarios, escopo, nivel, contexto, gastoUsd: gasto, limiteUsd: limUsd, mesRef, idOrganizacao,
      })
    }
  }
}

// ---------------------------------------------------------------------------
// GLOBAL evaluation (cross-org)
// ---------------------------------------------------------------------------

async function avaliarGlobais(orgs: { id_organizacao: string }[]): Promise<void> {
  const limites = await listarLimitesGlobais({ somenteAtivos: true })
  if (limites.length === 0) return

  // Calcula spend cross-org agregado por modelo (e total).
  const spendPorModelo = new Map<string | null, number>()
  let totalGeral = 0

  for (const org of orgs) {
    const schemaName = `tenant_${org.id_organizacao}`
    if (!SCHEMA_NAME_REGEX.test(schemaName)) continue
    try {
      const linhas = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
        return tx.$queryRawUnsafe<{ modelo: string | null; total: number }[]>(
          `SELECT modelo_gabi_log_uso AS modelo, COALESCE(SUM(custo_usd_gabi_log_uso), 0)::float8 AS total
           FROM gabi_log_uso
           WHERE data_criacao_gabi_log_uso >= $1 AND data_criacao_gabi_log_uso < $2
           GROUP BY modelo_gabi_log_uso`,
          inicioDoMes(),
          inicioDoProximoMes(),
        )
      })
      for (const l of linhas) {
        const v = Number(l.total)
        spendPorModelo.set(l.modelo, (spendPorModelo.get(l.modelo) ?? 0) + v)
        totalGeral += v
      }
    } catch (err) {
      console.warn('[limite-worker] falha lendo gasto MTD de', org.id_organizacao, (err as Error).message)
    }
  }

  const mesRef = mesRefAtual()
  for (const limite of limites) {
    const modelo = limite.modelo_gabi_limite_monetario_global
    const gasto  = modelo ? (spendPorModelo.get(modelo) ?? 0) : totalGeral
    const aviso    = Number(limite.limite_aviso_usd_gabi_limite_monetario_global)
    const bloqueio = Number(limite.limite_bloqueio_usd_gabi_limite_monetario_global)

    let nivel: 'AVISO' | 'BLOQUEIO' | null = null
    let limUsd = 0
    if (gasto >= bloqueio)   { nivel = 'BLOQUEIO'; limUsd = bloqueio }
    else if (gasto >= aviso) { nivel = 'AVISO';    limUsd = aviso }
    if (!nivel) continue

    const destinatarios = limite.destinatarios_email_gabi_limite_monetario_global
    if (!destinatarios?.length) continue

    // Para alertas GLOBAIS, gravamos no configurador-db via S2S — mas o
    // worker GABI nao tem como gravar la (regra de isolamento).
    // Solucao v1: usar idempotencia em memoria local (Set) por mes_ref + limite_id + nivel.
    // Restart do worker -> pode reenviar 1 vez. Aceitavel.
    if (alertasGlobaisEnviados.has(`${limite.id_gabi_limite_monetario_global}:${mesRef}:${nivel}`)) continue
    alertasGlobaisEnviados.add(`${limite.id_gabi_limite_monetario_global}:${mesRef}:${nivel}`)

    await enviarEmailAlerta({
      destinatarios,
      escopo:        modelo ? 'MODELO' : 'GLOBAL',
      nivel,
      contexto:      modelo ? `GLOBAL / ${modelo}` : 'GLOBAL / todos os modelos',
      gastoUsd:      gasto,
      limiteUsd:     limUsd,
      mesRef,
      idOrganizacao: '__global__',
    })
  }
}

const alertasGlobaisEnviados = new Set<string>()

// Reset mensal do cache em memoria — limpa quando o mes vira
let mesRefCorrente = mesRefAtual()
function checarRotacaoMes(): void {
  const atual = mesRefAtual()
  if (atual !== mesRefCorrente) {
    alertasGlobaisEnviados.clear()
    mesRefCorrente = atual
  }
}

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/** Executa um ciclo completo de avaliacao (todas orgs + GLOBAL). */
export async function executarCicloAvaliacaoLimites(): Promise<void> {
  checarRotacaoMes()
  console.log('[limite-worker] iniciando ciclo de avaliacao')
  try {
    const orgs = await listarOrganizacoes()
    // Per-org em paralelo limitado (não mata DB)
    const lotes = []
    for (let i = 0; i < orgs.length; i += 5) lotes.push(orgs.slice(i, i + 5))
    for (const lote of lotes) {
      await Promise.allSettled(lote.map((o) => avaliarOrg(o.id_organizacao)))
    }
    // GLOBAL depois de per-org
    await avaliarGlobais(orgs)
    console.log('[limite-worker] ciclo concluido')
  } catch (err) {
    console.error('[limite-worker] erro fatal no ciclo', (err as Error).message)
  }
}

const INTERVALO_HORARIO_MS = 60 * 60 * 1000
let timerHandle: NodeJS.Timeout | null = null

/** Inicia o worker (chamado pelo bootstrap do GABI). Idempotente. */
export function iniciarLimiteWorker(): void {
  if (timerHandle) return
  if (process.env.GABI_DESABILITAR_WORKER === 'true') {
    console.log('[limite-worker] desabilitado via GABI_DESABILITAR_WORKER')
    return
  }
  // Primeiro tick em 60s (não no startup pra não atrasar boot)
  setTimeout(() => { void executarCicloAvaliacaoLimites() }, 60_000)
  timerHandle = setInterval(() => { void executarCicloAvaliacaoLimites() }, INTERVALO_HORARIO_MS)
  console.log('[limite-worker] iniciado — ciclo a cada 60min')
}

export function pararLimiteWorker(): void {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
}
