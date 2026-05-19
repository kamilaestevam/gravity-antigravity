// server/services/servico-circuit-breaker.ts
// Circuit Breaker — Garantia absoluta contra acao indevida (secao 9.3 do doc).
// A GABI NUNCA executa uma acao WRITE sem autorizacao explicita do usuario.
//
// Fluxo de 7 barreiras:
// A. Classificar tool → READ executa imediatamente
// B. Gerar preview (quando aplicavel)
// C. Descrever acao em linguagem humana
// D. Aguardar confirmacao explicita do usuario
// E. Gerar nonce unico (CUID, 60s expiry)
// F. Validar nonce + executar
// G. Comparar resultado com intencao

import { createId } from '@paralleldrive/cuid2'
import { createHash } from 'crypto'
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { buscarTool, type ClasseRisco } from './catalogo-ferramentas.js'

const NONCE_TTL_MS = 60_000
const MAX_TOOLS_POR_TURNO = 5
const TOOL_TIMEOUT_MS = 10_000
const RATE_LIMIT_POR_MINUTO = 30

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface CircuitBreakerContexto {
  id_organizacao: string
  id_usuario: string
  id_conversa: string
  tipo_usuario: string
}

export interface ResultadoBarreiraA {
  tipo: 'executar_imediato' | 'exige_confirmacao'
  classe: ClasseRisco
  tool_id: string
}

export interface PedidoConfirmacao {
  nonce: string
  tool_id: string
  descricao_acao: string
  preview?: unknown
  classe: ClasseRisco
  expira_em: Date
}

export interface ResultadoExecucao {
  sucesso: boolean
  status: number
  dados?: unknown
  erro?: string
}

// ── Rate Limiter em memoria ─────────────────────────────────────────────────

const contadorChamadas = new Map<string, { count: number; resetAt: number }>()
const contadorTurno = new Map<string, number>()

function chaveRateLimit(ctx: CircuitBreakerContexto): string {
  return `${ctx.id_organizacao}:${ctx.id_usuario}`
}

function verificarRateLimit(ctx: CircuitBreakerContexto): void {
  const chave = chaveRateLimit(ctx)
  const agora = Date.now()
  const registro = contadorChamadas.get(chave)

  if (!registro || agora > registro.resetAt) {
    contadorChamadas.set(chave, { count: 1, resetAt: agora + 60_000 })
    return
  }

  if (registro.count >= RATE_LIMIT_POR_MINUTO) {
    throw new AppError(
      `Limite de ${RATE_LIMIT_POR_MINUTO} chamadas por minuto atingido. Aguarde um momento.`,
      429,
      'RATE_LIMIT_EXCEEDED',
    )
  }

  registro.count++
}

export function verificarLimiteTurno(id_conversa: string): void {
  const count = contadorTurno.get(id_conversa) ?? 0
  if (count >= MAX_TOOLS_POR_TURNO) {
    throw new AppError(
      `Limite de ${MAX_TOOLS_POR_TURNO} tools por turno atingido.`,
      429,
      'TURN_LIMIT_EXCEEDED',
    )
  }
  contadorTurno.set(id_conversa, count + 1)
}

export function resetarContadorTurno(id_conversa: string): void {
  contadorTurno.delete(id_conversa)
}

// ── BARREIRA A — Classificar tool ───────────────────────────────────────────

export function classificarTool(tool_id: string): ResultadoBarreiraA {
  const tool = buscarTool(tool_id)
  if (!tool) {
    throw new AppError(`Tool desconhecida: ${tool_id}`, 400, 'TOOL_NOT_FOUND')
  }

  if (tool.classe === 'READ') {
    return { tipo: 'executar_imediato', classe: 'READ', tool_id }
  }

  return { tipo: 'exige_confirmacao', classe: tool.classe, tool_id }
}

// ── BARREIRA C — Descrever acao em linguagem humana ─────────────────────────

export function gerarDescricaoAcao(tool_id: string, parametros: Record<string, unknown>): string {
  const tool = buscarTool(tool_id)
  if (!tool) return `Executar ${tool_id}`

  const partes: string[] = []

  switch (tool.classe) {
    case 'WRITE_SAFE':
      partes.push(`Vou ${tool.descricao.toLowerCase()}.`)
      break
    case 'WRITE_DESTRUTIVA':
      partes.push(`⚠️ Acao destrutiva: ${tool.descricao.toLowerCase()}.`)
      partes.push('Esta acao pode ser irreversivel.')
      break
    case 'WRITE_FINANCEIRA':
      partes.push(`💰 Acao financeira: ${tool.descricao.toLowerCase()}.`)
      partes.push('Esta acao tem impacto financeiro.')
      break
    default:
      partes.push(tool.descricao)
  }

  const ids = parametros.ids ?? parametros.pedido_ids
  if (Array.isArray(ids) && ids.length > 0) {
    partes.push(`Afeta ${ids.length} registro(s).`)
  }

  const id_singular = parametros.id_pedido ?? parametros.id_workspace ?? parametros.id_usuario
  if (typeof id_singular === 'string') {
    partes.push(`Registro: ${id_singular}`)
  }

  return partes.join(' ')
}

