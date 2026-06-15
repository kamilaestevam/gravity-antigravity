/**
 * Modal de drill-down — alertas e rotas da visão Insights (dados reais).
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardInsightsDetalhe } from './api'
import type { ContextoDialogoInsights, CotacaoInsightsDetalheCliente } from './insights-detalhe-bid-frete-internacional'
import { MODAL_LABELS } from './types'

type AbaDialogo = 'geral' | 'itens' | 'propostas' | 'historico'

const LABELS_ABA: Record<AbaDialogo, string> = {
  geral: 'Geral',
  itens: 'Itens',
  propostas: 'Propostas',
  historico: 'Histórico',
}

function corContexto(contexto: ContextoDialogoInsights): string {
  if (contexto.tipo === 'rota') {
    return contexto.mode === 'AEREO' ? '#a78bfa' : '#34d399'
  }
  if (contexto.cor === 'red') return '#f87171'
  if (contexto.cor === 'orange' || contexto.cor === 'yellow') return '#fbbf24'
  if (contexto.cor === 'green') return '#34d399'
  return '#60a5fa'
}

function tituloContexto(contexto: ContextoDialogoInsights): string {
  if (contexto.tipo === 'rota') return 'Detalhes da Rota'
  return contexto.label
}

function fmtPeso(peso: number | null): string {
  if (peso == null || !Number.isFinite(peso)) return '—'
  return `${peso.toLocaleString('pt-BR')} Kg`
}

function fmtCubagem(cubagem: number | null): string {
  if (cubagem == null || !Number.isFinite(cubagem)) return '—'
  return `${cubagem.toLocaleString('pt-BR')} m³`
}

function fmtValorMeta(moeda: string | null, valor: number | null): string {
  if (valor == null || !Number.isFinite(valor)) return '—'
  return `${moeda ?? 'USD'} ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type Props = {
  aberto: boolean
  contexto: ContextoDialogoInsights | null
  idsWorkspacesFiltro: string[]
  dataReferencia?: string
  onFechar: () => void
}

export function DialogoDetalheInsightsBidFreteInternacional({
  aberto,
  contexto,
  idsWorkspacesFiltro,
  dataReferencia,
  onFechar,
}: Props) {
  const navigate = useNavigate()
  const [aba, setAba] = useState<AbaDialogo>('geral')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [cotacoes, setCotacoes] = useState<CotacaoInsightsDetalheCliente[]>([])
  const [indiceSelecionado, setIndiceSelecionado] = useState(0)

  useEffect(() => {
    if (!aberto || !contexto) return
    setAba('geral')
    setIndiceSelecionado(0)
    setCarregando(true)
    setErro(null)
    void getDashboardInsightsDetalhe(contexto, idsWorkspacesFiltro, dataReferencia)
      .then(res => {
        setTotal(res.total)
        setCotacoes(res.cotacoes)
      })
      .catch(err => {
        console.error('[BidFrete Insights] falha drill-down', err)
        setErro(err instanceof Error ? err.message : 'Falha ao carregar detalhes')
        setTotal(0)
        setCotacoes([])
      })
      .finally(() => setCarregando(false))
  }, [aberto, contexto, idsWorkspacesFiltro, dataReferencia])

  const cotacao = cotacoes[indiceSelecionado] ?? null
  const dotColor = contexto ? corContexto(contexto) : '#60a5fa'

  const categoriaModal = useMemo(() => {
    if (!cotacao) return '—'
    const modal = MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional as keyof typeof MODAL_LABELS]
      ?? cotacao.modal_cotacao_bid_frete_internacional
    return `${modal} (${cotacao.modalidade_cotacao_bid_frete_internacional})`
  }, [cotacao])

  if (!aberto || !contexto) return null

  return (
    <div
      className="bfd-dialogo-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onFechar}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="bfd-dialogo-card"
        style={{
          background: 'rgba(30, 41, 59, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: dotColor }}>●</span>
              {tituloContexto(contexto)}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              {carregando
                ? 'Carregando cotações…'
                : cotacao
                  ? `Referência: ${cotacao.numero_cotacao_bid_frete_internacional} · ${indiceSelecionado + 1} de ${cotacoes.length} (${total} no filtro)`
                  : `Nenhuma cotação encontrada (${total} no filtro)`}
            </p>
          </div>
          <button
            type="button"
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
            onClick={onFechar}
          >
            ✕
          </button>
        </div>

        {cotacoes.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {cotacoes.map((c, idx) => (
              <button
                key={c.id_cotacao_bid_frete_internacional}
                type="button"
                onClick={() => setIndiceSelecionado(idx)}
                style={{
                  flexShrink: 0,
                  background: idx === indiceSelecionado ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${idx === indiceSelecionado ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  color: idx === indiceSelecionado ? '#60a5fa' : '#cbd5e1',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {c.numero_cotacao_bid_frete_internacional}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(15, 23, 42, 0.2)', padding: '0 1rem' }}>
          {(Object.keys(LABELS_ABA) as AbaDialogo[]).map(t => {
            const ativa = aba === t
            return (
              <button
                key={t}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: ativa ? '2px solid #3b82f6' : '2px solid transparent',
                  color: ativa ? '#3b82f6' : '#94a3b8',
                  padding: '0.85rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: ativa ? 700 : 500,
                  cursor: 'pointer',
                }}
                onClick={() => setAba(t)}
              >
                {LABELS_ABA[t]}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: '300px' }}>
          {carregando && (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>Carregando dados…</p>
          )}
          {!carregando && erro && (
            <p style={{ color: '#f87171', textAlign: 'center', margin: '2rem 0' }}>{erro}</p>
          )}
          {!carregando && !erro && !cotacao && (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>
              Nenhuma cotação corresponde a este filtro nos workspaces selecionados.
            </p>
          )}
          {!carregando && !erro && cotacao && aba === 'geral' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <Campo label="Origem" valor={`${cotacao.origem_nome_cotacao_bid_frete_internacional} (${cotacao.origem_codigo_cotacao_bid_frete_internacional})`} />
              <Campo label="Destino" valor={`${cotacao.destino_nome_cotacao_bid_frete_internacional} (${cotacao.destino_codigo_cotacao_bid_frete_internacional})`} />
              <Campo label="Mercadoria / Descrição" valor={cotacao.descricao_mercadoria_cotacao_bid_frete_internacional || '—'} span={2} />
              <Campo label="Peso Total" valor={fmtPeso(cotacao.peso_kg_cotacao_bid_frete_internacional)} />
              <Campo label="Cubagem (M³)" valor={fmtCubagem(cotacao.cubagem_m3_cotacao_bid_frete_internacional)} />
              <Campo label="Incoterm" valor={cotacao.incoterm_cotacao_bid_frete_internacional} />
              <Campo label="Valor meta" valor={fmtValorMeta(cotacao.moeda_meta_cotacao_bid_frete_internacional, cotacao.valor_meta_cotacao_bid_frete_internacional)} />
              <Campo label="Modalidade" valor={categoriaModal} span={2} />
              <Campo label="Status" valor={cotacao.status_cotacao_bid_frete_internacional} span={2} />
            </div>
          )}
          {!carregando && !erro && cotacao && aba === 'itens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <LinhaCabecalhoItens />
              <LinhaItem
                codigo={cotacao.ncm_cotacao_bid_frete_internacional ?? '—'}
                descricao={cotacao.descricao_mercadoria_cotacao_bid_frete_internacional || '—'}
                qtd={`${cotacao.quantidade_volume_cotacao_bid_frete_internacional} vol.`}
                peso={fmtPeso(cotacao.peso_kg_cotacao_bid_frete_internacional)}
              />
            </div>
          )}
          {!carregando && !erro && cotacao && aba === 'propostas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cotacao.propostas.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center' }}>Nenhuma proposta recebida ainda.</p>
              ) : (
                cotacao.propostas.map((p, idx) => (
                  <div
                    key={`${p.fornecedor}-${idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>{p.fornecedor}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Transit time: {p.transit}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa', display: 'block' }}>{p.valor}</span>
                      <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: `${p.cor}22`, color: p.cor }}>{p.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {!carregando && !erro && cotacao && aba === 'historico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(255, 255, 255, 0.05)' }}>
              {cotacao.historico.map((h, idx) => (
                <div key={`${h.data}-${idx}`} style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-1.45rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>{h.data} · por {h.autor}</span>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'block' }}>{h.texto}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(15, 23, 42, 0.2)' }}>
          <button
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#f1f5f9',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={onFechar}
          >
            Fechar
          </button>
          {cotacao && (
            <button
              type="button"
              style={{
                background: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => {
                onFechar()
                navigate(`/bid-frete/cotacoes/${cotacao.id_cotacao_bid_frete_internacional}`)
              }}
            >
              Abrir cotação
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Campo({ label, valor, span }: { label: string; valor: string; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{label}</label>
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{valor}</div>
    </div>
  )
}

function LinhaCabecalhoItens() {
  return (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
      <div style={{ flex: 1 }}>Código</div>
      <div style={{ flex: 2 }}>Descrição</div>
      <div style={{ flex: 1, textAlign: 'right' }}>Qtd</div>
      <div style={{ flex: 1, textAlign: 'right' }}>Peso</div>
    </div>
  )
}

function LinhaItem({ codigo, descricao, qtd, peso }: { codigo: string; descricao: string; qtd: string; peso: string }) {
  return (
    <div style={{ display: 'flex', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
      <div style={{ flex: 1, color: '#60a5fa', fontWeight: 600 }}>{codigo}</div>
      <div style={{ flex: 2, color: '#cbd5e1' }}>{descricao}</div>
      <div style={{ flex: 1, textAlign: 'right', color: '#ffffff' }}>{qtd}</div>
      <div style={{ flex: 1, textAlign: 'right', color: '#ffffff' }}>{peso}</div>
    </div>
  )
}
