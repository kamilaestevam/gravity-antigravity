/**
 * persistencia-configuracoes-smart-read.ts
 *
 * Preferências da tela Configurações (cards, tabela, colunas personalizadas).
 * localStorage até existir API de preferências por workspace (Onda 3).
 */

import type {
  ColunaPersonalizadaSmartRead,
  TipoColunaSmartReadArmazenado,
} from '../components/ModalNovaColunaSmartRead'
import {
  normalizarVisibilidadeColunaSmartRead,
} from './filtro-visibilidade-colunas-personalizadas-smart-read'
import {
  CARDS_PADRAO_KPI_SMART_READ,
  normalizarPreferenciasCardsKpi,
  type CardPreferenciaKpiSmartRead,
} from './catalogo-cards-kpi-smart-read'

export type CardPreferenciaConfigSmartRead = CardPreferenciaKpiSmartRead

export type TabelaConfigSmartRead = {
  linhasPagina: string
  densidade: string
}

export type SnapshotConfiguracoesSmartRead = {
  versao: 1
  periodo: string
  cards: CardPreferenciaConfigSmartRead[]
  tabela: TabelaConfigSmartRead
  colunas: ColunaPersonalizadaSmartRead[]
  seqColuna: number
}

export const STORAGE_KEY_CONFIGURACOES_SMART_READ = 'smart-read:configuracoes-v1'
export const SYNC_EVENT_CONFIGURACOES_SMART_READ = 'smart-read:configuracoes-updated'

export const PERIODO_PADRAO_CONFIG_SMART_READ = '30d'

export const TABELA_PADRAO_CONFIG_SMART_READ: TabelaConfigSmartRead = {
  linhasPagina: '25',
  densidade: 'confortavel',
}

export const CARDS_PADRAO_CONFIG_SMART_READ: CardPreferenciaConfigSmartRead[] =
  CARDS_PADRAO_KPI_SMART_READ.map((c) => ({ ...c }))

const TIPOS_COLUNA_VALIDOS = new Set<TipoColunaSmartReadArmazenado>([
  'texto',
  'numero',
  'data',
  'percentual',
  'select',
  'checkbox',
  'tipo_documento',
  'formula',
])

const PERIODOS_VALIDOS = new Set(['7d', '30d', '6m', '1a', 'tudo'])
const LINHAS_VALIDAS = new Set(['10', '25', '50', '100'])
const DENSIDADES_VALIDAS = new Set(['compacto', 'confortavel'])

function normalizarCards(raw: unknown): CardPreferenciaConfigSmartRead[] {
  return normalizarPreferenciasCardsKpi(raw, CARDS_PADRAO_CONFIG_SMART_READ)
}

function normalizarTabela(raw: unknown): TabelaConfigSmartRead {
  if (typeof raw !== 'object' || raw == null) return { ...TABELA_PADRAO_CONFIG_SMART_READ }
  const t = raw as Partial<TabelaConfigSmartRead>
  return {
    linhasPagina: LINHAS_VALIDAS.has(String(t.linhasPagina))
      ? String(t.linhasPagina)
      : TABELA_PADRAO_CONFIG_SMART_READ.linhasPagina,
    densidade: DENSIDADES_VALIDAS.has(String(t.densidade))
      ? String(t.densidade)
      : TABELA_PADRAO_CONFIG_SMART_READ.densidade,
  }
}

