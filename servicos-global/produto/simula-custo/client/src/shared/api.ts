/**
 * api.ts — Client REST do Estimativa Custo (base /api/v1/simula-custo).
 * Mandamento 06: toda resposta é validada com Zod antes do uso.
 * Contexto (org/workspace/usuário) vem do Shell store via setApiContext.
 */
import {
  RespostaEstimativaCustoSchema,
  RespostaDetalheEstimativaCustoSchema,
  RespostaListaEstimativasCustoSchema,
  KpisEstimativaCustoSchema,
  KpisDashboardEstimativaCustoSchema,
  RecentesEstimativaCustoSchema,
  ConfigStatusEstimativaCustoSchema,
  RespostaSimulacaoEstimativaCustoSchema,
  BuscaNcmEstimativaCustoSchema,
  ValidarNcmEstimativaCustoSchema,
  UfsEstimativaCustoSchema,
  type EstimativaCusto,
  type EstimativaCustoDetalhe,
  type RespostaListaEstimativasCusto,
  type KpisEstimativaCusto,
  type KpisDashboardEstimativaCusto,
  type EstimativaCustoRecente,
  type ConfigStatusEstimativaCusto,
  type ResultadoSimulacaoEstimativaCusto,
  type ValidarNcmEstimativaCusto,
  type UfEstimativaCusto,
  type EntradaEstimativaCusto,
  type EntradaSimulacaoEstimativaCusto,
  type StatusEstimativaCusto,
} from './schemas-estimativa-custo'

const API_BASE = '/api/v1/simula-custo'

// ─── Contexto da organização (setado pelo App.tsx a partir do Shell store) ────
let _idOrganizacao = ''
let _idUsuario = ''
let _idWorkspace = ''

export function setApiContext(ctx: { idOrganizacao: string; idUsuario: string; idWorkspace?: string }) {
  _idOrganizacao = ctx.idOrganizacao
  _idUsuario = ctx.idUsuario
  if (ctx.idWorkspace !== undefined) _idWorkspace = ctx.idWorkspace
}

function resolverIdWorkspace(): string {
  if (_idWorkspace) return _idWorkspace
  try { return sessionStorage.getItem('gravity_company_id') ?? '' } catch { return '' }
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
  }
  if (_idOrganizacao) h['x-id-organizacao'] = _idOrganizacao
  if (_idUsuario) h['x-id-usuario'] = _idUsuario
  const ws = resolverIdWorkspace()
  if (ws) h['x-id-workspace'] = ws
  return h
}

async function requisitar(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: headers() })
  if (!res.ok) {
    const corpo = await res.json().catch(() => ({} as Record<string, unknown>))
    const mensagem = typeof (corpo as { error?: unknown }).error === 'string'
      ? (corpo as { error: string }).error
      : `Erro ${res.status}`
    throw new Error(mensagem)
  }
  return res.json()
}

// ─── Estimativas CRUD ─────────────────────────────────────────────────────────

