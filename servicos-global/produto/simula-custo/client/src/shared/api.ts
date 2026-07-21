/**
 * api.ts — Client REST do Simula Custo (base /api/v1/simula-custo).
 * Mandamento 06: toda resposta é validada com Zod antes do uso.
 * Contexto (org/workspace/usuário) vem do Shell store via setApiContext.
 */
import {
  RespostaSimulaCustoSchema,
  RespostaDetalheSimulaCustoSchema,
  RespostaListaSimulasCustoSchema,
  KpisSimulaCustoSchema,
  KpisDashboardSimulaCustoSchema,
  RecentesSimulaCustoSchema,
  NcmsRecentesSimulaCustoSchema,
  ConfigStatusSimulaCustoSchema,
  RespostaSimulacaoSimulaCustoSchema,
  BuscaNcmSimulaCustoSchema,
  ValidarNcmSimulaCustoSchema,
  UfsSimulaCustoSchema,
  OpcoesIcmsSimulaCustoSchema,
  ListaTaxasOrigemDestinoCadastroSchema,
  type SimulaCusto,
  type SimulaCustoDetalhe,
  type RespostaListaSimulasCusto,
  type KpisSimulaCusto,
  type KpisDashboardSimulaCusto,
  type SimulaCustoRecente,
  type NcmRecenteServidorSimulaCusto,
  type ConfigStatusSimulaCusto,
  type ResultadoSimulacaoSimulaCusto,
  type ValidarNcmSimulaCusto,
  type UfSimulaCusto,
  type OpcaoIcmsSimulaCusto,
  type TaxaOrigemDestinoCadastro,
  type TipoTaxaOrigemDestino,
  type EntradaSimulaCusto,
  type EntradaSimulacaoSimulaCusto,
  type StatusSimulaCusto,
} from './schemas-simula-custo'

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

// ─── Simulas CRUD ─────────────────────────────────────────────────────────

