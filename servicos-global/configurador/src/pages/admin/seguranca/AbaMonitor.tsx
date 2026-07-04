import React, { useState, useEffect, useCallback } from 'react'
import {
  Broadcast, CheckCircle, Warning, WarningOctagon, PauseCircle, ArrowsClockwise, Question,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'

// ─── Tipos (espelho do backend /monitor-uptime) ──────────────────────────────

type StatusMonitorUptime = 'ATIVO' | 'FORA' | 'INSTAVEL' | 'PAUSADO' | 'DESCONHECIDO'

interface EventoMonitor {
  tipo_evento_monitor: 'QUEDA' | 'RETORNO' | 'OUTRO'
  data_evento_monitor: string
  duracao_segundos_evento_monitor: number
  motivo_evento_monitor: string | null
}

interface MonitorUptimeEntry {
  id_monitor: string
  nome_monitor: string
  url_monitor: string
  status_monitor: StatusMonitorUptime
  uptime_1d: number | null
  uptime_7d: number | null
  uptime_30d: number | null
  eventos_monitor: EventoMonitor[]
}

interface MonitorUptimeResponse {
  configurado: boolean
  monitores: MonitorUptimeEntry[]
  erro?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = '/api/v1/admin/eventos-seguranca'
const POLL_INTERVAL = 60_000

async function getClerkBearerToken(): Promise<string | null> {
  try {
    const w = window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }
    return (await w.Clerk?.session?.getToken()) ?? null
  } catch { return null }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const token = await getClerkBearerToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

function statusVisual(status: StatusMonitorUptime): { cor: string; bg: string; icone: React.ReactNode; rotulo: string } {
  switch (status) {
    case 'ATIVO':
      return { cor: '#86efac', bg: '#14532d', icone: <CheckCircle weight="fill" size={16} />, rotulo: 'No ar' }
    case 'FORA':
      return { cor: '#fca5a5', bg: '#7f1d1d', icone: <WarningOctagon weight="fill" size={16} />, rotulo: 'Fora do ar' }
    case 'INSTAVEL':
      return { cor: '#fde68a', bg: '#78350f', icone: <Warning weight="fill" size={16} />, rotulo: 'Instável' }
    case 'PAUSADO':
      return { cor: '#94a3b8', bg: '#1e293b', icone: <PauseCircle weight="fill" size={16} />, rotulo: 'Pausado' }
    default:
      return { cor: '#94a3b8', bg: '#1e293b', icone: <Question weight="fill" size={16} />, rotulo: 'Desconhecido' }
  }
}

function corUptime(pct: number | null): string {
  if (pct === null) return '#64748b'
  if (pct >= 99.9) return '#34d399'
  if (pct >= 99) return '#fbbf24'
  return '#f87171'
}

function formatarDuracao(segundos: number): string {
  if (segundos < 60) return `${segundos}s`
  if (segundos < 3600) return `${Math.round(segundos / 60)}min`
  return `${(segundos / 3600).toFixed(1)}h`
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AbaMonitor() {
  const [dados, setDados] = useState<MonitorUptimeResponse | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      setErro(null)
      setDados(await fetchJSON<MonitorUptimeResponse>('/monitor-uptime'))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha desconhecida')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void carregar()
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [carregar])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando monitor externo...</div>
  }

  if (erro) {
    return (
      <div role="alert" style={{ padding: '2rem', textAlign: 'center', color: '#f87171', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div>Falha ao consultar o monitor externo: {erro}</div>
        <button
          type="button"
          onClick={() => { setLoading(true); void carregar() }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
            cursor: 'pointer', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#10b981', fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          <ArrowsClockwise size={14} /> Tentar novamente
        </button>
      </div>
    )
  }

  if (dados && !dados.configurado) {
    return (
      <div style={{
        padding: '1.5rem', borderRadius: '8px',
        background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-border, #334155)',
        fontSize: '0.85rem', color: 'var(--ws-muted, #94a3b8)', lineHeight: 1.7,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Broadcast weight="fill" size={20} /> Monitor externo não configurado
        </div>
        <p style={{ margin: 0 }}>
          O alerta de queda de produção depende de um monitor <strong>externo</strong> (UptimeRobot) — ele avisa
          por e-mail mesmo quando o servidor inteiro está fora do ar, coisa que nenhum painel interno consegue fazer.
        </p>
        <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Criar conta gratuita em <code>uptimerobot.com</code> e um monitor HTTP(s) para <code>https://www.usegravity.com.br</code> (intervalo 5 min) com alerta por e-mail.</li>
          <li>Copiar a <em>Read-Only API Key</em> (Account Settings → API).</li>
          <li>Railway → site-usegravity → Variables → <code>UPTIMEROBOT_API_KEY</code> = chave copiada.</li>
        </ol>
        <p style={{ margin: '0.75rem 0 0' }}>
          Depois do redeploy, esta aba passa a exibir status ao vivo, uptime (1/7/30 dias) e o histórico de quedas.
        </p>
      </div>
    )
  }

  const monitores = dados?.monitores ?? []
  const foraDoAr = monitores.filter((m) => m.status_monitor === 'FORA').length
  const eventosQueda = monitores
    .flatMap((m) => m.eventos_monitor.filter((e) => e.tipo_evento_monitor === 'QUEDA').map((e) => ({ ...e, nome_monitor: m.nome_monitor, id_monitor: m.id_monitor })))
    .sort((a, b) => b.data_evento_monitor.localeCompare(a.data_evento_monitor))
    .slice(0, 10)

  const colunas: TabelaGlobalColuna<MonitorUptimeEntry>[] = [
    {
      key: 'nome_monitor', label: 'Monitor', tipo: 'texto',
      tooltipTitulo: 'Monitor', tooltipDescricao: 'Nome do monitor configurado no UptimeRobot',
    },
    {
      key: 'url_monitor', label: 'URL', tipo: 'texto',
      tooltipTitulo: 'URL', tooltipDescricao: 'Endereço público verificado a cada ciclo do monitor externo',
    },
    {
      key: 'status_monitor', label: 'Status', tipo: 'texto', largura: '130px',
      tooltipTitulo: 'Status', tooltipDescricao: 'Situação atual reportada pelo UptimeRobot (fora do painel interno)',
      render: (v) => {
        const s = statusVisual(v as StatusMonitorUptime)
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.cor }}>
            {s.icone} {s.rotulo}
          </span>
        )
      },
    },
    {
      key: 'uptime_1d', label: 'Uptime 24h', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Uptime 24h', tooltipDescricao: 'Percentual de disponibilidade nas últimas 24 horas',
      render: (v) => <span style={{ color: corUptime(v as number | null), fontWeight: 600 }}>{v === null ? '—' : `${(v as number).toFixed(2)}%`}</span>,
    },
    {
      key: 'uptime_7d', label: 'Uptime 7d', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Uptime 7 dias', tooltipDescricao: 'Percentual de disponibilidade nos últimos 7 dias',
      render: (v) => <span style={{ color: corUptime(v as number | null), fontWeight: 600 }}>{v === null ? '—' : `${(v as number).toFixed(2)}%`}</span>,
    },
    {
      key: 'uptime_30d', label: 'Uptime 30d', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Uptime 30 dias', tooltipDescricao: 'Percentual de disponibilidade nos últimos 30 dias (meta SLA: 99,9%)',
      render: (v) => <span style={{ color: corUptime(v as number | null), fontWeight: 600 }}>{v === null ? '—' : `${(v as number).toFixed(2)}%`}</span>,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="cg-kpi-row" style={{ marginBottom: 0 }}>
        <TooltipGlobal titulo="Monitores" descricao="Total de monitores externos ativos no UptimeRobot">
          <CardBasicoGlobal titulo="Monitores" valor={String(monitores.length)} icone={<Broadcast weight="fill" size={20} />} variante="primario" />
        </TooltipGlobal>
        <TooltipGlobal titulo="Fora do ar" descricao="Monitores reportando indisponibilidade neste momento">
          <CardBasicoGlobal titulo="Fora do ar agora" valor={String(foraDoAr)} icone={<WarningOctagon weight="fill" size={20} />} variante={foraDoAr > 0 ? 'perigo' : 'sucesso'} />
        </TooltipGlobal>
      </div>

      <TabelaGlobal
        dados={monitores}
        colunas={colunas}
        idKey="id_monitor"
        mensagemVazio={dados?.erro ? `UptimeRobot: ${dados.erro}` : 'Nenhum monitor cadastrado no UptimeRobot'}
      />

      {eventosQueda.length > 0 && (
        <div style={{
          padding: '1rem', borderRadius: '8px',
          background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-border, #334155)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', marginBottom: '0.75rem' }}>
            Últimas quedas registradas
          </div>
          {eventosQueda.map((e, idx) => (
            <div key={`${e.id_monitor}-${e.data_evento_monitor}-${idx}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', fontSize: '0.78rem', padding: '4px 0', color: 'var(--ws-muted, #94a3b8)' }}>
              <span style={{ color: '#f87171', fontWeight: 600, minWidth: 140 }}>
                {new Date(e.data_evento_monitor).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ minWidth: 70, fontWeight: 600, color: 'var(--ws-text, #f1f5f9)' }}>{formatarDuracao(e.duracao_segundos_evento_monitor)}</span>
              <span>{e.nome_monitor}{e.motivo_evento_monitor ? ` — ${e.motivo_evento_monitor}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
