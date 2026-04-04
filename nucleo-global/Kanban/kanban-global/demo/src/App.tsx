import React, { useMemo, useState } from 'react'
import { KanbanGlobal, KanbanConfiguracoes, avaliarRegras } from '@nucleo/kanban-global'
import type {
  KanbanItem,
  KanbanColunaDef,
  CampoCardDef,
  KanbanConfigData,
  CampoRegra,
  RegraKanban,
} from '@nucleo/kanban-global'
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
  Plus,
  CircleNotch,
  Gear,
} from '@phosphor-icons/react'
import { CardKanbanModal } from './CardKanbanModal'
import type { CardKanbanItem } from './CardKanbanModal'
import { ToastDemo, useToast } from './ToastDemo'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'
type Vista = 'board' | 'configuracoes'

interface ItemDemo extends KanbanItem {
  nome:           string
  empresa:        string
  responsavel:    string
  valor:          number
  data:           string
  prioridade:     Prioridade
  descricao?:     string
  tipoAtividade?: string
  proximoPasso?:  string
}

// ── Colunas padrão ────────────────────────────────────────────────────────────

const COLUNAS_PADRAO: KanbanColunaDef[] = [
  {
    key: 'A Fazer', label: 'A Fazer', color: '#6366f1',
    icon: <ListChecks size={16} weight="duotone" color="#6366f1" />,
    colapsavel: true, limiteWip: 8,
  },
  {
    key: 'Em Andamento', label: 'Em Andamento', color: '#f59e0b',
    icon: <Spinner size={16} weight="duotone" color="#f59e0b" />,
    colapsavel: true, limiteWip: 4,
  },
  {
    key: 'Concluída', label: 'Concluída', color: '#10b981',
    icon: <CheckCircle size={16} weight="duotone" color="#10b981" />,
    colapsavel: true,
  },
  {
    key: 'Cancelada', label: 'Cancelada', color: '#64748b',
    icon: <XCircle size={16} weight="duotone" color="#64748b" />,
    colapsavel: true, isReadOnly: true,
  },
]

// ── Campos padrão do card ─────────────────────────────────────────────────────

const CAMPOS_PADRAO: CampoCardDef[] = [
  { key: 'empresa',    label: 'Empresa',      descricao: 'Nome da empresa vinculada',  icone: <BuildingOffice size={15} />, visivel: true },
  { key: 'prioridade', label: 'Prioridade',   descricao: 'Nível de urgência',                                              visivel: true },
  { key: 'nome',       label: 'Título',       descricao: 'Nome do item',                                                   visivel: true },
  { key: 'data',       label: 'Data',         descricao: 'Data de vencimento',         icone: <CalendarBlank size={15} />, visivel: true },
  { key: 'responsavel',label: 'Responsável',  descricao: 'Pessoa responsável',         icone: <User size={15} />,          visivel: true },
  { key: 'valor',      label: 'Valor',        descricao: 'Valor total em R$',          icone: <CurrencyDollar size={15} />,visivel: true },
]

// ── Campos disponíveis para automações (definido pelo produto) ────────────────

const CAMPOS_REGRA: CampoRegra[] = [
  {
    key: 'prioridade', label: 'Prioridade', tipo: 'selecao',
    opcoes: [
      { value: 'urgente', label: 'Urgente' },
      { value: 'alta',    label: 'Alta'    },
      { value: 'media',   label: 'Média'   },
      { value: 'baixa',   label: 'Baixa'   },
    ],
  },
  { key: 'valor',        label: 'Valor (R$)',    tipo: 'numero' },
  { key: 'data',         label: 'Data',          tipo: 'data'   },
  { key: 'empresa',      label: 'Empresa',       tipo: 'texto'  },
  { key: 'responsavel',  label: 'Responsável',   tipo: 'texto'  },
  { key: 'descricao',    label: 'Descrição',     tipo: 'texto'  },
  { key: 'proximoPasso', label: 'Próximo passo', tipo: 'texto'  },
]

// ── Extrator de valor do item — definido pelo produto ─────────────────────────

function getItemValue(item: ItemDemo, key: string): unknown {
  return (item as Record<string, unknown>)[key]
}

// ── Prioridades ───────────────────────────────────────────────────────────────