export interface ParametrosListaSimulasCusto {
  busca?: string
  status?: StatusSimulaCusto
  pagina?: number
  limite?: number
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export async function listarSimulasCusto(params: ParametrosListaSimulasCusto = {}): Promise<RespostaListaSimulasCusto> {
  const query = new URLSearchParams()
  if (params.busca) query.set('busca', params.busca)
  if (params.status) query.set('status', params.status)
  if (params.pagina) query.set('pagina', String(params.pagina))
  if (params.limite) query.set('limite', String(params.limite))
  if (params.ordenar_por) query.set('ordenar_por', params.ordenar_por)
  if (params.direcao) query.set('direcao', params.direcao)

  const raw = await requisitar(`/simulas-custo?${query}`)
  return RespostaListaSimulasCustoSchema.parse(raw)
}

export async function obterSimulaCusto(idSimulaCusto: string): Promise<SimulaCustoDetalhe> {
  const raw = await requisitar(`/simulas-custo/${idSimulaCusto}`)
  return RespostaDetalheSimulaCustoSchema.parse(raw).simula_custo
}

export async function criarSimulaCusto(entrada: EntradaSimulaCusto): Promise<SimulaCusto> {
  const raw = await requisitar('/simulas-custo', { method: 'POST', body: JSON.stringify(entrada) })
  return RespostaSimulaCustoSchema.parse(raw).simula_custo
}

export async function atualizarSimulaCusto(
  idSimulaCusto: string,
  entrada: Partial<EntradaSimulaCusto>
): Promise<SimulaCusto> {
  const raw = await requisitar(`/simulas-custo/${idSimulaCusto}`, { method: 'PUT', body: JSON.stringify(entrada) })
  return RespostaSimulaCustoSchema.parse(raw).simula_custo
}

export async function atualizarStatusSimulaCusto(
  idSimulaCusto: string,
  status: StatusSimulaCusto
): Promise<SimulaCusto> {
  const raw = await requisitar(`/simulas-custo/${idSimulaCusto}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_simula_custo: status }),
  })
  return RespostaSimulaCustoSchema.parse(raw).simula_custo
}

export async function duplicarSimulaCusto(idSimulaCusto: string): Promise<SimulaCusto> {
  const raw = await requisitar(`/simulas-custo/${idSimulaCusto}/duplicar`, { method: 'POST' })
  return RespostaSimulaCustoSchema.parse(raw).simula_custo
}

export async function excluirSimulaCusto(idSimulaCusto: string): Promise<void> {
  await requisitar(`/simulas-custo/${idSimulaCusto}`, { method: 'DELETE' })
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export async function obterKpisSimulaCusto(): Promise<KpisSimulaCusto> {
  const raw = await requisitar('/simulas-custo/kpis')
  return KpisSimulaCustoSchema.parse(raw)
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function obterKpisDashboardSimulaCusto(): Promise<KpisDashboardSimulaCusto> {
  const raw = await requisitar('/dashboard/kpis')
  return KpisDashboardSimulaCustoSchema.parse(raw).kpis
}

export async function obterRecentesSimulaCusto(): Promise<SimulaCustoRecente[]> {
  const raw = await requisitar('/dashboard/recentes')
  return RecentesSimulaCustoSchema.parse(raw).recentes
}

export async function listarNcmsRecentesSimulaCusto(): Promise<NcmRecenteServidorSimulaCusto[]> {
  const raw = await requisitar('/dashboard/ncms-recentes')
  return NcmsRecentesSimulaCustoSchema.parse(raw).ncms
}

export async function obterWidgetsDashboardSimulaCusto(
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

export async function obterConfigStatusSimulaCusto(): Promise<ConfigStatusSimulaCusto[]> {
  const raw = await requisitar('/config-status-simula-custo')
  return ConfigStatusSimulaCustoSchema.parse(raw).status_simula_custo
}

// ─── Simulação ────────────────────────────────────────────────────────────────

export async function simularSimulaCusto(
  entrada: EntradaSimulacaoSimulaCusto
): Promise<ResultadoSimulacaoSimulaCusto> {
  const raw = await requisitar('/simular', { method: 'POST', body: JSON.stringify(entrada) })
  return RespostaSimulacaoSimulaCustoSchema.parse(raw)
}

// ─── Master data ──────────────────────────────────────────────────────────────

export async function buscarNcmSimulaCusto(q: string): Promise<Array<{ codigo: string; descricao: string }>> {
  if (q.length < 2) return []
  const raw = await requisitar(`/ncm/buscar?q=${encodeURIComponent(q)}`)
  return BuscaNcmSimulaCustoSchema.parse(raw).itens
}

export async function validarNcmSimulaCusto(codigo: string): Promise<ValidarNcmSimulaCusto> {
  const raw = await requisitar(`/ncm/${encodeURIComponent(codigo)}/validar`)
  return ValidarNcmSimulaCustoSchema.parse(raw)
}

export async function listarUfsSimulaCusto(): Promise<UfSimulaCusto[]> {
  const raw = await requisitar('/unidades-federativas')
  return UfsSimulaCustoSchema.parse(raw)
}

export async function listarOpcoesIcmsSimulaCusto(): Promise<OpcaoIcmsSimulaCusto[]> {
  const raw = await requisitar('/opcoes-icms')
  return OpcoesIcmsSimulaCustoSchema.parse(raw)
}

export async function listarTaxasOrigemDestinoCadastroSimulaCusto(params?: {
  tipo?: TipoTaxaOrigemDestino
  q?: string
  limit?: number
}): Promise<TaxaOrigemDestinoCadastro[]> {
  const search = new URLSearchParams()
  if (params?.tipo) search.set('tipo', params.tipo)
  if (params?.q) search.set('q', params.q)
  if (params?.limit) search.set('limit', String(params.limit))
  const qs = search.toString()
  const raw = await requisitar(`/taxas-origem-destino${qs ? `?${qs}` : ''}`)
  return ListaTaxasOrigemDestinoCadastroSchema.parse(raw).itens
}
