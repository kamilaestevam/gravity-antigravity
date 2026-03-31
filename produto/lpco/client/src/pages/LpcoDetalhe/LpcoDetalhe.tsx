/**
 * LpcoDetalhe — Container com abas
 * Abas: Dados | Itens | Exigencias | Vinculos | Documentos | Historico
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  ArrowLeft,
  ClipboardText,
  Package,
  Warning,
  LinkSimple,
  FileText,
  ClockCounterClockwise,
  PaperPlaneTilt,
  XCircle,
  Copy,
  CheckCircle,
  Scales,
  CalendarBlank,
} from '@phosphor-icons/react'
import { lpcoApi, lpcoExigenciaApi, lpcoVinculoApi } from '../../shared/api'
import type { Lpco, LpcoStatus, LpcoItem, LpcoExigencia, LpcoVinculo, LpcoHistoricoEvento } from '../../shared/types'
import { STATUS_LABELS, TIPO_OPERACAO_LABELS, TIPO_LPCO_LABELS, CANAL_ENTRADA_LABELS, ORGAOS_ANUENTES } from '../../shared/types'

// ── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_LPCO: Lpco = {
  id: 'lpco_id_0000001/26', tenant_id: 'tenant-demo', company_id: 'comp-demo',
  tipo_operacao: 'IMPORTACAO', tipo_lpco: 'POR_OPERACAO', orgao_anuente: 'ANVISA',
  modelo_lpco: 'I00004', numero_portal: '26BR000012345', pais_procedencia: 'CN',
  fundamento_legal: 'RDC 81/2008', importacao_exportador_id: null,
  exportacao_importador_id: null, canal_entrada: 'MANUAL', pedido_origem_id: null,
  status: 'em_exigencia', data_registro: '2026-01-15T00:00:00Z',
  data_deferimento: null, data_vigencia_inicio: null, data_vigencia_fim: null,
  quantidade_deferida: null, unidade_medida_saldo: null, created_by: 'user1',
  created_at: '2026-01-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z',
  itens: [
    {
      id: 'lpit_id_0000001/26', lpco_id: 'lpco_id_0000001/26', ncm: '30049099',
      catalogo_produto_id: null, descricao_produto: 'Medicamento generico - Amoxicilina 500mg',
      fabricante: 'Shanghai Pharma Co.', quantidade_estatistica: 50000,
      unidade_medida: 'UN', peso_liquido: 2500, vmle: 15000, moeda: 'USD',
      condicao_venda: 'CIF', atributos: null,
    },
    {
      id: 'lpit_id_0000002/26', lpco_id: 'lpco_id_0000001/26', ncm: '30042099',
      catalogo_produto_id: null, descricao_produto: 'Antibiotico - Cefalexina 250mg',
      fabricante: 'Shanghai Pharma Co.', quantidade_estatistica: 30000,
      unidade_medida: 'UN', peso_liquido: 1200, vmle: 9000, moeda: 'USD',
      condicao_venda: 'CIF', atributos: null,
    },
  ],
  exigencias: [
    {
      id: 'lpex_id_0000001/26', lpco_id: 'lpco_id_0000001/26', numero_exigencia: 1,
      descricao_exigencia: 'Apresentar certificado de boas praticas de fabricacao (CBPF) do fabricante',
      data_exigencia: '2026-02-20T00:00:00Z', prazo_resposta: '2026-03-20T00:00:00Z',
      resposta: null, data_resposta: null, status: 'pendente',
    },
  ],
  vinculos: [],
}

const MOCK_HISTORICO: LpcoHistoricoEvento[] = [
  { id: 'h1', lpco_id: 'lpco_id_0000001/26', evento: 'transicao_em_analise_em_exigencia', status_anterior: 'em_analise', status_novo: 'em_exigencia', descricao: 'Exigencia #1 recebida do orgao anuente', user_nome: 'ANVISA (Sistema)', created_at: '2026-02-20T00:00:00Z' },
  { id: 'h2', lpco_id: 'lpco_id_0000001/26', evento: 'transicao_para_analise_em_analise', status_anterior: 'para_analise', status_novo: 'em_analise', descricao: 'ANVISA iniciou analise', user_nome: 'ANVISA (Sistema)', created_at: '2026-02-01T00:00:00Z' },
  { id: 'h3', lpco_id: 'lpco_id_0000001/26', evento: 'transicao_rascunho_para_analise', status_anterior: 'rascunho', status_novo: 'para_analise', descricao: 'LPCO registrado para analise', user_nome: 'Daniel', created_at: '2026-01-15T00:00:00Z' },
  { id: 'h4', lpco_id: 'lpco_id_0000001/26', evento: 'criacao', status_anterior: null, status_novo: 'rascunho', descricao: 'LPCO criado via MANUAL', user_nome: 'Daniel', created_at: '2026-01-10T00:00:00Z' },
]

// ── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'dados' | 'itens' | 'exigencias' | 'vinculos' | 'documentos' | 'historico'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
  badge?: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

const fmtCurrency = (val: number, moeda: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(val)

const fmtPeso = (val: number) => val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

// ── Estilos compartilhados ──────────────────────────────────────────────────

const s = {
  card: {
    background: 'var(--ws-surface, #1e293b)', borderRadius: '10px',
    border: '1px solid rgba(99,102,241,0.15)', padding: '1rem',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ws-muted, #94a3b8)',
    textTransform: 'uppercase' as const, letterSpacing: '0.04em',
  } as React.CSSProperties,
  value: {
    fontSize: '0.9375rem', color: 'var(--ws-text, #f1f5f9)', fontWeight: 500,
  } as React.CSSProperties,
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)',
  } as React.CSSProperties,
}

// ── Componente ──────────────────────────────────────────────────────────────

export default function LpcoDetalhe() {
  const { id, tab } = useParams<{ id: string; tab?: string }>()
  const navigate = useNavigate()
  const [lpco, setLpco] = useState<Lpco | null>(null)
  const [historico, setHistorico] = useState<LpcoHistoricoEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>((tab as TabId) ?? 'dados')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (id) {
        const data = await lpcoApi.buscarPorId(id)
        setLpco(data)
      }
    } catch {
      setLpco(MOCK_LPCO)
      setHistorico(MOCK_HISTORICO)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const tabs: TabDef[] = useMemo(() => [
    { id: 'dados', label: 'Dados', icon: <ClipboardText weight="duotone" size={16} /> },
    { id: 'itens', label: 'Itens', icon: <Package weight="duotone" size={16} />, badge: lpco?.itens?.length },
    { id: 'exigencias', label: 'Exigencias', icon: <Warning weight="duotone" size={16} />, badge: lpco?.exigencias?.length },
    { id: 'vinculos', label: 'Vinculos', icon: <LinkSimple weight="duotone" size={16} />, badge: lpco?.vinculos?.length },
    { id: 'documentos', label: 'Documentos', icon: <FileText weight="duotone" size={16} /> },
    { id: 'historico', label: 'Historico', icon: <ClockCounterClockwise weight="duotone" size={16} /> },
  ], [lpco])

  const orgaoNome = useMemo(() => {
    if (!lpco) return ''
    return ORGAOS_ANUENTES.find(o => o.sigla === lpco.orgao_anuente)?.nome ?? lpco.orgao_anuente
  }, [lpco])

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: i === 1 ? '4rem' : '8rem', background: 'rgba(99,102,241,0.08)',
            borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    )
  }

  if (!lpco) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted, #94a3b8)' }}>
        LPCO nao encontrado
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/lpco')}
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--ws-muted, #94a3b8)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
          >
            <ArrowLeft weight="bold" size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text, #f1f5f9)' }}>
                {lpco.numero_portal ?? lpco.id}
              </h1>
              <StatusBadgeGlobal valor={STATUS_LABELS[lpco.status]} genero="feminino" />
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--ws-muted, #94a3b8)' }}>
              {lpco.orgao_anuente} — {orgaoNome} — Modelo {lpco.modelo_lpco}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {lpco.status === 'rascunho' && (
            <BotaoGlobal variante="primario" tamanho="medio" onClick={() => lpcoApi.registrar(lpco.id).then(fetchData).catch(() => {})}>
              <PaperPlaneTilt weight="bold" size={14} />
              Registrar
            </BotaoGlobal>
          )}
          {!['cancelada', 'deferida', 'indeferida'].includes(lpco.status) && (
            <BotaoGlobal variante="fantasma" tamanho="medio" onClick={() => lpcoApi.cancelar(lpco.id, 'Cancelamento manual').then(fetchData).catch(() => {})}>
              <XCircle weight="bold" size={14} />
              Cancelar
            </BotaoGlobal>
          )}
          <BotaoGlobal variante="fantasma" tamanho="medio" onClick={() => lpcoApi.duplicar(lpco.id).then(novo => navigate(`/lpco/${novo.id}`)).catch(() => {})}>
            <Copy weight="bold" size={14} />
            Duplicar
          </BotaoGlobal>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(99,102,241,0.1)',
        marginBottom: '1.25rem', overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.625rem 0.875rem', background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? '#6366f1' : 'transparent'}`,
              color: activeTab === t.id ? '#6366f1' : 'var(--ws-muted, #94a3b8)',
              fontWeight: activeTab === t.id ? 600 : 500, fontSize: '0.8125rem',
              cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {t.icon}
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span style={{
                fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem',
                borderRadius: '9999px', background: 'rgba(99,102,241,0.12)', color: '#6366f1',
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dados' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {/* Classificacao */}
          <div style={s.card}>
            <h3 style={{ ...s.label, marginBottom: '0.75rem', fontSize: '0.75rem' }}>Classificacao</h3>
            <div style={s.row}><span style={s.label}>Tipo Operacao</span><span style={s.value}>{TIPO_OPERACAO_LABELS[lpco.tipo_operacao]}</span></div>
            <div style={s.row}><span style={s.label}>Tipo LPCO</span><span style={s.value}>{TIPO_LPCO_LABELS[lpco.tipo_lpco]}</span></div>
            <div style={s.row}><span style={s.label}>Orgao Anuente</span><span style={s.value}>{lpco.orgao_anuente}</span></div>
            <div style={s.row}><span style={s.label}>Modelo</span><span style={s.value}>{lpco.modelo_lpco}</span></div>
            <div style={s.row}><span style={s.label}>Canal Entrada</span><span style={s.value}>{CANAL_ENTRADA_LABELS[lpco.canal_entrada]}</span></div>
          </div>

          {/* Dados Gerais */}
          <div style={s.card}>
            <h3 style={{ ...s.label, marginBottom: '0.75rem', fontSize: '0.75rem' }}>Dados Gerais</h3>
            <div style={s.row}><span style={s.label}>Pais Procedencia</span><span style={s.value}>{lpco.pais_procedencia}</span></div>
            <div style={s.row}><span style={s.label}>Fundamento Legal</span><span style={s.value}>{lpco.fundamento_legal}</span></div>
            <div style={s.row}><span style={s.label}>N. Portal</span><span style={{ ...s.value, fontFamily: 'monospace' }}>{lpco.numero_portal ?? '—'}</span></div>
            <div style={s.row}><span style={s.label}>Pedido Origem</span><span style={s.value}>{lpco.pedido_origem_id ?? '—'}</span></div>
          </div>

          {/* Datas */}
          <div style={s.card}>
            <h3 style={{ ...s.label, marginBottom: '0.75rem', fontSize: '0.75rem' }}>Datas e Vigencia</h3>
            <div style={s.row}><span style={s.label}>Criado em</span><span style={s.value}>{fmtDate(lpco.created_at)}</span></div>
            <div style={s.row}><span style={s.label}>Registrado em</span><span style={s.value}>{fmtDate(lpco.data_registro)}</span></div>
            <div style={s.row}><span style={s.label}>Deferido em</span><span style={s.value}>{fmtDate(lpco.data_deferimento)}</span></div>
            <div style={s.row}><span style={s.label}>Vigencia Inicio</span><span style={s.value}>{fmtDate(lpco.data_vigencia_inicio)}</span></div>
            <div style={s.row}><span style={s.label}>Vigencia Fim</span><span style={s.value}>{fmtDate(lpco.data_vigencia_fim)}</span></div>
          </div>

          {/* Saldo (se Flex) */}
          {lpco.tipo_lpco === 'FLEX' && (
            <div style={s.card}>
              <h3 style={{ ...s.label, marginBottom: '0.75rem', fontSize: '0.75rem' }}>Saldo (LPCO Flex)</h3>
              <div style={s.row}><span style={s.label}>Qtd Deferida</span><span style={s.value}>{lpco.quantidade_deferida ?? '—'} {lpco.unidade_medida_saldo ?? ''}</span></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'itens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(lpco.itens ?? []).length === 0 && (
            <p style={{ color: 'var(--ws-muted, #94a3b8)', textAlign: 'center', padding: '2rem' }}>Nenhum item</p>
          )}
          {(lpco.itens ?? []).map((item, i) => (
            <div key={item.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                    Item {i + 1} — NCM {item.ncm}
                  </span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9375rem', color: 'var(--ws-text, #f1f5f9)', fontWeight: 500 }}>
                    {item.descricao_produto}
                  </p>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)' }}>{item.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div><span style={s.label}>Fabricante</span><br /><span style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)' }}>{item.fabricante ?? '—'}</span></div>
                <div><span style={s.label}>Qtd Estatistica</span><br /><span style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)' }}>{item.quantidade_estatistica.toLocaleString('pt-BR')} {item.unidade_medida}</span></div>
                <div><span style={s.label}>Peso Liquido</span><br /><span style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)' }}>{fmtPeso(item.peso_liquido)} kg</span></div>
                <div><span style={s.label}>VMLE</span><br /><span style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)' }}>{fmtCurrency(item.vmle, item.moeda)}</span></div>
                <div><span style={s.label}>Incoterm</span><br /><span style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)' }}>{item.condicao_venda ?? '—'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'exigencias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(lpco.exigencias ?? []).length === 0 && (
            <p style={{ color: 'var(--ws-muted, #94a3b8)', textAlign: 'center', padding: '2rem' }}>Nenhuma exigencia</p>
          )}
          {(lpco.exigencias ?? []).map(ex => (
            <div key={ex.id} style={{
              ...s.card,
              borderLeftWidth: '3px',
              borderLeftColor: ex.status === 'pendente' ? '#fbbf24' : ex.status === 'respondida' ? '#60a5fa' : '#34d399',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--ws-text, #f1f5f9)' }}>
                  Exigencia #{ex.numero_exigencia}
                </span>
                <StatusBadgeGlobal
                  valor={ex.status === 'pendente' ? 'Pendente' : ex.status === 'respondida' ? 'Respondida' : ex.status === 'aceita' ? 'Aceita' : 'Rejeitada'}
                  genero="feminino"
                />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--ws-text, #f1f5f9)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                {ex.descricao_exigencia}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)' }}>
                <span>Recebida: {fmtDate(ex.data_exigencia)}</span>
                {ex.prazo_resposta && <span>Prazo: {fmtDate(ex.prazo_resposta)}</span>}
                {ex.data_resposta && <span>Respondida: {fmtDate(ex.data_resposta)}</span>}
              </div>
              {ex.resposta && (
                <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: 'rgba(99,102,241,0.06)', borderRadius: '6px' }}>
                  <span style={{ ...s.label, fontSize: '0.625rem' }}>Resposta</span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ws-text, #f1f5f9)', margin: '0.25rem 0 0' }}>{ex.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vinculos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(lpco.vinculos ?? []).length === 0 && (
            <p style={{ color: 'var(--ws-muted, #94a3b8)', textAlign: 'center', padding: '2rem' }}>
              Nenhum vinculo — {lpco.status === 'deferida' ? 'vincule a uma DUIMP ou DU-E' : 'disponivel apos deferimento'}
            </p>
          )}
          {(lpco.vinculos ?? []).map(v => (
            <div key={v.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ws-text, #f1f5f9)' }}>{v.tipo_documento}</span>
                  <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--ws-muted, #94a3b8)' }}>
                    {v.numero_documento ?? v.processo_id}
                  </span>
                </div>
                <StatusBadgeGlobal valor={v.status === 'ativo' ? 'Ativo' : 'Cancelado'} genero="masculino" />
              </div>
              {v.quantidade_vinculada != null && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '0.25rem', display: 'block' }}>
                  Qtd vinculada: {v.quantidade_vinculada} {v.unidade_medida ?? ''}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'documentos' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ws-muted, #94a3b8)' }}>
          <FileText weight="duotone" size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>Area de documentos — upload disponivel apos integracao com storage</p>
        </div>
      )}

      {activeTab === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {historico.length === 0 && (
            <p style={{ color: 'var(--ws-muted, #94a3b8)', textAlign: 'center', padding: '2rem' }}>Nenhum evento</p>
          )}
          {historico.map((ev, i) => (
            <div key={ev.id} style={{
              display: 'flex', gap: '0.75rem', padding: '0.75rem 0',
              borderBottom: i < historico.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(99,102,241,0.08)', marginTop: '0.125rem',
              }}>
                <ClockCounterClockwise weight="duotone" size={14} style={{ color: '#6366f1' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ws-text, #f1f5f9)' }}>
                  {ev.descricao}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--ws-muted, #64748b)' }}>
                  <span>{fmtDate(ev.created_at)}</span>
                  {ev.user_nome && <span>{ev.user_nome}</span>}
                  {ev.status_anterior && ev.status_novo && (
                    <span>{STATUS_LABELS[ev.status_anterior as LpcoStatus] ?? ev.status_anterior} → {STATUS_LABELS[ev.status_novo as LpcoStatus] ?? ev.status_novo}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