function normalizarColunas(raw: unknown): ColunaPersonalizadaSmartRead[] {
  if (!Array.isArray(raw)) return []
  const normalizadas: ColunaPersonalizadaSmartRead[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item == null) continue
    const col = item as Partial<ColunaPersonalizadaSmartRead>
    if (typeof col.id !== 'string' || typeof col.nome !== 'string') continue
    const tipoRaw = col.tipo
    const tipo = typeof tipoRaw === 'string' && TIPOS_COLUNA_VALIDOS.has(tipoRaw as TipoColunaSmartReadArmazenado)
      ? (tipoRaw as TipoColunaSmartReadArmazenado)
      : 'texto'
    const visibilidade = normalizarVisibilidadeColunaSmartRead(col.visibilidade)
    const rolesPermitidas = Array.isArray(col.roles_permitidas)
      ? col.roles_permitidas.filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
      : undefined
    const opcoes = Array.isArray(col.opcoes)
      ? col.opcoes.filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
      : undefined
    normalizadas.push({
      id: col.id,
      nome: col.nome,
      tipo,
      visible: typeof col.visible === 'boolean' ? col.visible : true,
      visibilidade,
      ...(visibilidade === 'roles' && rolesPermitidas?.length
        ? { roles_permitidas: rolesPermitidas }
        : {}),
      ...(typeof col.obrigatorio === 'boolean' ? { obrigatorio: col.obrigatorio } : {}),
      ...(typeof col.id_usuario_criador === 'string' && col.id_usuario_criador.trim()
        ? { id_usuario_criador: col.id_usuario_criador.trim() }
        : {}),
      ...((tipo === 'select' || tipo === 'tipo_documento') && opcoes?.length
        ? { opcoes }
        : {}),
      ...(typeof col.descricao === 'string' && col.descricao.trim()
        ? { descricao: col.descricao.trim() }
        : {}),
    })
  }
  return normalizadas
}

export function snapshotPadraoConfiguracoesSmartRead(): SnapshotConfiguracoesSmartRead {
  return {
    versao: 1,
    periodo: PERIODO_PADRAO_CONFIG_SMART_READ,
    cards: CARDS_PADRAO_CONFIG_SMART_READ.map((c) => ({ ...c })),
    tabela: { ...TABELA_PADRAO_CONFIG_SMART_READ },
    colunas: [],
    seqColuna: 1,
  }
}

export function carregarConfiguracoesSmartRead(): SnapshotConfiguracoesSmartRead {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIGURACOES_SMART_READ)
    if (!raw) return snapshotPadraoConfiguracoesSmartRead()
    const parsed = JSON.parse(raw) as Partial<SnapshotConfiguracoesSmartRead>
    const colunas = normalizarColunas(parsed.colunas)
    const maxSeq = colunas.reduce((max, col) => {
      const match = /^custom-(\d+)$/.exec(col.id)
      if (!match) return max
      return Math.max(max, Number(match[1]) + 1)
    }, 1)
    const seqColuna = typeof parsed.seqColuna === 'number' && parsed.seqColuna >= maxSeq
      ? parsed.seqColuna
      : maxSeq
    const periodo = typeof parsed.periodo === 'string' && PERIODOS_VALIDOS.has(parsed.periodo)
      ? parsed.periodo
      : PERIODO_PADRAO_CONFIG_SMART_READ
    return {
      versao: 1,
      periodo,
      cards: normalizarCards(parsed.cards),
      tabela: normalizarTabela(parsed.tabela),
      colunas,
      seqColuna,
    }
  } catch {
    return snapshotPadraoConfiguracoesSmartRead()
  }
}

export function salvarConfiguracoesSmartRead(snapshot: SnapshotConfiguracoesSmartRead): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIGURACOES_SMART_READ, JSON.stringify(snapshot))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_CONFIGURACOES_SMART_READ))
  } catch {
    /* quota / modo privado */
  }
}

export function montarSnapshotConfiguracoesSmartRead(params: {
  periodo: string
  cards: CardPreferenciaConfigSmartRead[]
  cardsSalvos?: CardPreferenciaConfigSmartRead[]
  tabela: TabelaConfigSmartRead
  tabelaSalva?: TabelaConfigSmartRead
  colunas: ColunaPersonalizadaSmartRead[]
  seqColuna: number
}): SnapshotConfiguracoesSmartRead {
  return {
    versao: 1,
    periodo: params.periodo,
    cards: params.cards.map((c) => ({ ...c })),
    tabela: { ...params.tabela },
    colunas: params.colunas.map((c) => ({ ...c })),
    seqColuna: params.seqColuna,
  }
}
