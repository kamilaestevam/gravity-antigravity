import { Prisma } from '../../../../configurador/generated/index.js'
import { resolve } from 'path'
import { prisma } from './prisma.js'
import { lerResultadoTxtDaPasta } from './emt-artifacts.js'
import { raizRepositorioGravity } from './raiz-repositorio-gravity.js'
import type { TestLogEntry } from '../utils/playwright-parser.js'

export interface PersistTesteContexto {
  id_execucao_teste?: string
  ambiente_teste?: string
  disparado_por_teste?: string
  gatilho_teste?: string
  id_agendamento_teste?: string
  data_criacao_teste?: string
}

export interface TesteApiRegistro {
  id_teste: string
  data_criacao_teste: string
  tipo_teste: string
  escopo_teste: string
  sublocal_teste: string | null
  modulo_teste: string
  nome_teste: string
  id_plano_teste: string | null
  resultado_teste: string
  duracao_teste: string
  quantidade_passos_teste: number
  log_erro_teste: string | null
  log_sucesso_teste: string | null
  pasta_emt_teste: string | null
  lista_prints_emt_teste: string[]
  analise_ia_teste: Record<string, unknown> | null
  ambiente_teste: string
  id_execucao_teste: string | null
}

export function extrairEscopoDoModulo(modulo: string): string {
  const limpo = modulo.trim().toUpperCase()
  const partes = limpo.split('-')
  if (partes[0] === 'TST' && partes.length >= 3) {
    if (partes[1] === 'EMT' && partes.length >= 4) return partes[2]
    return partes[2]
  }
  if (limpo.includes('PEDIDO')) return 'PEDIDO'
  if (limpo.includes('PROCESSO') || limpo.includes('PROCSO')) return 'PROCSO'
  if (limpo.includes('CONFIG')) return 'CONFIG'
  if (limpo.includes('ADMIN')) return 'ADMIN'
  return 'ADMIN'
}

export function extrairIdPlanoTeste(modulo: string): string | null {
  const candidato = modulo.trim().split('/')[0]?.trim() ?? ''
  return /^TST-[A-Z0-9-]+$/i.test(candidato) ? candidato : null
}

function textoLogEmt(entry: TestLogEntry): string {
  const pasta = entry.emt_pasta
  if (pasta) {
    const abs = resolve(raizRepositorioGravity, pasta)
    return lerResultadoTxtDaPasta(abs) ?? entry.success_log ?? entry.error_log ?? ''
  }
  return entry.success_log ?? entry.error_log ?? ''
}

export function calcularQuantidadePassosTeste(entry: TestLogEntry): number {
  if (entry.type !== 'EMT') return 1
  const texto = textoLogEmt(entry)
  if (!texto.trim()) return 1
  let count = 0
  for (const linha of texto.split('\n')) {
    const t = linha.trim()
    if (t.startsWith('✓') || t.startsWith('✗') || t.includes('EMT_ROW|')) count++
  }
  return count || 1
}

function resolverLogSucessoTeste(entry: TestLogEntry): string | null {
  if (entry.type !== 'EMT') return entry.success_log ?? null
  if (entry.emt_pasta) {
    const abs = resolve(raizRepositorioGravity, entry.emt_pasta)
    return lerResultadoTxtDaPasta(abs) ?? entry.success_log ?? null
  }
  return entry.success_log ?? null
}

