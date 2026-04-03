import React, { useMemo, useState } from 'react'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanItem, KanbanColunaDef } from '@nucleo/kanban-global'
import {
  Kanban,
  ListChecks,
  Spinner,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  BuildingOffice,
  CalendarBlank,
  User,
  CurrencyDollar,
  ArrowRight,
} from '@phosphor-icons/react'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'

interface ItemDemo extends KanbanItem {
  nome:        string
  empresa:     string
  responsavel: string
  valor:       number
  data:        string
  prioridade:  Prioridade
}

// ── Colunas ───────────────────────────────────────────────────────────────────

const COLUNAS: KanbanColunaDef[] = [
  { key: 'A Fazer',      label: 'A Fazer',      color: '#6366f1', icon: <ListChecks  size={16} weight="duotone" color="#6366f1" /> },
  { key: 'Em Andamento', label: 'Em Andamento', color: '#f59e0b', icon: <Spinner     size={16} weight="duotone" color="#f59e0b" /> },
  { key: 'Concluída',    label: 'Concluída',    color: '#10b981', icon: <CheckCircle size={16} weight="duotone" color="#10b981" /> },
  { key: 'Cancelada',    label: 'Cancelada',    color: '#64748b', icon: <XCircle     size={16} weight="duotone" color="#64748b" /> },
]

// ── Prioridades ───────────────────────────────────────────────────────────────

const PRIORIDADE_COR: Record<Prioridade, string> = {
  urgente: '#ef4444',
  alta:    '#f97316',
  media:   '#f59e0b',
  baixa:   '#64748b',
}

const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  urgente: 'Urgente',
  alta:    'Alta',
  media:   'Média',
  baixa:   'Baixa',
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const EMPRESAS:     string[]     = ['Alpha Corp', 'Beta Ltda', 'Gamma S/A', 'Delta ME', 'Comex Global']
const RESPONSAVEIS: string[]     = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira']
const PRIORIDADES:  Prioridade[] = ['urgente', 'alta', 'media', 'baixa']

function gerarData(diasOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + diasOffset)
  return d.toISOString()
}

const NOMES = [
  'Revisão de contrato', 'Proposta comercial', 'Análise fiscal', 'Relatório mensal',
  'Auditoria interna', 'Planejamento Q2', 'Entrega urgente', 'Reunião com cliente',
  'Aprovação de orçamento', 'Importação documentos', 'Validação NF', 'Cálculo ICMS',
  'Levantamento de custo', 'Declaração SISCOMEX', 'Conferência de carga',
  'Atualização tarifária', 'Processo de habilitação', 'Despacho aduaneiro',
  'Classificação NCM', 'Licença de importação',
]

const MOCK_INICIAL: ItemDemo[] = NOMES.map((nome, i) => ({
  id:          `item-${i + 1}`,
  colunaKey:   COLUNAS[i % COLUNAS.length].key,
  nome,
  empresa:     EMPRESAS[i % EMPRESAS.length],
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
  valor:       Math.round((1000 + i * 750 + (i % 3) * 300) * 100) / 100,
  data:        gerarData(i % 7 === 0 ? -2 : i % 4 === 0 ? 0 : i + 1),
  prioridade:  PRIORIDADES[i % PRIORIDADES.length],
}))

// ── Card ──────────────────────────────────────────────────────────────────────

function DemoCard({ item }: { item: ItemDemo }) {
  const pc     = PRIORIDADE_COR[item.prioridade]
  const pLabel = PRIORIDADE_LABEL[item.prioridade]

  const data  = new Date(item.data)
  const hoje  = new Date()
  hoje.setHours(0, 0, 0, 0)
  data.setHours(0, 0, 0, 0)
  const atrasado = (
    data < hoje &&
    item.colunaKey !== 'Concluída' &&
    item.colunaKey !== 'Cancelada'
  )

  return (
    <div className="kb-card" style={{ borderLeft: `3px solid ${pc}` }}>
      <span
        className="kb-card-prioridade"
        style={{ background: pc + '20', color: pc, border: `1px solid ${pc}44` }}
      >
        {pLabel}
      </span>

      <div className="kb-card-empresa">
        <BuildingOffice size={12} />
        {item.empresa}
      </div>

      <div className="kb-card-nome">{item.nome}</div>

      <div className="kb-card-data" style={{ color: atrasado ? '#ef4444' : undefined }}>
        <CalendarBlank size={12} />
        {data.toLocaleDateString('pt-BR')}
        {atrasado && <span className="kb-card-atrasado">· atrasado!</span>}
      </div>

      <div className="kb-card-rodape">
        <span className="kb-card-responsavel">
          <User size={11} />
          {item.responsavel}
        </span>
        <span className="kb-card-valor">
          <CurrencyDollar size={11} />
          {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <div className="kb-card-hint">
        <ArrowRight size={10} />
        ver detalhes
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [itens, setItens] = useState<ItemDemo[]>(MOCK_INICIAL)
  const [busca, setBusca] = useState('')

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(item =>
      [item.nome, item.empresa, item.responsavel, item.prioridade, item.colunaKey]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [itens, busca])

  function handleMoverItem(itemId: string, novaColunaKey: string) {
    setItens(prev =>
      prev.map(item => item.id === itemId ? { ...item, colunaKey: novaColunaKey } : item),
    )
  }

  return (
    <div className="demo-shell">

      {/* Header */}
      <div className="demo-header">
        <div className="demo-header-title">
          <Kanban size={18} weight="duotone" color="#818cf8" />
          KanbanGlobal
        </div>
        <span className="demo-header-badge">@nucleo/kanban-global</span>
      </div>

      <div className="demo-content">

        {/* Toolbar */}
        <div className="demo-toolbar">
          <div className="demo-search-wrap">
            <MagnifyingGlass size={15} className="demo-search-icon" />
            <input
              type="text"
              className="demo-search"
              placeholder="Buscar por nome, empresa, responsável…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <span className="demo-total">
            {itensFiltrados.length} item{itensFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Board */}
        <div className="demo-board">
          <KanbanGlobal<ItemDemo>
            colunas={COLUNAS}
            itens={itensFiltrados}
            renderCard={(item) => <DemoCard item={item} />}
            onMoverItem={handleMoverItem}
            emptyLabel="Nenhum item nesta fase"
            getItemLabel={(item) => item.nome}
            getItemDate={(item) => item.data}
          />
        </div>

      </div>
    </div>
  )
}