const PRIORIDADE_COR: Record<Prioridade, string> = {
  urgente: '#ef4444', alta: '#f97316', media: '#f59e0b', baixa: '#64748b',
}
const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  urgente: 'Urgente', alta: 'Alta', media: 'Média', baixa: 'Baixa',
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const EMPRESAS     = ['Alpha Corp', 'Beta Ltda', 'Gamma S/A', 'Delta ME', 'Comex Global']
const RESPONSAVEIS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira']
const PRIORIDADES: Prioridade[] = ['urgente', 'alta', 'media', 'baixa']

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
  colunaKey:   COLUNAS_PADRAO[i % COLUNAS_PADRAO.length].key,
  posicao:     i,
  nome,
  empresa:     EMPRESAS[i % EMPRESAS.length],
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
  valor:       Math.round((1000 + i * 750 + (i % 3) * 300) * 100) / 100,
  data:        gerarData(i % 7 === 0 ? -2 : i % 4 === 0 ? 0 : i + 1),
  prioridade:  PRIORIDADES[i % PRIORIDADES.length],
}))

// ── Card ──────────────────────────────────────────────────────────────────────

function DemoCard({ item, camposVisiveis }: { item: ItemDemo; camposVisiveis: Set<string> }) {
  const pc     = PRIORIDADE_COR[item.prioridade]
  const pLabel = PRIORIDADE_LABEL[item.prioridade]

  const data  = new Date(item.data)
  const hoje  = new Date()
  hoje.setHours(0, 0, 0, 0)
  data.setHours(0, 0, 0, 0)
  const atrasado = data < hoje && item.colunaKey !== 'Concluída' && item.colunaKey !== 'Cancelada'

  return (
    <div className="kb-card" style={{ borderLeft: `4px solid ${pc}` }}>
      {camposVisiveis.has('prioridade') && (
        <span
          className="kb-card-prioridade"
          style={{ background: pc + '20', color: pc, border: `1px solid ${pc}44` }}
        >
          {pLabel}
        </span>
      )}
      {camposVisiveis.has('empresa') && (
        <div className="kb-card-empresa"><BuildingOffice size={12} />{item.empresa}</div>
      )}
      {camposVisiveis.has('nome') && (
        <div className="kb-card-nome">{item.nome}</div>
      )}
      {camposVisiveis.has('data') && (
        <div className="kb-card-data" style={{ color: atrasado ? '#ef4444' : undefined }}>
          <CalendarBlank size={12} />
          {data.toLocaleDateString('pt-BR')}
          {atrasado && <span className="kb-card-atrasado">· atrasado!</span>}
        </div>
      )}
      {(camposVisiveis.has('responsavel') || camposVisiveis.has('valor')) && (
        <div className="kb-card-rodape">
          {camposVisiveis.has('responsavel') && (
            <span className="kb-card-responsavel"><User size={11} />{item.responsavel}</span>
          )}
          {camposVisiveis.has('valor') && (
            <span className="kb-card-valor">
              <CurrencyDollar size={11} />
              {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
        </div>
      )}
      <div className="kb-card-hint"><ArrowRight size={10} />ver detalhes</div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { toasts, adicionar: addToast, remover: removeToast } = useToast()

  const [itens,       setItens]       = useState<ItemDemo[]>(MOCK_INICIAL)
  const [busca,       setBusca]       = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [modalItem,   setModalItem]   = useState<ItemDemo | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [vista,       setVista]       = useState<Vista>('board')

  // Estado de configuração
  const [colunas,    setColunas]    = useState<KanbanColunaDef[]>(COLUNAS_PADRAO)
  const [camposCard, setCamposCard] = useState<CampoCardDef[]>(CAMPOS_PADRAO)
  const [regrasKanban, setRegrasKanban] = useState<RegraKanban[]>([])

  const camposVisiveis = useMemo(
    () => new Set(camposCard.filter(c => c.visivel).map(c => c.key)),
    [camposCard],
  )

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(item => {
      const dataFormatada  = item.data  ? new Date(item.data).toLocaleDateString('pt-BR') : ''
      const valorFormatado = item.valor
        ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''
      return [
        item.nome, item.empresa, item.responsavel, item.prioridade, item.colunaKey,
        dataFormatada, String(item.valor), valorFormatado,
        item.descricao ?? '', item.tipoAtividade ?? '', item.proximoPasso ?? '',
      ].join(' ').toLowerCase().includes(q)
    })
  }, [itens, busca])

  async function handleMoverItem(itemId: string, novaColunaKey: string, _posicao: number) {
    await new Promise(r => setTimeout(r, 400))
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, colunaKey: novaColunaKey } : i))
  }

  function handleCardClick(item: ItemDemo) {
    setModalItem(item)
    setModalAberto(true)
  }

  async function handleSalvarModal(atualizado: CardKanbanItem) {
    // Monta o item completo atualizado
    const anterior   = itens.find(i => i.id === atualizado.id)!
    const itemFull: ItemDemo = { ...anterior, ...atualizado }

    // Atualiza estado
    setItens(prev => prev.map(i => i.id === atualizado.id ? itemFull : i))

    // Avalia regras de automação
    const destino = avaliarRegras(itemFull, regrasKanban, getItemValue, itemFull.colunaKey)
    if (destino) {
      await handleMoverItem(atualizado.id, destino, 0)
      addToast('sucesso', 'Card movido automaticamente', `Regra aplicada → coluna "${destino}"`)
    } else {
      addToast('sucesso', 'Alterações salvas', atualizado.nome)
    }
  }

  // Sincroniza configurações em tempo real
  function handleChangeConfig(config: KanbanConfigData) {
    setColunas(config.colunas)
    setCamposCard(config.camposCard)
    setRegrasKanban(config.regras)
  }

  // Salvar explícito — aplica + volta ao board
  function handleSalvarConfig(config: KanbanConfigData) {
    setColunas(config.colunas)
    setCamposCard(config.camposCard)
    setRegrasKanban(config.regras)
    setVista('board')
  }

  const toolbar = (
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
      <button
        className={`demo-btn-loading ${isLoading ? 'demo-btn-loading--ativo' : ''}`}
        onClick={() => setIsLoading(p => !p)}
        title="Simular carregamento"
      >
        <CircleNotch size={14} className={isLoading ? 'demo-spin' : ''} />
        {isLoading ? 'Carregando…' : 'Simular loading'}
      </button>
    </div>
  )

  const colunasModal = colunas.map(c => ({ key: c.key, label: c.label, color: c.color }))

  return (
    <div className="demo-shell">
      <ToastDemo toasts={toasts} onRemover={removeToast} />
      <CardKanbanModal
        aberto={modalAberto}
        item={modalItem as CardKanbanItem | null}
        colunas={colunasModal}
        onFechar={() => setModalAberto(false)}
        onSalvar={handleSalvarModal}
      />

      {/* Header */}
      <div className="demo-header">
        <div className="demo-header-title">
          <Kanban size={18} weight="duotone" color="#818cf8" />
          KanbanGlobal
        </div>

        <div className="demo-nav">
          <button
            className={`demo-nav-tab ${vista === 'board' ? 'demo-nav-tab--ativo' : ''}`}
            onClick={() => setVista('board')}
          >
            <Kanban size={14} />
            Board
          </button>
          <button
            className={`demo-nav-tab ${vista === 'configuracoes' ? 'demo-nav-tab--ativo' : ''}`}
            onClick={() => setVista('configuracoes')}
          >
            <Gear size={14} />
            Configurações
            {regrasKanban.filter(r => r.ativo).length > 0 && (
              <span className="demo-nav-badge">
                {regrasKanban.filter(r => r.ativo).length}
              </span>
            )}
          </button>
        </div>

        <span className="demo-header-badge">@nucleo/kanban-global v2</span>
      </div>

      <div className="demo-content">
        {vista === 'board' && (
          <div className="demo-board">
            <KanbanGlobal<ItemDemo>
              colunas={colunas}
              itens={itensFiltrados}
              renderCard={(item) => <DemoCard item={item} camposVisiveis={camposVisiveis} />}
              onMoverItem={handleMoverItem}
              onCardClick={handleCardClick}
              emptyLabel="Nenhum item nesta fase"
              getItemLabel={(item) => item.nome}
              getItemDate={(item) => item.data}
              isLoading={isLoading}
              skeletonCount={3}
              testIdPrefix="demo"
              toolbarSlot={toolbar}
              colunaFooterSlot={(col) => (
                <button className="demo-add-btn" onClick={() => alert(`Novo item em: ${col.label}`)}>
                  <Plus size={13} />
                  Adicionar em {col.label}
                </button>
              )}
            />
          </div>
        )}

        {vista === 'configuracoes' && (
          <KanbanConfiguracoes
            colunas={colunas}
            camposCard={camposCard}
            regras={regrasKanban}
            camposRegra={CAMPOS_REGRA}
            onChange={handleChangeConfig}
            onSalvar={handleSalvarConfig}
            onCancelar={() => setVista('board')}
          />
        )}
      </div>
    </div>
  )
}