function entryParaCreateInput(
  entry: TestLogEntry,
  ctx: PersistTesteContexto,
): Prisma.TesteCreateManyInput {
  const dataCriacao = ctx.data_criacao_teste
    ? new Date(ctx.data_criacao_teste)
    : new Date()

  return {
    id_organizacao: 'platform',
    tipo_teste: entry.type,
    escopo_teste: extrairEscopoDoModulo(entry.module),
    sublocal_teste: null,
    modulo_teste: entry.module,
    nome_teste: entry.test_name,
    id_plano_teste: extrairIdPlanoTeste(entry.module),
    id_agendamento_teste: ctx.id_agendamento_teste ?? null,
    resultado_teste: entry.result,
    duracao_teste: entry.duration,
    log_erro_teste: entry.error_log ?? null,
    log_sucesso_teste: resolverLogSucessoTeste(entry),
    pasta_emt_teste: entry.emt_pasta ?? null,
    lista_prints_emt_teste: entry.emt_prints?.length ? entry.emt_prints : undefined,
    quantidade_passos_teste: calcularQuantidadePassosTeste(entry),
    analise_ia_teste: entry.ai_analysis ?? undefined,
    ambiente_teste: ctx.ambiente_teste ?? 'Local',
    id_execucao_teste: ctx.id_execucao_teste ?? null,
    disparado_por_teste: ctx.disparado_por_teste ?? null,
    gatilho_teste: ctx.gatilho_teste ?? null,
    data_criacao_teste: dataCriacao,
  }
}

export async function persistirEntradasTeste(
  entries: TestLogEntry[],
  ctx: PersistTesteContexto = {},
  debugLog?: (msg: string) => void,
): Promise<{ ids: string[]; salvouNoBanco: boolean }> {
  if (entries.length === 0) return { ids: [], salvouNoBanco: false }

  try {
    const created = await prisma.$transaction(
      entries.map(entry =>
        prisma.teste.create({
          data: entryParaCreateInput(entry, ctx),
          select: { id_teste: true },
        }),
      ),
    )
    debugLog?.(`DB: ${created.length} registro(s) em teste`)
    return { ids: created.map(r => r.id_teste), salvouNoBanco: true }
  } catch (err) {
    debugLog?.(`DB FAILED: ${err instanceof Error ? err.message : String(err)}`)
    return { ids: [], salvouNoBanco: false }
  }
}

export function testePrismaParaApi(row: {
  id_teste: string
  data_criacao_teste: Date
  tipo_teste: string
  escopo_teste: string
  sublocal_teste: string | null
  modulo_teste: string
  nome_teste: string
  id_plano_teste: string | null
  resultado_teste: string
  duracao_teste: string
  quantidade_passos_teste: number
  log_erro_teste: string | null
  log_sucesso_teste: string | null
  pasta_emt_teste: string | null
  lista_prints_emt_teste: Prisma.JsonValue
  analise_ia_teste: Prisma.JsonValue
  ambiente_teste: string
  id_execucao_teste: string | null
}): TesteApiRegistro {
  const prints = Array.isArray(row.lista_prints_emt_teste)
    ? row.lista_prints_emt_teste.filter((p): p is string => typeof p === 'string')
    : []

  return {
    id_teste: row.id_teste,
    data_criacao_teste: row.data_criacao_teste.toISOString(),
    tipo_teste: row.tipo_teste,
    escopo_teste: row.escopo_teste,
    sublocal_teste: row.sublocal_teste,
    modulo_teste: row.modulo_teste,
    nome_teste: row.nome_teste,
    id_plano_teste: row.id_plano_teste,
    resultado_teste: row.resultado_teste,
    duracao_teste: row.duracao_teste,
    quantidade_passos_teste: row.quantidade_passos_teste,
    log_erro_teste: row.log_erro_teste,
    log_sucesso_teste: row.log_sucesso_teste,
    pasta_emt_teste: row.pasta_emt_teste,
    lista_prints_emt_teste: prints,
    analise_ia_teste: row.analise_ia_teste && typeof row.analise_ia_teste === 'object' && !Array.isArray(row.analise_ia_teste)
      ? row.analise_ia_teste as Record<string, unknown>
      : null,
    ambiente_teste: row.ambiente_teste,
    id_execucao_teste: row.id_execucao_teste,
  }
}

