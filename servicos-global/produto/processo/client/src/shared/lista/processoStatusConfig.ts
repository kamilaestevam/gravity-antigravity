/**
 * processoStatusConfig.ts — Status do processo (localStorage + abas da lista).
 * Paridade com pedido:status_config — lido pela lista e gravado em Configurações.
 */
import type { TFunction } from 'i18next'
import type { GTAbaTipo } from '@nucleo/tabela-virtual-global'
import type { StatusConfig } from '../../pages/configuracoes/status/validacao'

export const PROCESSO_STATUS_STORAGE_KEY = 'processo:status_config'
export const PROCESSO_STATUS_REGRAS_KEY = 'processo:status_regras_config'

export interface StatusConfigResumo {
  label: string
  cor: string
  ordem: number
}

let _seq = 0
const novoId = () => `r${Date.now()}-${++_seq}`

export const STATUS_INICIAIS_PROCESSO: StatusConfig[] = [
  {
    id: 's1', nome: 'Rascunho', cor: '#94a3b8', ordem: 1, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'numero_processo', condicao: 'vazio' },
    ],
  },
  {
    id: 's2', nome: 'Aberto', cor: '#60a5fa', ordem: 2, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'numero_processo', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'data_embarque', condicao: 'vazio' },
    ],
  },
  {
    id: 's3', nome: 'Em Embarque', cor: '#a78bfa', ordem: 3, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'data_embarque', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'data_chegada', condicao: 'vazio' },
    ],
  },
  {
    id: 's4', nome: 'Em Desembaraço', cor: '#fbbf24', ordem: 4, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'data_chegada', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'di_numero', condicao: 'vazio' },
    ],
  },
  {
    id: 's5', nome: 'Concluído', cor: '#34d399', ordem: 5, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'di_numero', condicao: 'preenchido' },
    ],
  },
]

export function statusConfigParaMapa(statuses: StatusConfig[]): Record<string, StatusConfigResumo> {
  const map: Record<string, StatusConfigResumo> = {}
  for (const s of statuses) {
    map[s.id] = { label: s.nome, cor: s.cor, ordem: s.ordem }
  }
  return map
}

export function lerStatusConfigProcesso(): Record<string, StatusConfigResumo> {
  try {
    const raw = localStorage.getItem(PROCESSO_STATUS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, StatusConfigResumo>
      if (Object.keys(parsed).length > 0) return parsed
    }
  } catch { /* fallback */ }
  return statusConfigParaMapa(STATUS_INICIAIS_PROCESSO)
}

export function carregarStatusProcessoCompleto(): StatusConfig[] {
  try {
    const raw = localStorage.getItem(PROCESSO_STATUS_REGRAS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StatusConfig[]
      if (parsed.length > 0) return parsed
    }
  } catch { /* fallback */ }
  return STATUS_INICIAIS_PROCESSO.map(s => ({
    ...s,
    regras: s.regras.map(r => ({ ...r })),
  }))
}

export function persistirStatusProcesso(statuses: StatusConfig[]): void {
  try {
    localStorage.setItem(PROCESSO_STATUS_STORAGE_KEY, JSON.stringify(statusConfigParaMapa(statuses)))
    localStorage.setItem(PROCESSO_STATUS_REGRAS_KEY, JSON.stringify(statuses))
  } catch { /* ignore quota */ }
}

export function lerAbasStatusProcesso(t: TFunction): GTAbaTipo[] {
  const config = lerStatusConfigProcesso()
  const entries = Object.entries(config).sort((a, b) => a[1].ordem - b[1].ordem)
  return [
    { valor: 'todos', label: t('pedido.status.todos', { defaultValue: 'Todos' }) },
    ...entries.map(([id, cfg]) => ({
      valor: id,
      label: cfg.label,
      cor: cfg.cor,
    })),
  ]
}

export function resolverRotuloStatusProcesso(codigo: string): { label: string; cor: string } {
  const cfg = lerStatusConfigProcesso()[codigo]
  if (cfg) return { label: cfg.label, cor: cfg.cor }
  return { label: codigo, cor: '#94a3b8' }
}