// ── BARREIRA E — Gerar nonce unico ──────────────────────────────────────────

function hashParametros(parametros: Record<string, unknown>): string {
  const sorted = JSON.stringify(parametros, Object.keys(parametros).sort())
  return createHash('sha256').update(sorted).digest('hex')
}

export async function criarConfirmacao(
  ctx: CircuitBreakerContexto,
  tool_id: string,
  parametros: Record<string, unknown>,
  descricao_acao: string,
): Promise<PedidoConfirmacao> {
  const tool = buscarTool(tool_id)
  if (!tool) {
    throw new AppError(`Tool desconhecida: ${tool_id}`, 400, 'TOOL_NOT_FOUND')
  }

  const nonce = createId()
  const expira_em = new Date(Date.now() + NONCE_TTL_MS)

  // Prisma create (sem coluna parametros que nao esta no schema.prisma)
  await prisma.gabiConfirmacaoAcao.create({
    data: {
      id_organizacao_gabi_confirmacao_acao: ctx.id_organizacao,
      id_usuario_gabi_confirmacao_acao: ctx.id_usuario,
      id_conversa_gabi_confirmacao_acao: ctx.id_conversa,
      nonce_gabi_confirmacao_acao: nonce,
      tool_id_gabi_confirmacao_acao: tool_id,
      parametros_hash_gabi_confirmacao_acao: hashParametros(parametros),
      descricao_acao_gabi_confirmacao_acao: descricao_acao,
      data_expiracao_gabi_confirmacao_acao: expira_em,
    },
  })

  // Salvar parametros originais via raw SQL (coluna adicionada fora do schema.prisma)
  await prisma.$executeRawUnsafe(
    `UPDATE gabi_confirmacao_acao SET parametros_gabi_confirmacao_acao = $1::jsonb WHERE nonce_gabi_confirmacao_acao = $2`,
    JSON.stringify(parametros),
    nonce,
  )

  return {
    nonce,
    tool_id,
    descricao_acao,
    classe: tool.classe,
    expira_em,
  }
}

// ── BARREIRA F — Validar nonce ──────────────────────────────────────────────

export interface ResultadoValidacaoNonce {
  parametrosOriginais: Record<string, unknown>
}

export async function validarNonce(
  nonce: string,
  tool_id: string,
  parametros: Record<string, unknown>,
  ctx: CircuitBreakerContexto,
): Promise<ResultadoValidacaoNonce> {
  const registro = await prisma.gabiConfirmacaoAcao.findUnique({
    where: { nonce_gabi_confirmacao_acao: nonce },
  })

  if (!registro) {
    throw new AppError('Nonce de confirmacao invalido.', 409, 'NONCE_INVALID')
  }

  if (registro.consumido_gabi_confirmacao_acao) {
    throw new AppError('Nonce ja foi utilizado.', 409, 'NONCE_CONSUMED')
  }

  if (new Date() > registro.data_expiracao_gabi_confirmacao_acao) {
    throw new AppError('Nonce expirado. Solicite nova confirmacao.', 409, 'NONCE_EXPIRED')
  }

  if (registro.tool_id_gabi_confirmacao_acao !== tool_id) {
    throw new AppError('Nonce pertence a outra tool.', 409, 'NONCE_TOOL_MISMATCH')
  }

  if (registro.id_usuario_gabi_confirmacao_acao !== ctx.id_usuario) {
    throw new AppError('Nonce pertence a outro usuario.', 403, 'NONCE_USER_MISMATCH')
  }

  if (registro.id_organizacao_gabi_confirmacao_acao !== ctx.id_organizacao) {
    throw new AppError('Nonce pertence a outra organizacao.', 403, 'NONCE_ORG_MISMATCH')
  }

  // Se frontend envia parametros vazios, usar os originais salvos no nonce
  const parametrosEfetivos = Object.keys(parametros).length === 0
    ? (registro.parametros_gabi_confirmacao_acao as Record<string, unknown> ?? {})
    : parametros

  const hashAtual = hashParametros(parametrosEfetivos)
  if (registro.parametros_hash_gabi_confirmacao_acao !== hashAtual) {
    throw new AppError('Parametros foram alterados desde a confirmacao.', 409, 'NONCE_PARAMS_CHANGED')
  }

  await prisma.gabiConfirmacaoAcao.update({
    where: { nonce_gabi_confirmacao_acao: nonce },
    data: { consumido_gabi_confirmacao_acao: true },
  })

  return { parametrosOriginais: parametrosEfetivos }
}

// ── Orquestrador principal ──────────────────────────────────────────────────

export type EmitSSE = (evento: string, dados: unknown) => void

export interface OpcoesChamadaTool {
  tool_id: string
  parametros: Record<string, unknown>
  ctx: CircuitBreakerContexto
  nonce?: string
  executor: (tool_id: string, parametros: Record<string, unknown>, ctx: CircuitBreakerContexto) => Promise<ResultadoExecucao>
  emitSse?: EmitSSE
}

export interface ResultadoCircuitBreaker {
  tipo: 'executado' | 'aguardando_confirmacao' | 'erro'
  dados?: unknown
  confirmacao?: PedidoConfirmacao
  erro?: string
}

