/**
 * fornecedores-lista.tsx — Lista de Fornecedores
 * Padrão canônico: CardBasicoGlobal + TabelaVirtualGlobal (igual Lista de Cotações).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  TabelaVirtualGlobal,
  FiltroChipStatus,
  resolverFiltroStatusToolbar,
} from '@nucleo/tabela-virtual-global'
import type { GTColuna, GTAcao, GTAbaTipo, GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  Buildings,
  Plus,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  DownloadSimple,
} from '@phosphor-icons/react'

import { getFornecedores } from '../shared/api'
import { urlCriarFornecedorFreteInternacional } from '../shared/urls-deep-link-configurador'
import type { Fornecedor, TipoFornecedor, StatusFornecedor } from '../shared/types'
import { TIPO_FORNECEDOR_LABELS, STATUS_FORNECEDOR_LABELS } from '../shared/types'

const STORAGE_PREFS = 'bid-frete-internacional:config:fornecedores-tabela-preferencias'

const COLUNAS_KEYS = [
  'nome_fornecedor_bid_frete_internacional',
  'email_fornecedor_bid_frete_internacional',
  'tipo_fornecedor_bid_frete_internacional',
  'status_fornecedor_bid_frete_internacional',
  'nota_global_classificacao_bid_frete_internacional',
  'total_cotacoes',
] as const

const STATUS_FORNECEDOR_COLORS: Record<StatusFornecedor, { bg: string; color: string }> = {
  ATIVO:              { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  INATIVO:            { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
  PENDENTE_APROVACAO: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  BLOQUEADO:          { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

const TIPO_FORNECEDOR_COLORS: Record<TipoFornecedor, { bg: string; color: string }> = {
  AGENTE_CARGA:   { bg: 'rgba(34,197,94,0.15)',  color: 'var(--success, #22c55e)' },
  ARMADOR:        { bg: 'rgba(99,102,241,0.15)',  color: 'var(--accent, #6366f1)' },
  CIA_AEREA:      { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  TRANSPORTADORA: { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>—</span>
  const full = Math.round(rating)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          weight={i <= full ? 'fill' : 'regular'}
          size={14}
          style={{ color: i <= full ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
        />
      ))}
      <span style={{
        marginLeft: '0.35rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary, #94a3b8)',
      }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

function lerPreferenciasTabela(): GTPreferencias {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS)
    if (!raw) return { colunas_visiveis: [...COLUNAS_KEYS] }
    const parsed = JSON.parse(raw) as GTPreferencias
    if (!parsed?.colunas_visiveis?.length) return { colunas_visiveis: [...COLUNAS_KEYS] }
    return parsed
  } catch {
    return { colunas_visiveis: [...COLUNAS_KEYS] }
  }
}

export default function Fornecedores() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('TODOS')
  const [preferencias, setPreferencias] = useState<GTPreferencias>(lerPreferenciasTabela)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await getFornecedores({ limit: 500 })
      setFornecedores(res.fornecedores)
    } catch {
      setFornecedores([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  useEffect(() => {
    const recarregarAoVoltar = () => { void carregar() }
    window.addEventListener('focus', recarregarAoVoltar)
    window.addEventListener('pageshow', recarregarAoVoltar)
    return () => {
      window.removeEventListener('focus', recarregarAoVoltar)
      window.removeEventListener('pageshow', recarregarAoVoltar)
    }
  }, [carregar])

  const abas: GTAbaTipo[] = useMemo(() => [
    { valor: 'TODOS', label: t('bidfrete.fornecedores.todos_status', 'Todos') },
    { valor: 'ATIVO', label: STATUS_FORNECEDOR_LABELS.ATIVO },
    { valor: 'INATIVO', label: STATUS_FORNECEDOR_LABELS.INATIVO },
    { valor: 'PENDENTE_APROVACAO', label: STATUS_FORNECEDOR_LABELS.PENDENTE_APROVACAO },
    { valor: 'BLOQUEADO', label: STATUS_FORNECEDOR_LABELS.BLOQUEADO },
  ], [t])

  const filtroStatusToolbar = useMemo(
    () => resolverFiltroStatusToolbar(
      abas,
      abaAtiva,
      'TODOS',
      setAbaAtiva,
      t('bidfrete.lista.chip_status', { defaultValue: 'Status' }),
    ),
    [abas, abaAtiva, t],
  )

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return fornecedores.filter(f => {
      if (abaAtiva !== 'TODOS' && f.status_fornecedor_bid_frete_internacional !== abaAtiva) return false
      if (!termo) return true
      const nome = f.nome_fornecedor_bid_frete_internacional?.toLowerCase() ?? ''
      const fantasia = f.nome_fantasia_fornecedor_bid_frete_internacional?.toLowerCase() ?? ''
      const email = f.email_fornecedor_bid_frete_internacional?.toLowerCase() ?? ''
      return nome.includes(termo) || fantasia.includes(termo) || email.includes(termo)
    })
  }, [fornecedores, abaAtiva, busca])

  const total = fornecedores.length
  const ativos = fornecedores.filter(f => f.status_fornecedor_bid_frete_internacional === 'ATIVO').length
  const inativos = fornecedores.filter(f => f.status_fornecedor_bid_frete_internacional === 'INATIVO').length
  const ratingsValidos = fornecedores.filter(f => f.nota_global_classificacao_bid_frete_internacional != null)
  const ratingMedio = ratingsValidos.length > 0
    ? ratingsValidos.reduce((acc, f) => acc + (f.nota_global_classificacao_bid_frete_internacional ?? 0), 0) / ratingsValidos.length
    : null

  const colunas: GTColuna<Fornecedor>[] = useMemo(() => [
    {
      key: 'nome_fornecedor_bid_frete_internacional',
      label: t('bidfrete.fornecedores.col_nome'),
      tipo: 'texto',
      naoOcultavel: true,
      sortavel: true,
      render: (val: unknown, item: Fornecedor) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', fontSize: '0.8125rem' }}>{String(val ?? '')}</span>
          {item.nome_fantasia_fornecedor_bid_frete_internacional && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>{item.nome_fantasia_fornecedor_bid_frete_internacional}</span>
          )}
        </div>
      ),
    },
    {
      key: 'email_fornecedor_bid_frete_internacional',
      label: t('bidfrete.fornecedores.col_email'),
      tipo: 'texto',
      sortavel: true,
      render: (val: unknown) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{String(val ?? '—')}</span>
      ),
    },
    {
      key: 'tipo_fornecedor_bid_frete_internacional',
      label: t('bidfrete.fornecedores.col_tipo'),
      tipo: 'badge',
      filtravel: true,
      render: (val: unknown) => {
        const tipo = val as TipoFornecedor
        const cores = TIPO_FORNECEDOR_COLORS[tipo]
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: cores.bg,
            color: cores.color,
          }}>
            {TIPO_FORNECEDOR_LABELS[tipo]}
          </span>
        )
      },
    },
    {
      key: 'status_fornecedor_bid_frete_internacional',
      label: t('comum.status'),
      tipo: 'badge',
      filtravel: true,
      render: (val: unknown) => {
        const status = val as StatusFornecedor
        const cores = STATUS_FORNECEDOR_COLORS[status]
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: cores.bg,
            color: cores.color,
          }}>
            {STATUS_FORNECEDOR_LABELS[status]}
          </span>
        )
      },
    },
    {
      key: 'nota_global_classificacao_bid_frete_internacional',
      label: t('bidfrete.fornecedores.col_rating'),
      tipo: 'numero',
      sortavel: true,
      align: 'right',
      render: (val: unknown) => <Stars rating={val != null ? Number(val) : null} />,
    },
    {
      key: 'total_cotacoes',
      label: t('bidfrete.fornecedores.col_total_cotacoes'),
      tipo: 'numero',
      sortavel: true,
      align: 'right',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--text-primary, #f1f5f9)' }}>
          {val != null ? String(val) : '—'}
        </span>
      ),
    },
  ], [t])

  const acoes: GTAcao<Fornecedor>[] = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('bidfrete.fornecedores.ver_detalhes'),
      onClick: (item: Fornecedor) => navigate(`/bid-frete/fornecedores/${item.id_fornecedor_bid_frete_internacional}`),
    },
  ], [navigate, t])

  const exportarCSV = useCallback(() => {
    const sep = ';'
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const cabecalho = colunas.map(c => escape(c.label)).join(sep)
    const linhas = fornecedoresFiltrados.map(row =>
      colunas.map(c => {
        const val = row[c.key as keyof Fornecedor]
        return escape(val != null ? String(val) : '')
      }).join(sep),
    )
    const blob = new Blob(['\uFEFF' + [cabecalho, ...linhas].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fornecedores_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [colunas, fornecedoresFiltrados])

  const acoesExportacao = useMemo(() => [
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: exportarCSV,
    },
  ], [exportarCSV])

  const acoesBarra = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => {
          window.location.href = urlCriarFornecedorFreteInternacional()
        }}
      >
        {t('bidfrete.fornecedores.novo_fornecedor')}
      </BotaoGlobal>
      {filtroStatusToolbar ? (
        <div className="fc-chips-container fc-chips-container--alinhar-direita">
          <FiltroChipStatus {...filtroStatusToolbar} />
        </div>
      ) : null}
    </div>
  ), [t, filtroStatusToolbar])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    try {
      localStorage.setItem(STORAGE_PREFS, JSON.stringify(prefs))
    } catch { /* storage indisponível */ }
  }, [])

  return (
    <PaginaGlobal className="bf-fornecedores bid-frete-page-shell">
      <div className="lp-stats-row">
        <div className="lp-cards">
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_total')}
            icone={<Buildings weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            valor={total}
            subtexto={t('bidfrete.fornecedores.kpi_total_sub', 'Cadastrados na organização')}
          />
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_ativos')}
            icone={<CheckCircle weight="duotone" size={16} style={{ color: 'var(--success, #22c55e)' }} />}
            valor={ativos}
            variante="sucesso"
            subtexto={t('bidfrete.fornecedores.kpi_ativos_sub', 'Disponíveis para cotação')}
          />
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_inativos')}
            icone={<XCircle weight="duotone" size={16} style={{ color: 'var(--text-muted, #64748b)' }} />}
            valor={inativos}
            subtexto={t('bidfrete.fornecedores.kpi_inativos_sub', 'Fora de operação')}
          />
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_rating_medio')}
            icone={<Star weight="duotone" size={16} style={{ color: 'var(--warning, #f59e0b)' }} />}
            valor={ratingMedio != null ? ratingMedio.toFixed(1) : '—'}
            variante="aviso"
            subtexto={t('bidfrete.fornecedores.kpi_rating_sub', 'Média de classificação global')}
          />
        </div>
      </div>

      <div className="bf-table-section">
        <TabelaVirtualGlobal<Fornecedor>
          dados={fornecedoresFiltrados}
          colunas={colunas}
          itemId={(item) => item.id_fornecedor_bid_frete_internacional}
          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={setAbaAtiva}
          acoes={acoes}
          acoesExportacao={acoesExportacao}
          acoesBarra={acoesBarra}
          onBuscar={setBusca}
          modoLocalizar
          placeholderBusca={t('bidfrete.fornecedores.buscar_placeholder')}
          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}
          colunasPadrao={[...COLUNAS_KEYS]}
          carregando={carregando}
          emptyIcon={<Buildings size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
          emptyTitle={t('bidfrete.fornecedores.vazio')}
          emptyDescription={t('bidfrete.fornecedores.vazio_desc', 'Nenhum fornecedor encontrado com os filtros selecionados.')}
          ariaLabel={t('bidfrete.fornecedores.aria_tabela', 'Lista de fornecedores')}
        />
      </div>

      <style>{`
        .bf-fornecedores {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
        }
        .bf-fornecedores .pg-conteudo-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          gap: 1rem;
        }
        .lp-stats-row {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding: 0.5rem 0 1.5rem;
        }
        .lp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
      `}</style>
    </PaginaGlobal>
  )
}
