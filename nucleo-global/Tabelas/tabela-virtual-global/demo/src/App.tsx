import React, { useState, useCallback } from 'react'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTColuna, GTAcao, GTAbaTipo } from '@nucleo/tabela-virtual-global'
import { Eye, PencilSimple, Trash } from '@phosphor-icons/react'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type StatusProcesso = 'ativo' | 'aguardando' | 'concluido' | 'cancelado'

interface Processo {
  id: string
  referencia: string
  importador: string
  status: StatusProcesso
  valor: number
  moeda: string
  dataAbertura: string
  responsavel: string
}

interface Pedido {
  id: string
  processId: string
  numero: string
  fornecedor: string
  quantidade: number
  unidade: string
  valorUnitario: number
  moeda: string
  status: string
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const IMPORTADORES = ['Gravity Comercial Ltda', 'Nexum Trade', 'BrazTech S/A', 'Alpha Import', 'Omega Comex']
const RESPONSAVEIS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira']
const FORNECEDORES = ['Shenzhen Tech Co.', 'Samsung Parts', 'LG Electronics', 'Foxconn Ltd', 'Taiwan Semicon.']
const STATUS_P: StatusProcesso[] = ['ativo', 'aguardando', 'concluido', 'cancelado']

const PROCESSOS: Processo[] = Array.from({ length: 30 }, (_, i) => ({
  id: `proc-${i + 1}`,
  referencia: `GR-2026-${String(i + 1).padStart(4, '0')}`,
  importador: IMPORTADORES[i % IMPORTADORES.length],
  status: STATUS_P[i % 4],
  valor: Math.round((Math.random() * 500000 + 10000) * 100) / 100,
  moeda: i % 3 === 0 ? 'USD' : 'BRL',
  dataAbertura: new Date(2026, i % 12, (i % 28) + 1).toLocaleDateString('pt-BR'),
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
}))

const gerarPedidos = (processId: string, count: number): Pedido[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `ped-${processId}-${i + 1}`,
    processId,
    numero: `PO-${Math.floor(Math.random() * 90000) + 10000}`,
    fornecedor: FORNECEDORES[i % FORNECEDORES.length],
    quantidade: Math.floor(Math.random() * 1000) + 10,
    unidade: ['un', 'kg', 'cx', 'pç'][i % 4],
    valorUnitario: Math.round((Math.random() * 500 + 10) * 100) / 100,
    moeda: i % 2 === 0 ? 'USD' : 'BRL',
    status: ['pendente', 'confirmado', 'embarcado'][i % 3],
  }))

// ── Badge ─────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cor: string; bg: string; borda: string }> = {
  ativo:      { label: 'ATIVO',       cor: '#22c55e', bg: 'rgba(34,197,94,0.12)',   borda: 'rgba(34,197,94,0.2)'   },
  aguardando: { label: 'AGUARDANDO',  cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  borda: 'rgba(245,158,11,0.2)'  },
  concluido:  { label: 'CONCLUÍDO',   cor: '#818cf8', bg: 'rgba(129,140,248,0.12)', borda: 'rgba(129,140,248,0.2)' },
  cancelado:  { label: 'CANCELADO',   cor: '#ef4444', bg: 'rgba(239,68,68,0.12)',   borda: 'rgba(239,68,68,0.2)'   },
  pendente:   { label: 'PENDENTE',    cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  borda: 'rgba(245,158,11,0.2)'  },
  confirmado: { label: 'CONFIRMADO',  cor: '#22c55e', bg: 'rgba(34,197,94,0.12)',   borda: 'rgba(34,197,94,0.2)'   },
  embarcado:  { label: 'EMBARCADO',   cor: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  borda: 'rgba(56,189,248,0.2)'  },
}

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, cor: '#94a3b8', bg: 'rgba(148,163,184,0.12)', borda: 'rgba(148,163,184,0.2)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
      color: c.cor, background: c.bg, border: `1px solid ${c.borda}`, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.cor, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

// ── Colunas pai ───────────────────────────────────────────────────────────────

