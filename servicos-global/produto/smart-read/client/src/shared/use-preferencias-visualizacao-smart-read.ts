/**
 * use-preferencias-visualizacao-smart-read.ts — preferências de visualização
 * (localStorage) das abas Visão Geral, Tabelas e Colunas da Configurações.
 *
 * Fonte única para:
 *  • Configurações › Visão Geral → gráficos ocultos no painel Insights
 *  • Configurações › Tabelas     → linhas por página + densidade da lista
 *  • Configurações › Colunas     → colunas personalizadas da lista
 *
 * Consumidores: InsightsSmartRead (gráficos) e TabelaTransacoesLeituraSmartRead
 * / useTransacoesLeituraSmartRead (linhas, densidade, colunas). Mesmo padrão
 * de sync do use-preferencias-cards-smart-read (CustomEvent + storage).
 */

import { useCallback, useEffect, useState } from 'react'

// ─── Catálogo de gráficos do Insights (ids = painéis reais da tela) ───────────
export type GraficoInsightsDefinicaoSmartRead = {
  id: string
  titulo: string
  descricao: string
}

export const GRAFICOS_CATALOGO_INSIGHTS_SMART_READ: GraficoInsightsDefinicaoSmartRead[] = [
  {
    id: 'evolucao_diaria',
    titulo: 'Evolução diária',
    descricao: 'Série temporal de campos extraídos por dia',
  },
  {
    id: 'campos_acertos',
    titulo: 'Campos lidos — corretos × errados',
    descricao: 'Proporção de campos corretos e errados',
  },
  {
    id: 'tipos_documento',
    titulo: 'Tipos de documento',
    descricao: 'Distribuição das leituras por tipo de documento',
  },
  {
    id: 'economia_estimada',
    titulo: 'Economia estimada',
    descricao: 'Saving detalhado de digitação e erros evitados',
  },
  {
    id: 'rankings_fornecedor',
    titulo: 'Resultado por tipo de fornecedor',
    descricao: 'Rankings de maiores acertos e erros por participante',
  },
]

const IDS_GRAFICOS_VALIDOS = new Set(GRAFICOS_CATALOGO_INSIGHTS_SMART_READ.map((g) => g.id))

// ─── Tabelas ───────────────────────────────────────────────────────────────────
/** Opções expostas na Configurações — teto 100 (limite máximo aceito pela API). */
export const LINHAS_PAGINA_OPCOES_SMART_READ = [10, 25, 50, 100] as const
export type LinhasPaginaSmartRead = (typeof LINHAS_PAGINA_OPCOES_SMART_READ)[number]

export type DensidadeTabelaSmartRead = 'confortavel' | 'compacto'

// ─── Colunas personalizadas ────────────────────────────────────────────────────
export type ColunaPersonalizadaSmartRead = {
  id: string
  nome: string
  visible: boolean
}

/** Prefixo das keys na tabela — evita colisão com colunas nativas/catálogo. */
export const PREFIXO_COLUNA_PERSONALIZADA_SMART_READ = 'custom:'

export function chaveColunaPersonalizadaSmartRead(coluna: ColunaPersonalizadaSmartRead): string {
  return `${PREFIXO_COLUNA_PERSONALIZADA_SMART_READ}${coluna.id}`
}

export function gerarIdColunaPersonalizadaSmartRead(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── Preferências agregadas ────────────────────────────────────────────────────
export type PreferenciasVisualizacaoSmartRead = {
  graficos_ocultos: string[]
  linhas_pagina: LinhasPaginaSmartRead
  densidade: DensidadeTabelaSmartRead
  colunas_personalizadas: ColunaPersonalizadaSmartRead[]
}

export const PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ: PreferenciasVisualizacaoSmartRead = {
  graficos_ocultos: [],
  linhas_pagina: 50,
  densidade: 'confortavel',
  colunas_personalizadas: [],
}

const STORAGE_KEY = 'smart-read:config:visualizacao-v1'
export const SYNC_EVENT_VISUALIZACAO_SMART_READ = 'smart-read:visualizacao-updated'

function normalizarGraficosOcultos(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor.filter((id): id is string => typeof id === 'string' && IDS_GRAFICOS_VALIDOS.has(id))
}

function normalizarLinhasPagina(valor: unknown): LinhasPaginaSmartRead {
  const numero = Number(valor)
  return (LINHAS_PAGINA_OPCOES_SMART_READ as readonly number[]).includes(numero)
    ? (numero as LinhasPaginaSmartRead)
    : PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ.linhas_pagina
}

function normalizarDensidade(valor: unknown): DensidadeTabelaSmartRead {
  return valor === 'compacto' ? 'compacto' : 'confortavel'
}

function normalizarColunasPersonalizadas(valor: unknown): ColunaPersonalizadaSmartRead[] {
  if (!Array.isArray(valor)) return []
  const vistas = new Set<string>()
  const saida: ColunaPersonalizadaSmartRead[] = []
  for (const item of valor) {
    if (!item || typeof item !== 'object') continue
    const { id, nome, visible } = item as Partial<ColunaPersonalizadaSmartRead>
    if (typeof id !== 'string' || !id || vistas.has(id)) continue
    vistas.add(id)
    saida.push({
      id,
      nome: typeof nome === 'string' && nome.trim() ? nome.trim().slice(0, 50) : 'Nova coluna',
      visible: typeof visible === 'boolean' ? visible : true,
    })
  }
  return saida
}

export function normalizarPreferenciasVisualizacaoSmartRead(
  valor: unknown,
): PreferenciasVisualizacaoSmartRead {
  if (!valor || typeof valor !== 'object') return PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ
  const obj = valor as Partial<Record<keyof PreferenciasVisualizacaoSmartRead, unknown>>
  return {
    graficos_ocultos: normalizarGraficosOcultos(obj.graficos_ocultos),
    linhas_pagina: normalizarLinhasPagina(obj.linhas_pagina),
    densidade: normalizarDensidade(obj.densidade),
    colunas_personalizadas: normalizarColunasPersonalizadas(obj.colunas_personalizadas),
  }
}

export function carregarPreferenciasVisualizacaoSmartRead(): PreferenciasVisualizacaoSmartRead {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ
    return normalizarPreferenciasVisualizacaoSmartRead(JSON.parse(raw) as unknown)
  } catch {
    return PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ
  }
}

export function salvarPreferenciasVisualizacaoSmartRead(
  next: PreferenciasVisualizacaoSmartRead,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizarPreferenciasVisualizacaoSmartRead(next)),
  )
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_VISUALIZACAO_SMART_READ))
}

export function usePreferenciasVisualizacaoSmartRead() {
  const [prefs, setPrefs] = useState(carregarPreferenciasVisualizacaoSmartRead)

  useEffect(() => {
    function sync() {
      setPrefs(carregarPreferenciasVisualizacaoSmartRead())
    }
    window.addEventListener(SYNC_EVENT_VISUALIZACAO_SMART_READ, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_VISUALIZACAO_SMART_READ, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  /** Persiste um subconjunto (aba) sem tocar nas preferências das demais abas. */
  const persistirParcial = useCallback(
    (parcial: Partial<PreferenciasVisualizacaoSmartRead>) => {
      salvarPreferenciasVisualizacaoSmartRead({
        ...carregarPreferenciasVisualizacaoSmartRead(),
        ...parcial,
      })
      setPrefs(carregarPreferenciasVisualizacaoSmartRead())
    },
    [],
  )

  return { prefs, persistirParcial }
}