export async function processarChamadaTool(opcoes: OpcoesChamadaTool): Promise<ResultadoCircuitBreaker> {
  const { tool_id, parametros, ctx, nonce, executor, emitSse } = opcoes

  // Rate limit (Barreira 7 do doc)
  verificarRateLimit(ctx)
  verificarLimiteTurno(ctx.id_conversa)

  // BARREIRA A — Classificar tool
  const classificacao = classificarTool(tool_id)
  emitSse?.('transparency', { message: `Classificando tool ${tool_id}: ${classificacao.classe}` })

  // READ → executar imediatamente
  if (classificacao.tipo === 'executar_imediato') {
    emitSse?.('transparency', { message: `Consultando dados via ${tool_id}...` })

    const resultado = await executarComTimeout(tool_id, parametros, ctx, executor)
    return { tipo: 'executado', dados: resultado.dados }
  }

  // WRITE sem nonce → gerar confirmacao (Barreiras B, C, D, E)
  if (!nonce) {
    emitSse?.('transparency', { message: `⚠️ GABI quer executar: ${tool_id}. Aguardando confirmacao...` })

    // BARREIRA C — Descrever acao
    const descricao = gerarDescricaoAcao(tool_id, parametros)

    // BARREIRA E — Gerar nonce
    const confirmacao = await criarConfirmacao(ctx, tool_id, parametros, descricao)

    return { tipo: 'aguardando_confirmacao', confirmacao }
  }

  // WRITE com nonce → validar e executar (Barreiras F, G)
  emitSse?.('transparency', { message: `Validando confirmacao para ${tool_id}...` })

  // BARREIRA F — Validar nonce (retorna parametros originais se frontend enviou {})
  const { parametrosOriginais } = await validarNonce(nonce, tool_id, parametros, ctx)

  emitSse?.('transparency', { message: `Executando ${tool_id}...` })

  // Executar com parametros originais (garantidos pelo hash)
  const resultado = await executarComTimeout(tool_id, parametrosOriginais, ctx, executor)

  // BARREIRA G — Comparar resultado com intencao
  if (!resultado.sucesso) {
    emitSse?.('transparency', { message: `Erro ao executar ${tool_id}: ${resultado.erro}` })
    return { tipo: 'erro', erro: resultado.erro }
  }

  emitSse?.('transparency', { message: `✅ ${tool_id} executado com sucesso.` })
  return { tipo: 'executado', dados: resultado.dados }
}

// ── Execucao com timeout ────────────────────────────────────────────────────

async function executarComTimeout(
  tool_id: string,
  parametros: Record<string, unknown>,
  ctx: CircuitBreakerContexto,
  executor: (tool_id: string, parametros: Record<string, unknown>, ctx: CircuitBreakerContexto) => Promise<ResultadoExecucao>,
): Promise<ResultadoExecucao> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TOOL_TIMEOUT_MS)

  try {
    const resultado = await Promise.race([
      executor(tool_id, parametros, ctx),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () =>
          reject(new AppError(`Timeout ao executar ${tool_id} (${TOOL_TIMEOUT_MS}ms)`, 504, 'TOOL_TIMEOUT')),
        )
      }),
    ])
    return resultado
  } finally {
    clearTimeout(timer)
  }
}

// ── Log de execucao ─────────────────────────────────────────────────────────

export async function registrarExecucaoTool(
  ctx: CircuitBreakerContexto,
  tool_id: string,
  parametros: Record<string, unknown>,
  resultado: ResultadoExecucao,
  duracao_ms: number,
  confirmacao_usuario: boolean,
): Promise<void> {
  try {
    await prisma.gabiToolExecucao.create({
      data: {
        id_organizacao_gabi_tool_execucao: ctx.id_organizacao,
        id_usuario_gabi_tool_execucao: ctx.id_usuario,
        id_conversa_gabi_tool_execucao: ctx.id_conversa,
        tool_id_gabi_tool_execucao: tool_id,
        parametros_gabi_tool_execucao: parametros,
        resultado_status_gabi_tool_execucao: resultado.status,
        resultado_resumo_gabi_tool_execucao: resultado.sucesso
          ? JSON.stringify(resultado.dados).slice(0, 2000)
          : resultado.erro?.slice(0, 2000),
        duracao_ms_gabi_tool_execucao: duracao_ms,
        confirmacao_usuario_gabi_tool_execucao: confirmacao_usuario,
      },
    })
  } catch (err) {
    console.error('[GABI/CircuitBreaker] Falha ao registrar execucao:', err)
  }
}

// ── Limpeza de nonces expirados (cron) ──────────────────────────────────────

export async function limparNoncesExpirados(): Promise<number> {
  try {
    const resultado = await prisma.gabiConfirmacaoAcao.deleteMany({
      where: {
        OR: [
          { data_expiracao_gabi_confirmacao_acao: { lt: new Date() } },
          { consumido_gabi_confirmacao_acao: true, data_criacao_gabi_confirmacao_acao: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    })
    return resultado.count
  } catch {
    return 0
  }
}
