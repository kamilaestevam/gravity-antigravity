/**
 * LpcoLista — Grid de LPCOs com filtros e stats cards
 * Usa TabelaGlobal com filtros por status, orgao, tipo, operacao
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { TabelaGlobalColuna, TabelaGlobalAcao } from '@nucleo/tabela-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  Plus,
  Eye,
  Copy,
  XCircle,
  FileCheck,
  Clock,
  Warning,
  CheckCircle,
  Prohibit,
  ArrowClockwise,
  FileSearch,
  Funnel,
} from '@phosphor-icons/react'
import { lpcoApi } from '../../shared/api'
import type { Lpco, LpcoStatus } from '../../shared/types'
import { STATUS_LABELS, TIPO_OPERACAO_LABELS, TIPO_LPCO_LABELS, ORGAOS_ANUENTES } from '../../shared/types'
import './LpcoLista.css'

// ── Mock data para preview sem backend ───────────────────────────────────────

const MOCK_LPCOS: Lpco[] = [
  {
    id: 'lpco_id_0000001/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'ANVISA',
    modelo_lpco: 'I00004', numero_portal: '26BR000012345', pais_procedencia: 'CN',
    fundamento_legal: 'RDC 81/2008', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'MANUAL', pedido_origem_id: null,
    status: 'deferida', data_registro: '2026-01-15T00:00:00Z',
    data_deferimento: '2026-02-10T00:00:00Z', data_vigencia_inicio: '2026-02-10T00:00:00Z',
    data_vigencia_fim: '2026-08-10T00:00:00Z', quantidade_deferida: null,
    unidade_medida_saldo: null, created_by: 'user1',
    created_at: '2026-01-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'lpco_id_0000002/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'FLEX', orgao_anuente: 'MAPA',
    modelo_lpco: 'I00001', numero_portal: '26BR000012346', pais_procedencia: 'AR',
    fundamento_legal: 'IN SDA 51/2020', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'PEDIDO', pedido_origem_id: 'ped_001',
    status: 'em_analise', data_registro: '2026-02-20T00:00:00Z',
    data_deferimento: null, data_vigencia_inicio: null, data_vigencia_fim: null,
    quantidade_deferida: 50000, unidade_medida_saldo: 'KG',
    created_by: 'user1', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-20T00:00:00Z',
  },
  {
    id: 'lpco_id_0000003/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'EXPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'IBAMA',
    modelo_lpco: 'E00012', numero_portal: null, pais_procedencia: 'US',
    fundamento_legal: 'IN IBAMA 19/2014', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'MANUAL', pedido_origem_id: null,
    status: 'rascunho', data_registro: null, data_deferimento: null,
    data_vigencia_inicio: null, data_vigencia_fim: null, quantidade_deferida: null,
    unidade_medida_saldo: null, created_by: 'user1',
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 'lpco_id_0000004/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'INMETRO',
    modelo_lpco: 'I00007', numero_portal: '26BR000012350', pais_procedencia: 'DE',
    fundamento_legal: 'Portaria INMETRO 563/2016', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'SMART_READ', pedido_origem_id: null,
    status: 'em_exigencia', data_registro: '2026-02-28T00:00:00Z',
    data_deferimento: null, data_vigencia_inicio: null, data_vigencia_fim: null,
    quantidade_deferida: null, unidade_medida_saldo: null, created_by: 'user1',
    created_at: '2026-02-25T00:00:00Z', updated_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'lpco_id_0000005/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'TAXA', orgao_anuente: 'DECEX',
    modelo_lpco: 'I00020', numero_portal: '26BR000012355', pais_procedencia: 'JP',
    fundamento_legal: 'Portaria SECEX 23/2011', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'API', pedido_origem_id: null,
    status: 'deferida', data_registro: '2026-03-05T00:00:00Z',
    data_deferimento: '2026-03-08T00:00:00Z', data_vigencia_inicio: '2026-03-08T00:00:00Z',
    data_vigencia_fim: '2026-09-08T00:00:00Z', quantidade_deferida: null,
    unidade_medida_saldo: null, created_by: 'user2',
    created_at: '2026-03-04T00:00:00Z', updated_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'lpco_id_0000006/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'ANP',
    modelo_lpco: 'I00008', numero_portal: '26BR000012360', pais_procedencia: 'SA',
    fundamento_legal: 'Resolucao ANP 18/2018', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'PLANILHA', pedido_origem_id: null,
    status: 'indeferida', data_registro: '2026-01-20T00:00:00Z',
    data_deferimento: null, data_vigencia_inicio: null, data_vigencia_fim: null,
    quantidade_deferida: null, unidade_medida_saldo: null, created_by: 'user1',
    created_at: '2026-01-18T00:00:00Z', updated_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'lpco_id_0000007/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
    tipo_operacao: 'IMPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'ANVISA',
    modelo_lpco: 'I00005', numero_portal: null, pais_procedencia: 'FR',
    fundamento_legal: 'RDC 332/2005', importacao_exportador_id: null,
    exportacao_importador_id: null, canal_entrada: 'DUPLICAR', pedido_origem_id: null,
    status: 'cancelada', data_registro: null, data_deferimento: null,
    data_vigencia_inicio: null, data_vigencia_fim: null, quantidade_deferida: null,
    unidade_medida_saldo: null, created_by: 'user2',
    created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-20T00:00:00Z',
  },
]

// ── Stats Cards ──────────────────────────────────────────────────────────────

interface StatCard {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  filterStatus?: LpcoStatus
}

function StatsBar({ stats, onFilter }: { stats: Record<string, number>; onFilter: (status: LpcoStatus | null) => void }) {
  const cards: StatCard[] = [
    { label: 'Total', value: stats.total ?? 0, icon: <FileCheck weight="duotone" size={20} />, color: 'var(--lp-accent)' },
    { label: 'Rascunho', value: stats.rascunho ?? 0, icon: <Clock weight="duotone" size={20} />, color: '#94a3b8', filterStatus: 'rascunho' },
    { label: 'Em Analise', value: stats.em_analise ?? 0, icon: <ArrowClockwise weight="duotone" size={20} />, color: '#60a5fa', filterStatus: 'em_analise' },
    { label: 'Em Exigencia', value: stats.em_exigencia ?? 0, icon: <Warning weight="duotone" size={20} />, color: '#fbbf24', filterStatus: 'em_exigencia' },
    { label: 'Deferida', value: stats.deferida ?? 0, icon: <CheckCircle weight="duotone" size={20} />, color: '#34d399', filterStatus: 'deferida' },
    { label: 'Indeferida', value: stats.indeferida ?? 0, icon: <Prohibit weight="duotone" size={20} />, color: '#f87171', filterStatus: 'indeferida' },
  ]

  return (
    <div className="lp-stats-bar">
      {cards.map(card => (
        <TooltipGlobal key={card.label} titulo={card.label} descricao={`Filtrar por ${card.label}`}>
          <button
            className="lp-stat-card"
            onClick={() => onFilter(card.filterStatus ?? null)}
            type="button"
          >
            <div className="lp-stat-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="lp-stat-info">
              <span className="lp-stat-value">{card.value}</span>
              <span className="lp-stat-label">{card.label}</span>
            </div>
          </button>
        </TooltipGlobal>
      ))}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

// ── Componente Principal ────────────────────────────────────────────────────

export default function LpcoLista() {
  const navigate = useNavigate()
  const [lpcos, setLpcos] = useState<Lpco[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [filtroStatus, setFiltroStatus] = useState<LpcoStatus | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [listaRes, statsRes] = await Promise.all([
        lpcoApi.listar(filtroStatus ? { status: filtroStatus } : undefined),
        lpcoApi.stats(),
      ])
      setLpcos(listaRes.data)
      setStats(statsRes)
    } catch {
      // Fallback mock
      setLpcos(MOCK_LPCOS)
      const mockStats: Record<string, number> = { total: MOCK_LPCOS.length }
      for (const l of MOCK_LPCOS) {
        mockStats[l.status] = (mockStats[l.status] ?? 0) + 1
      }
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }, [filtroStatus])

  useEffect(() => { fetchData() }, [fetchData])

  const dadosFiltrados = useMemo(() => {
    if (!filtroStatus) return lpcos
    return lpcos.filter(l => l.status === filtroStatus)
  }, [lpcos, filtroStatus])

  const colunas: TabelaGlobalColuna<Lpco>[] = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      tipo: 'texto',
      largura: 180,
      tooltipTitulo: 'Identificador',
      tooltipDescricao: 'ID corporativo do LPCO',
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{val}</span>
      ),
    },
    {
      key: 'orgao_anuente',
      label: 'Orgao',
      tipo: 'texto',
      largura: 100,
      tooltipTitulo: 'Orgao Anuente',
      tooltipDescricao: 'Orgao responsavel pela analise do LPCO',
    },
    {
      key: 'modelo_lpco',
      label: 'Modelo',
      tipo: 'texto',
      largura: 90,
    },
    {
      key: 'tipo_operacao',
      label: 'Operacao',
      tipo: 'texto',
      largura: 110,
      render: (val: string) => TIPO_OPERACAO_LABELS[val as keyof typeof TIPO_OPERACAO_LABELS] ?? val,
    },
    {
      key: 'tipo_lpco',
      label: 'Tipo',
      tipo: 'texto',
      largura: 140,
      render: (val: string) => TIPO_LPCO_LABELS[val as keyof typeof TIPO_LPCO_LABELS] ?? val,
    },
    {
      key: 'pais_procedencia',
      label: 'Pais',
      tipo: 'texto',
      largura: 60,
      align: 'center',
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 150,
      render: (val: string) => (
        <StatusBadgeGlobal
          valor={STATUS_LABELS[val as LpcoStatus] ?? val}
          genero="feminino"
        />
      ),
    },
    {
      key: 'numero_portal',
      label: 'N. Portal',
      tipo: 'texto',
      largura: 150,
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'canal_entrada',
      label: 'Canal',
      tipo: 'texto',
      largura: 100,
      render: (val: string) => {
        const short: Record<string, string> = {
          MANUAL: 'Manual', PLANILHA: 'Planilha', PEDIDO: 'Pedido',
          SMART_READ: 'Smart', DUPLICAR: 'Duplicar', API: 'API',
        }
        return short[val] ?? val
      },
    },
    {
      key: 'created_at',
      label: 'Criado em',
      tipo: 'periodo',
      largura: 110,
      render: (val: string) => fmtDate(val),
    },
  ], [])

  const acoes: TabelaGlobalAcao<Lpco>[] = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item) => navigate(`/lpco/${item.id}`),
    },
    {
      id: 'duplicar',
      icone: <Copy weight="duotone" size={16} />,
      tooltip: 'Duplicar',
      onClick: async (item) => {
        try {
          const novo = await lpcoApi.duplicar(item.id)
          navigate(`/lpco/${novo.id}`)
        } catch {
          navigate(`/lpco/novo`)
        }
      },
    },
  ], [navigate])

  const handleFilterStatus = useCallback((status: LpcoStatus | null) => {
    setFiltroStatus(prev => prev === status ? null : status)
  }, [])

  return (
    <div className="lp-lista-container">
      {/* Header */}
      <div className="lp-lista-header">
        <div className="lp-lista-title-row">
          <div>
            <h1 className="lp-lista-title">LPCOs</h1>
            <p className="lp-lista-subtitle">
              Licencas, Permissoes, Certificados e Outros Documentos
            </p>
          </div>
          <div className="lp-lista-actions">
            <TooltipGlobal titulo="Simulador TA" descricao="Verificar tratamento administrativo por NCM">
              <BotaoGlobal
                variante="fantasma"
                tamanho="medio"
                onClick={() => navigate('/lpco/simulador')}
              >
                <FileSearch weight="duotone" size={16} />
                Simulador TA
              </BotaoGlobal>
            </TooltipGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="medio"
              onClick={() => navigate('/lpco/novo')}
            >
              <Plus weight="bold" size={16} />
              Novo LPCO
            </BotaoGlobal>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsBar stats={stats} onFilter={handleFilterStatus} />

        {/* Filtro ativo indicator */}
        {filtroStatus && (
          <div className="lp-filtro-ativo">
            <Funnel weight="fill" size={14} />
            <span>Filtrando por: <strong>{STATUS_LABELS[filtroStatus]}</strong></span>
            <button onClick={() => setFiltroStatus(null)} type="button" className="lp-filtro-limpar">
              <XCircle weight="fill" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="lp-lista-tabela">
        {loading ? (
          <div className="lp-loading">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="lp-skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <TabelaGlobal
            id="lpco-lista"
            dados={dadosFiltrados}
            colunas={colunas}
            acoes={acoes}
            idKey="id"
            mensagemVazio="Nenhum LPCO encontrado"
            itensPorPagina={20}
          />
        )}
      </div>
    </div>
  )
}