export function entradaJsonLegadaParaApi(entry: Record<string, unknown>): TesteApiRegistro {
  const id = String(entry.id ?? entry.id_teste ?? '')
  const created = String(entry.created_at ?? entry.data_criacao_teste ?? new Date().toISOString())
  const modulo = String(entry.module ?? entry.modulo_teste ?? '')
  const tipo = String(entry.type ?? entry.tipo_teste ?? 'E2E')
  const logEntry: TestLogEntry = {
    type: tipo,
    module: modulo,
    test_name: String(entry.test_name ?? entry.nome_teste ?? ''),
    result: (entry.result ?? entry.resultado_teste ?? 'ERRO') as TestLogEntry['result'],
    duration: String(entry.duration ?? entry.duracao_teste ?? '0ms'),
    error_log: (entry.error_log ?? entry.log_erro_teste ?? null) as string | null,
    success_log: (entry.success_log ?? entry.log_sucesso_teste ?? null) as string | null,
    emt_pasta: (entry.emt_pasta ?? entry.pasta_emt_teste ?? null) as string | null,
    emt_prints: Array.isArray(entry.emt_prints)
      ? entry.emt_prints.filter((p): p is string => typeof p === 'string')
      : Array.isArray(entry.lista_prints_emt_teste)
        ? entry.lista_prints_emt_teste.filter((p): p is string => typeof p === 'string')
        : undefined,
    ai_analysis: (entry.ai_analysis ?? entry.analise_ia_teste ?? null) as TestLogEntry['ai_analysis'],
  }

  return {
    id_teste: id,
    data_criacao_teste: created,
    tipo_teste: tipo,
    escopo_teste: String(entry.escopo_teste ?? extrairEscopoDoModulo(modulo)),
    sublocal_teste: (entry.sublocal_teste as string | null) ?? null,
    modulo_teste: modulo,
    nome_teste: logEntry.test_name,
    id_plano_teste: (entry.id_plano_teste as string | null) ?? extrairIdPlanoTeste(modulo),
    resultado_teste: logEntry.result,
    duracao_teste: logEntry.duration,
    quantidade_passos_teste: typeof entry.quantidade_passos_teste === 'number'
      ? entry.quantidade_passos_teste
      : calcularQuantidadePassosTeste(logEntry),
    log_erro_teste: logEntry.error_log,
    log_sucesso_teste: logEntry.success_log ?? null,
    pasta_emt_teste: logEntry.emt_pasta ?? null,
    lista_prints_emt_teste: logEntry.emt_prints ?? [],
    analise_ia_teste: logEntry.ai_analysis as Record<string, unknown> | null,
    ambiente_teste: String(entry.ambiente_teste ?? entry.ambiente ?? 'Local'),
    id_execucao_teste: (entry.id_execucao_teste ?? entry.run_id ?? null) as string | null,
  }
}

export async function listarTestesDoBanco(limite = 500): Promise<TesteApiRegistro[]> {
  const rows = await prisma.teste.findMany({
    orderBy: { data_criacao_teste: 'desc' },
    take: limite,
  })
  return rows.map(testePrismaParaApi)
}

export async function buscarTestePorId(id: string): Promise<TesteApiRegistro | null> {
  const row = await prisma.teste.findUnique({ where: { id_teste: id } })
  return row ? testePrismaParaApi(row) : null
}

export async function atualizarCampoTeste(
  id: string,
  campo: 'analise_ia_teste' | 'log_erro_teste',
  valor: unknown,
): Promise<boolean> {
  try {
    await prisma.teste.update({
      where: { id_teste: id },
      data: { [campo]: valor as Prisma.InputJsonValue },
    })
    return true
  } catch {
    return false
  }
}

export async function buscarTesteComoLogLegado(id: string): Promise<Record<string, unknown> | null> {
  const api = await buscarTestePorId(id)
  if (!api) return null
  return {
    id: api.id_teste,
    created_at: api.data_criacao_teste,
    type: api.tipo_teste,
    module: api.modulo_teste,
    test_name: api.nome_teste,
    result: api.resultado_teste,
    duration: api.duracao_teste,
    error_log: api.log_erro_teste,
    success_log: api.log_sucesso_teste,
    emt_pasta: api.pasta_emt_teste,
    emt_prints: api.lista_prints_emt_teste,
    ai_analysis: api.analise_ia_teste,
    quantidade_passos_teste: api.quantidade_passos_teste,
  }
}
