/**
 * useKanbanConfig.tsx — Estado compartilhado de configuração do Kanban
 *
 * Persiste em localStorage. Usado tanto pelo board (Kanban.tsx)
 * quanto pela página de Configurações.
 */

import React, { useState } from 'react'
import {
  User, BuildingOffice, CalendarBlank, CurrencyDollar, Tag,
} from '@phosphor-icons/react'
import type { KanbanColunaDef, CampoRegra } from '@nucleo/kanban-global'
import type { CampoCardDef, KanbanConfigData } from '@nucleo/kanban-global'

// ── Defaults ──────────────────────────────────────────────────────────────────

export const COLUNAS_KANBAN_DEFAULT: KanbanColunaDef[] = [
  { key: 'A Fazer',      label: 'A Fazer',      color: '#6366f1', colapsavel: true },
  { key: 'Em Andamento', label: 'Em Andamento', color: '#f59e0b', colapsavel: true },
  { key: 'Concluída',    label: 'Concluída',    color: '#10b981', colapsavel: true },
  { key: 'Cancelada',    label: 'Cancelada',    color: '#64748b', colapsavel: true },
]

export const CAMPOS_CARD_DEFAULT: CampoCardDef[] = [
  { key: 'empresa',     label: 'Empresa',     descricao: 'Empresa responsável', visivel: true, icone: <BuildingOffice size={14} /> },
  { key: 'data',        label: 'Data',        descricao: 'Prazo do item',       visivel: true, icone: <CalendarBlank  size={14} /> },
  { key: 'responsavel', label: 'Responsável', descricao: 'Pessoa responsável',  visivel: true, icone: <User           size={14} /> },
  { key: 'valor',       label: 'Valor',       descricao: 'Valor financeiro',    visivel: true, icone: <CurrencyDollar size={14} /> },
  { key: 'prioridade',  label: 'Prioridade',  descricao: 'Nível de urgência',   visivel: true, icone: <Tag            size={14} /> },
]

export const CAMPOS_REGRA_DEFAULT: CampoRegra[] = [
  {
    key: 'prioridade', label: 'Prioridade', tipo: 'selecao', opcoes: [
      { value: 'urgente', label: 'Urgente' },
      { value: 'alta',    label: 'Alta'    },
      { value: 'media',   label: 'Média'   },
      { value: 'baixa',   label: 'Baixa'   },
    ],
  },
  { key: 'valor', label: 'Valor', tipo: 'numero' },
  { key: 'data',  label: 'Data',  tipo: 'data'   },
]

const STORAGE_KEY = 'demo:kanban-config'

const CONFIG_DEFAULT: KanbanConfigData = {
  colunas:    COLUNAS_KANBAN_DEFAULT,
  camposCard: CAMPOS_CARD_DEFAULT,
  regras:     [],
}

// Ícones para restaurar após deserialização
const ICONE_MAP: Record<string, React.ReactNode> = {
  empresa:     <BuildingOffice size={14} />,
  data:        <CalendarBlank  size={14} />,
  responsavel: <User           size={14} />,
  valor:       <CurrencyDollar size={14} />,
  prioridade:  <Tag            size={14} />,
}

function carregarDoStorage(): KanbanConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return CONFIG_DEFAULT
    const parsed = JSON.parse(raw) as KanbanConfigData
    // Reanexa ícones (ReactNode não é serializável)
    const camposComIcones = parsed.camposCard.map((c: CampoCardDef) => ({
      ...c,
      icone: ICONE_MAP[c.key],
    }))
    return { ...parsed, camposCard: camposComIcones }
  } catch {
    return CONFIG_DEFAULT
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useKanbanConfig() {
  const [config, setConfig] = useState<KanbanConfigData>(carregarDoStorage)

  function salvar(data: KanbanConfigData) {
    // Salva sem ícones (ReactNode não é serializável)
    const serializavel: KanbanConfigData = {
      ...data,
      camposCard: data.camposCard.map(({ icone: _icone, ...rest }: CampoCardDef) => rest),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializavel))

    // Mantém ícones no estado
    const camposComIcones = data.camposCard.map((c: CampoCardDef) => ({
      ...c,
      icone: ICONE_MAP[c.key] ?? c.icone,
    }))
    setConfig({ ...data, camposCard: camposComIcones })
  }

  function resetar() {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(CONFIG_DEFAULT)
  }

  return { config, salvar, resetar }
}