const COLUNAS: GTColuna<Processo>[] = [
  { key: 'referencia',   label: 'Referência',  tipo: 'texto',   frozen: true, naoOcultavel: true, sortavel: true, filtravel: true },
  { key: 'importador',   label: 'Importador',  tipo: 'texto',   sortavel: true, filtravel: true },
  { key: 'status',       label: 'Status',      tipo: 'badge',   filtravel: true, render: (_v, item) => <Badge status={item.status} /> },
  {
    key: 'valor', label: 'Valor', tipo: 'moeda', align: 'right', sortavel: true,
    render: (_v, item) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>
        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: item.moeda })}
      </span>
    ),
  },
  { key: 'dataAbertura', label: 'Abertura',    tipo: 'periodo', sortavel: true },
  { key: 'responsavel',  label: 'Responsável', tipo: 'texto',   filtravel: true },
]

// ── Colunas filho ─────────────────────────────────────────────────────────────

const MAPA_FILHO: Record<string, { render: (item: Pedido) => React.ReactNode }> = {
  referencia:   { render: (p) => <span style={{ color: '#94a3b8', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>{p.numero}</span> },
  importador:   { render: (p) => p.fornecedor },
  status:       { render: (p) => <Badge status={p.status} /> },
  valor:        { render: (p) => (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>
      {(p.quantidade * p.valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: p.moeda })}
    </span>
  )},
  dataAbertura: { render: (p) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.quantidade} {p.unidade}</span> },
  responsavel:  { render: (p) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.moeda}</span> },
}

// ── Ações ─────────────────────────────────────────────────────────────────────

const ACOES: GTAcao<Processo>[] = [
  { id: 'ver',    tooltip: 'Ver',    icone: <Eye         size={15} weight="duotone" />, onClick: (p) => console.log('Ver',    p.id) },
  { id: 'editar', tooltip: 'Editar', icone: <PencilSimple size={15} weight="duotone" />, onClick: (p) => console.log('Editar', p.id) },
  { id: 'excluir',tooltip: 'Excluir',icone: <Trash       size={15} weight="duotone" />, variant: 'danger', onClick: (p) => console.log('Excluir', p.id) },
]

// ── Abas ──────────────────────────────────────────────────────────────────────

const ABAS: GTAbaTipo[] = [
  { valor: 'todos',      label: 'Todos',      contagem: 30 },
  { valor: 'ativo',      label: 'Ativos',     contagem: 8,  cor: '#22c55e' },
  { valor: 'aguardando', label: 'Aguardando', contagem: 7,  cor: '#f59e0b' },
  { valor: 'concluido',  label: 'Concluídos', contagem: 8,  cor: '#818cf8' },
  { valor: 'cancelado',  label: 'Cancelados', contagem: 7,  cor: '#ef4444' },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [abaAtiva, setAbaAtiva] = useState('todos')

  const dadosFiltrados = abaAtiva === 'todos'
    ? PROCESSOS
    : PROCESSOS.filter(p => p.status === abaAtiva)

  const carregarFilhos = useCallback(async (processo: Processo): Promise<Pedido[]> => {
    await new Promise(r => setTimeout(r, 300))
    return gerarPedidos(processo.id, Math.floor(Math.random() * 4) + 1)
  }, [])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <div className="demo-header">
        <div>
          <h1>TabelaVirtualGlobal — Demo</h1>
          <span>nucleo-global/Tabelas/tabela-virtual-global</span>
        </div>
        <button className="demo-theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      <div className="demo-content">
        <TabelaVirtualGlobal<Processo, Pedido>
          dados={dadosFiltrados}
          colunas={COLUNAS}
          itemId={(p) => p.id}
          acoes={ACOES}
          abas={ABAS}
          abaAtiva={abaAtiva}
          onMudarAba={setAbaAtiva}
          onCarregarFilhos={carregarFilhos}
          filhoId={(f) => f.id}
          mapaColunasFilho={MAPA_FILHO}
          placeholderBusca="Buscar processo, importador…"
          emptyTitle="Nenhum processo encontrado"
          emptyDescription="Ajuste os filtros ou crie um novo processo."
        />
      </div>
    </>
  )
}
