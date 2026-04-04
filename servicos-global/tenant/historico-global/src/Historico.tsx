import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User, Robot, Globe, Cpu, Gear, Hash,
  ArrowsClockwise, DownloadSimple,
} from '@phosphor-icons/react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { TabelaGlobalColuna, TabelaExportAcao } from '@nucleo/tabela-global'

// ── Tipos ─────────────────────────────────────────────────────────

type ActorType = 'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'
type EventStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL'

type AuditLog = {
  id: string
  created_at: string
  actor_type: ActorType
  actor_id: string
  actor_name: string
  actor_ip?: string
  module: string
  resource_type: string
  resource_id?: string
  action: string
  action_detail: string
  before?: unknown
  after?: unknown
  status: EventStatus
  error_message?: string
  integrity_hash: string
}

// ── Helpers ───────────────────────────────────────────────────────

const COR_ATOR: Record<ActorType, { cor: string; bg: string }> = {
  USER:        { cor: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  API:         { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  AI:          { cor: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  JOB:         { cor: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  INTEGRATION: { cor: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

const COR_STATUS: Record<EventStatus, { cor: string; bg: string }> = {
  SUCCESS: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  FAILURE: { cor: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  PARTIAL: { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

function IconeAtor({ tipo }: { tipo: ActorType }) {
  const props = { size: 14, weight: 'bold' as const }
  if (tipo === 'AI') return <Robot {...props} />
  if (tipo === 'JOB') return <Gear {...props} />
  if (tipo === 'API') return <Globe {...props} />
  if (tipo === 'INTEGRATION') return <Cpu {...props} />
  return <User {...props} />
}

function BadgeAtorType({ tipo }: { tipo: ActorType }) {
  const { cor, bg } = COR_ATOR[tipo] ?? COR_ATOR.USER
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem',
      fontWeight: 700, background: bg, color: cor, border: `1px solid ${cor}33`,
    }}>
      <IconeAtor tipo={tipo} />
      {tipo}
    </span>
  )
}

function BadgeStatus({ status }: { status: EventStatus }) {
  const { cor, bg } = COR_STATUS[status]
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.65rem', fontWeight: 700, background: bg, color: cor,
    }}>
      {status}
    </span>
  )
}

function formatDate(iso: unknown) {
  if (!iso || typeof iso !== 'string') return '—'
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Export ────────────────────────────────────────────────────────

function exportarLogs(dados: AuditLog[], formato: 'csv' | 'excel' | 'txt' | 'json') {
  const headers = ['Quando', 'Quem', 'Tipo', 'Ação', 'Detalhe', 'Módulo', 'Recurso', 'Status']
  const rows = dados.map(l => [
    formatDate(l.created_at),
    l.actor_name,
    l.actor_type,
    l.action,
    l.action_detail,
    l.module,
    l.resource_type,
    l.status,
  ])

  let content: string
  let type: string
  let ext: string

  if (formato === 'json') {
    content = JSON.stringify(dados, null, 2)
    type = 'application/json'
    ext = 'json'
  } else if (formato === 'csv') {
    content = '\uFEFF' + [headers, ...rows]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    type = 'text/csv;charset=utf-8;'
    ext = 'csv'
  } else if (formato === 'excel') {
    content = '\uFEFF' + [headers, ...rows]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join('\t'))
      .join('\n')
    type = 'application/vnd.ms-excel'
    ext = 'xls'
  } else {
    content = [headers, ...rows].map(r => r.join('\t')).join('\n')
    type = 'text/plain;charset=utf-8;'
    ext = 'txt'
  }

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historico.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Diff antes/depois ─────────────────────────────────────────────

function DiffVisual({ before, after }: { before?: unknown; after?: unknown }) {
  if (!before && !after) {
    return <p style={{ color: '#64748b', fontSize: '0.8125rem', padding: '0.5rem 0' }}>Sem dados de antes/depois registrados.</p>
  }

  const computedDiff = (() => {
    if (!before || !after) return null
    if (typeof before !== 'object' || typeof after !== 'object') return null
    const b = before as Record<string, unknown>
    const a = after as Record<string, unknown>
    const campos = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))
    return campos
      .filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]))
      .map((k) => ({ campo: k, antes: b[k], depois: a[k] }))
  })()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antes</span>
        </div>
        <pre style={{
          background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '180px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {before ? JSON.stringify(before, null, 2) : '(novo registro)'}
        </pre>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Depois</span>
        </div>
        <pre style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '180px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {after ? JSON.stringify(after, null, 2) : '(registro excluído)'}
        </pre>
      </div>
      {computedDiff && computedDiff.length > 0 && (
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Campos alterados ({computedDiff.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['Campo', 'Antes', 'Depois'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedDiff.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px 8px', color: '#cbd5e1', fontWeight: 500 }}>{d.campo}</td>
                  <td style={{ padding: '6px 8px', color: '#f87171' }}>{String(d.antes ?? '—')}</td>
                  <td style={{ padding: '6px 8px', color: '#34d399' }}>{String(d.depois ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Detalhe expandido ─────────────────────────────────────────────

function DetalheLog({ log }: { log: AuditLog }) {
  const [aba, setAba] = useState<'diff' | 'meta'>('diff')

  return (
    <div style={{ padding: '16px', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {(['diff', 'meta'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} style={{
            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: aba === a ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: aba === a ? '#818cf8' : '#64748b',
          }}>
            {a === 'diff' ? 'Antes / Depois' : 'Detalhes'}
          </button>
        ))}
      </div>
      {aba === 'diff' && <DiffVisual before={log.before} after={log.after} />}
      {aba === 'meta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
          {[
            { label: 'Módulo', valor: log.module },
            { label: 'Tipo de recurso', valor: log.resource_type },
            { label: 'ID do recurso', valor: log.resource_id ?? '—' },
            { label: 'IP do ator', valor: log.actor_ip ?? '—' },
            { label: 'Status', valor: log.status },
            { label: 'ID do log', valor: log.id },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ color: '#e2e8f0', fontWeight: 500, wordBreak: 'break-all' }}>{valor}</p>
            </div>
          ))}
          {log.error_message && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase' }}>Erro</p>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.error_message}</p>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Hash size={12} color="#64748b" />
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Integridade:</span>
            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>{log.integrity_hash}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────

export function Historico() {
  const { t } = useTranslation()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tenant/historico-global/logs?limit=200')
      if (!res.ok) throw new Error()
      const result = await res.json()
      setLogs(result.data ?? [])
    } catch {
      // silencioso — tabela mostra vazio
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLogs() }, [loadLogs])

  // ── Colunas ────────────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<AuditLog>[] = useMemo(() => [
    {
      key: 'created_at',
      label: t('admin.history.tabela.quando'),
      tipo: 'periodo',
      tooltipTitulo: 'Quando',
      tooltipDescricao: 'Data e hora em que a ação ocorreu.',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{formatDate(v)}</span>,
    },
    {
      key: 'actor_name',
      label: t('admin.history.tabela.quem'),
      tipo: 'texto',
      tooltipTitulo: 'Ator',
      tooltipDescricao: 'Usuário, sistema ou integração que executou a ação.',
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <BadgeAtorType tipo={item.actor_type} />
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>{String(v)}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: t('admin.history.tabela.acao'),
      tipo: 'texto',
      tooltipTitulo: 'Ação',
      tooltipDescricao: 'Tipo de operação executada (CREATE, UPDATE, DELETE, etc.).',
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {String(v)}
        </span>
      ),
    },
    {
      key: 'action_detail',
      label: t('admin.history.tabela.o_que_foi_feito'),
      tipo: 'texto',
      tooltipTitulo: 'O que foi feito',
      tooltipDescricao: 'Descrição detalhada da ação executada e o recurso afetado.',
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{
            padding: '1px 6px', borderRadius: '4px', width: 'fit-content',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.65rem', color: '#94a3b8',
          }}>
            {item.module}/{item.resource_type}
          </span>
          <span style={{ color: '#e2e8f0', fontSize: '0.8125rem' }}>{String(v)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Resultado da operação: Sucesso, Falha ou Parcial.',
      render: (v) => <BadgeStatus status={v as EventStatus} />,
    },
  ], [t])

  // ── Exportação ─────────────────────────────────────────────────

  const ACOES_EXPORT: TabelaExportAcao<AuditLog>[] = useMemo(() => [
    { label: 'Excel', icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'excel') },
    { label: 'CSV',   icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'csv')   },
    { label: 'TXT',   icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'txt')   },
    { label: 'JSON',  icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'json')  },
  ], [])

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => loadLogs()}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8', fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          <ArrowsClockwise size={13} />
          Atualizar
        </button>
      </div>

      <TabelaGlobal<AuditLog>
        dados={logs}
        colunas={COLUNAS}
        acoesExportacao={ACOES_EXPORT}
        idKey="id"
        itensPorPagina={20}
        mensagemSemFiltro="Nenhuma atividade registrada ainda."
        mensagemVazio="Nenhuma atividade corresponde aos filtros aplicados."
        renderExpandido={(item) => <DetalheLog log={item} />}
        tooltipExpandir="Ver antes/depois e detalhes"
        tooltipRecolher="Recolher detalhes"
      />
    </div>
  )
}

export default Historico
