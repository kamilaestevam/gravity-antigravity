/**
 * Kanban.tsx — Demo do KanbanGlobal + CardKanbanModal
 *
 * Demonstra: colunas configuráveis, drag & drop entre colunas,
 * ordenação por coluna, filtro por busca e card customizável.
 * Ao clicar num card abre o CardKanbanModal (padrão de referência).
 * Dados 100% mock — sem API.
 */

import React, { useMemo, useState } from 'react'
import { KanbanGlobal, CardKanbanModal } from '@nucleo/kanban-global'
import type { KanbanItem, CardKanbanItem } from '@nucleo/kanban-global'
import { useKanbanConfig } from '../shared/useKanbanConfig'
import {
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
import './Kanban.css'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'

interface ItemKanbanDemo extends KanbanItem, CardKanbanItem {
  prioridade: Prioridade
}

// ── Ícones fixos por chave de coluna ─────────────────────────────────────────

const COLUNA_ICONES: Record<string, React.ReactNode> = {
  'A Fazer':      <ListChecks  size={16} weight="duotone" />,
  'Em Andamento': <Spinner     size={16} weight="duotone" />,
  'Concluída':    <CheckCircle size={16} weight="duotone" />,
  'Cancelada':    <XCircle     size={16} weight="duotone" />,
}

// ── Paleta de prioridades ─────────────────────────────────────────────────────

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

// ── Mock de dados ─────────────────────────────────────────────────────────────

const EMPRESAS     = ['Alpha Corp', 'Beta Ltda', 'Gamma S/A', 'Delta ME', 'Comex Global']
const RESPONSAVEIS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira']
const PRIORIDADES: Prioridade[] = ['urgente', 'alta', 'media', 'baixa']

function gerarData(diasOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + diasOffset)
  return d.toISOString()
}

const COLUNAS_KEYS_DEFAULT = ['A Fazer', 'Em Andamento', 'Concluída', 'Cancelada']

function gerarMock(): ItemKanbanDemo[] {
  const nomes = [
    'Revisão de contrato', 'Proposta comercial', 'Análise fiscal', 'Relatório mensal',
    'Auditoria interna', 'Planejamento Q2', 'Entrega urgente', 'Reunião com cliente',
    'Aprovação de orçamento', 'Importação documentos', 'Validação NF', 'Cálculo ICMS',
    'Levantamento de custo', 'Declaração SISCOMEX', 'Conferência de carga',
    'Atualização tarifária', 'Processo de habilitação', 'Despacho aduaneiro',
    'Classificação NCM', 'Licença de importação',
  ]

  return nomes.map((nome, i) => ({
    id:          `item-${i + 1}`,
    colunaKey:   COLUNAS_KEYS_DEFAULT[i % COLUNAS_KEYS_DEFAULT.length],
    nome,
    empresa:     EMPRESAS[i % EMPRESAS.length],
    responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
    valor:       Math.round((1000 + i * 750 + (i % 3) * 300) * 100) / 100,
    data:        gerarData(i % 7 === 0 ? -2 : i % 4 === 0 ? 0 : i + 1),
    prioridade:  PRIORIDADES[i % PRIORIDADES.length],
  }))
}

const MOCK_INICIAL = gerarMock()

// ── Card ──────────────────────────────────────────────────────────────────────

function KanbanCard({ item }: { item: ItemKanbanDemo }) {
  const pc     = PRIORIDADE_COR[item.prioridade]
  const pLabel = PRIORIDADE_LABEL[item.prioridade]

  const data      = new Date(item.data)
  const hoje      = new Date()
  hoje.setHours(0, 0, 0, 0)
  data.setHours(0, 0, 0, 0)
  const atrasado  = data < hoje && item.colunaKey !== 'Concluída' && item.colunaKey !== 'Cancelada'
  const dataLabel = data.toLocaleDateString('pt-BR')
  const valorLabel = item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="kb-card" style={{ borderLeft: `3px solid ${pc}` }}>
      <span className="kb-card-prioridade" style={{ background: pc + '20', color: pc, border: `1px solid ${pc}44` }}>
        {pLabel}
      </span>
      <div className="kb-card-empresa">
        <BuildingOffice size={12} />{item.empresa}
      </div>
      <div className="kb-card-nome">{item.nome}</div>
      <div className="kb-card-data" style={{ color: atrasado ? '#ef4444' : undefined }}>
        <CalendarBlank size={12} />
        {dataLabel}
        {atrasado && <span className="kb-card-atrasado">· atrasado!</span>}
      </div>
      <div className="kb-card-rodape">
        <span className="kb-card-responsavel"><User size={11} />{item.responsavel}</span>
        <span className="kb-card-valor"><CurrencyDollar size={11} />{valorLabel}</span>
      </div>
      <div className="kb-card-hint"><ArrowRight size={10} /> ver detalhes</div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function Kanban() {
  const { config } = useKanbanConfig()
  const [itens, setItens]                     = useState<ItemKanbanDemo[]>(MOCK_INICIAL)
  const [busca, setBusca]                     = useState('')
  const [itemSelecionado, setItemSelecionado] = useState<ItemKanbanDemo | null>(null)

  const colunas = useMemo(
    () => config.colunas.map(col => ({ ...col, icon: COLUNA_ICONES[col.key] })),
    [config.colunas],
  )

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(item =>
      [item.nome, item.empresa, item.responsavel, item.prioridade, item.colunaKey]
        .join(' ').toLowerCase().includes(q),
    )
  }, [itens, busca])

  function handleMoverItem(itemId: string, novaColunaKey: string) {
    setItens(prev => prev.map(item => item.id === itemId ? { ...item, colunaKey: novaColunaKey } : item))
  }

  function handleSalvar(atualizado: CardKanbanItem) {
    setItens(prev => prev.map(item =>
      item.id === atualizado.id ? { ...item, ...atualizado } as ItemKanbanDemo : item,
    ))
    setItemSelecionado(null)
  }

  function handleExcluir(item: ItemKanbanDemo) {
    setItens(prev => prev.filter(i => i.id !== item.id))
    setItemSelecionado(null)
  }

  return (
    <div className="kb-page">

      {/* Toolbar */}
      <div className="kb-toolbar">
        <div className="kb-search-wrap">
          <MagnifyingGlass size={15} className="kb-search-icon" />
          <input
            type="text"
            className="kb-search"
            placeholder="Buscar por nome, empresa, responsável…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <span className="kb-total">
          {itensFiltrados.length} item{itensFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Kanban */}
      <div className="kb-board">
        <KanbanGlobal<ItemKanbanDemo>
          colunas={colunas}
          itens={itensFiltrados}
          renderCard={(item) => <KanbanCard item={item} />}
          onMoverItem={handleMoverItem}
          onCardClick={(item) => setItemSelecionado(item)}
          emptyLabel="Nenhum item nesta fase"
          getItemLabel={(item) => item.nome}
          getItemDate={(item) => item.data}
        />
      </div>

      {/* Modal de detalhe */}
      <CardKanbanModal<ItemKanbanDemo>
        aberto={itemSelecionado !== null}
        item={itemSelecionado}
        colunas={colunas}
        onFechar={() => setItemSelecionado(null)}
        onSalvar={handleSalvar}
        onExcluir={handleExcluir}
        responsaveis={RESPONSAVEIS}
      />

    </div>
  )
}
