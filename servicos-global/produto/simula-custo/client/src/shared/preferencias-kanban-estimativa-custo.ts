/**
 * preferencias-kanban-estimativa-custo.ts — Preferências locais do Kanban.
 * Ordem e visibilidade das colunas por usuário (localStorage — sem backend,
 * os status são fixos no enum StatusEstimativaCusto do banco).
 */
import { useCallback, useState } from 'react'
import type { StatusEstimativaCusto } from './schemas-estimativa-custo'

const CHAVE_PREFS_KANBAN = 'simula-custo-kanban-prefs'

export interface PreferenciasKanbanEstimativaCusto {
  ordem_colunas: StatusEstimativaCusto[]
  colunas_ocultas: StatusEstimativaCusto[]
}

const PREFS_PADRAO: PreferenciasKanbanEstimativaCusto = {
  ordem_colunas: ['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'],
  colunas_ocultas: [],
}

function carregarPrefs(): PreferenciasKanbanEstimativaCusto {
  try {
    const raw = localStorage.getItem(CHAVE_PREFS_KANBAN)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PreferenciasKanbanEstimativaCusto>
      return {
        ordem_colunas: parsed.ordem_colunas?.length ? parsed.ordem_colunas : PREFS_PADRAO.ordem_colunas,
        colunas_ocultas: parsed.colunas_ocultas ?? [],
      }
    }
  } catch { /* prefs corrompidas — usa padrão */ }
  return PREFS_PADRAO
}

export function usePreferenciasKanbanEstimativaCusto() {
  const [prefs, setPrefs] = useState<PreferenciasKanbanEstimativaCusto>(carregarPrefs)

  const salvar = useCallback((novas: PreferenciasKanbanEstimativaCusto) => {
    setPrefs(novas)
    try { localStorage.setItem(CHAVE_PREFS_KANBAN, JSON.stringify(novas)) } catch { /* quota */ }
  }, [])

  const alternarColuna = useCallback((status: StatusEstimativaCusto) => {
    setPrefs(prev => {
      const ocultas = prev.colunas_ocultas.includes(status)
        ? prev.colunas_ocultas.filter(s => s !== status)
        : [...prev.colunas_ocultas, status]
      const novas = { ...prev, colunas_ocultas: ocultas }
      try { localStorage.setItem(CHAVE_PREFS_KANBAN, JSON.stringify(novas)) } catch { /* quota */ }
      return novas
    })
  }, [])

  return { prefs, salvar, alternarColuna }
}