export interface ParametrosListaEstimativasCusto {
  busca?: string
  status?: StatusEstimativaCusto
  pagina?: number
  limite?: number
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export async function listarEstimativasCusto(params: ParametrosListaEstimativasCusto = {}): Promise<RespostaListaEstimativasCusto> {
  const query = new URLSearchParams()
  if (params.busca) query.set('busca', params.busca)
  if (params.status) query.set('status', params.status)
  if (params.pagina) query.set('pagina', String(params.pagina))
  if (params.limite) query.set('limite', String(params.limite))
  if (params.ordenar_por) query.set('ordenar_por', params.ordenar_por)
  if (params.direcao) query.set('direcao', params.direcao)

  const raw = await requisitar(`/estimativas-custo?${query}`)
  return RespostaListaEstimativasCustoSchema.parse(raw)
}

export async function obterEstimativaCusto(idEstimativaCusto: string): Promise<EstimativaCustoDetalhe> {
  const raw = await requisitar(`/estimativas-custo/${idEstimativaCusto}`)
  return RespostaDetalheEstimativaCustoSchema.parse(raw).estimativa_custo
}

export async function criarEstimativaCusto(entrada: EntradaEstimativaCusto): Promise<EstimativaCusto> {
  const raw = await requisitar('/estimativas-custo', { method: 'POST', body: JSON.stringify(entrada) })
  return RespostaEstimativaCustoSchema.parse(raw).estimativa_custo
}

export async function atualizarEstimativaCusto(
  idEstimativaCusto: string,
  entrada: Partial<EntradaEstimativaCusto>
): Promise<EstimativaCusto> {
  const raw = await requisitar(`/estimativas-custo/${idEstimativaCusto}`, { method: 'PUT', body: JSON.stringify(entrada) })
  return RespostaEstimativaCustoSchema.parse(raw).estimativa_custo
}

export async function atualizarStatusEstimativaCusto(
  idEstimativaCusto: string,
  status: StatusEstimativaCusto
): Promise<EstimativaCusto> {
  const raw = await requisitar(`/estimativas-custo/${idEstimativaCusto}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_estimativa_custo: status }),
  })
  return RespostaEstimativaCustoSchema.parse(raw).estimativa_custo
}

export async function duplicarEstimativaCusto(idEstimativaCusto: string): Promise<EstimativaCusto> {
  const raw = await requisitar(`/estimativas-custo/${idEstimativaCusto}/duplicar`, { method: 'POST' })
  return RespostaEstimativaCustoSchema.parse(raw).estimativa_custo
}

export async function excluirEstimativaCusto(idEstimativaCusto: string): Promise<void> {
  await requisitar(`/estimativas-custo/${idEstimativaCusto}`, { method: 'DELETE' })
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export async function obterKpisEstimativaCusto(): Promise<KpisEstimativaCusto> {
  const raw = await requisitar('/estimativas-custo/kpis')
  return KpisEstimativaCustoSchema.parse(raw)
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function obterKpisDashboardEstimativaCusto(): Promise<KpisDashboardEstimativaCusto> {
  const raw = await requisitar('/dashboard/kpis')
  return KpisDashboardEstimativaCustoSchema.parse(raw).kpis
}

export async function obterRecentesEstimativaCusto(): Promise<EstimativaCustoRecente[]> {
  const raw = await requisitar('/dashboard/recentes')
  return RecentesEstimativaCustoSchema.parse(raw).recentes
}

export async function obterWidgetsDashboardEstimativaCusto(
  metricas: string[],
  periodo = '30d'
): Promise<Record<string, unknown>> {
  const raw = await requisitar('/dashboard/widgets', {
    method: 'POST',
    body: JSON.stringify({ metricas, filtros: { periodo } }),
  })
  return raw as Record<string, unknown>
}

// ─── Config status (colunas do Kanban) ───────────────────────────────────────

export async function obterConfigStatusEstimativaCusto(): Promise<ConfigStatusEstimativaCusto[]> {
  const raw = await requisitar('/config-status-estimativa-custo')
  return ConfigStatusEstimativaCustoSchema.parse(raw).status_estimativa_custo
}

// ─── Simulação ────────────────────────────────────────────────────────────────

export async function simularEstimativaCusto(
  entrada: EntradaSimulacaoEstimativaCusto
): Promise<ResultadoSimulacaoEstimativaCusto> {
  const raw = await requisitar('/simular', { method: 'POST', body: JSON.stringify(entrada) })
  return RespostaSimulacaoEstimativaCustoSchema.parse(raw)
}

// ─── Master data ──────────────────────────────────────────────────────────────

export async function buscarNcmEstimativaCusto(q: string): Promise<Array<{ codigo: string; descricao: string }>> {
  if (q.length < 2) return []
  const raw = await requisitar(`/ncm/buscar?q=${encodeURIComponent(q)}`)
  return BuscaNcmEstimativaCustoSchema.parse(raw).itens
}

export async function validarNcmEstimativaCusto(codigo: string): Promise<ValidarNcmEstimativaCusto> {
  const raw = await requisitar(`/ncm/${encodeURIComponent(codigo)}/validar`)
  return ValidarNcmEstimativaCustoSchema.parse(raw)
}

export async function listarUfsEstimativaCusto(): Promise<UfEstimativaCusto[]> {
  const raw = await requisitar('/unidades-federativas')
  return UfsEstimativaCustoSchema.parse(raw)
}
