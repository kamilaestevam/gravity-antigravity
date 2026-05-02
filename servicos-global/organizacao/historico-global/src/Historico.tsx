import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  User, Robot, Globe, Cpu, Gear, Hash,
  ArrowsClockwise, DownloadSimple, FilePdf,
} from '@phosphor-icons/react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { TabelaGlobalColuna, TabelaExportAcao } from '@nucleo/tabela-global'

// ── Tipos ─────────────────────────────────────────────────────────

type TipoAtorHistoricoLog = 'USUARIO' | 'API' | 'IA' | 'JOB' | 'INTEGRACAO'
type StatusHistoricoLog = 'SUCESSO' | 'FALHA' | 'PARCIAL'

type AuditLog = {
  id_historico_log: string
  data_criacao_historico_log: string
  tipo_ator_historico_log: TipoAtorHistoricoLog
  id_ator_historico_log: string
  nome_ator_historico_log: string
  ip_ator_historico_log?: string
  modulo_historico_log: string
  tipo_recurso_historico_log: string
  id_recurso_historico_log?: string
  acao_historico_log: string
  detalhe_acao_historico_log: string
  estado_anterior_historico_log?: unknown
  estado_posterior_historico_log?: unknown
  status_historico_log: StatusHistoricoLog
  mensagem_erro_historico_log?: string
  hash_integridade_historico_log: string
}

// ── Helpers ───────────────────────────────────────────────────────

const ATOR_KEY: Record<TipoAtorHistoricoLog, string> = {
  USUARIO: 'admin.history.ator.usuario',
  API: 'admin.history.ator.api',
  IA: 'admin.history.ator.ia',
  JOB: 'admin.history.ator.job',
  INTEGRACAO: 'admin.history.ator.integracao',
}

const STATUS_KEY: Record<StatusHistoricoLog, string> = {
  SUCESSO: 'admin.history.status.sucesso',
  FALHA: 'admin.history.status.falha',
  PARCIAL: 'admin.history.status.parcial',
}

const ACAO_KEY: Record<string, string> = {
  CREATE: 'admin.history.acao.create',
  UPDATE: 'admin.history.acao.update',
  DELETE: 'admin.history.acao.delete',
  LOGIN: 'admin.history.acao.login',
  LOGOUT: 'admin.history.acao.logout',
  SESSION_REVOKED: 'admin.history.acao.session_revoked',
  AUTH_FAILURE: 'admin.history.acao.auth_failure',
  EXPORT: 'admin.history.acao.export',
  IMPORT: 'admin.history.acao.import',
  SYNC: 'admin.history.acao.sync',
  CONSULTA: 'admin.history.acao.consulta',
  ENVIO: 'admin.history.acao.envio',
  RECEBIMENTO: 'admin.history.acao.recebimento',
  BACKUP: 'admin.history.acao.backup',
  ANONIMIZACAO_LGPD: 'admin.history.acao.anonimizacao_lgpd',
}

const COR_ATOR: Record<TipoAtorHistoricoLog, { cor: string; bg: string }> = {
  USUARIO:    { cor: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  API:        { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  IA:         { cor: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  JOB:        { cor: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  INTEGRACAO: { cor: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

const COR_STATUS: Record<StatusHistoricoLog, { cor: string; bg: string }> = {
  SUCESSO: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  FALHA:   { cor: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  PARCIAL: { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

function IconeAtor({ tipo }: { tipo: TipoAtorHistoricoLog }) {
  const props = { size: 14, weight: 'bold' as const }
  if (tipo === 'IA') return <Robot {...props} />
  if (tipo === 'JOB') return <Gear {...props} />
  if (tipo === 'API') return <Globe {...props} />
  if (tipo === 'INTEGRACAO') return <Cpu {...props} />
  return <User {...props} />
}

function BadgeAtorType({ tipo, t }: { tipo: TipoAtorHistoricoLog; t: TFunction }) {
  const { cor, bg } = COR_ATOR[tipo] ?? COR_ATOR.USUARIO
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem',
      fontWeight: 700, background: bg, color: cor, border: `1px solid ${cor}33`,
    }}>
      <IconeAtor tipo={tipo} />
      {t(ATOR_KEY[tipo])}
    </span>
  )
}

function BadgeStatus({ status, t }: { status: StatusHistoricoLog; t: TFunction }) {
  const { cor, bg } = COR_STATUS[status]
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.65rem', fontWeight: 700, background: bg, color: cor,
    }}>
      {t(STATUS_KEY[status])}
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

async function exportarLogsExcel(dados: AuditLog[], t: TFunction) {
  const headers = [
    t('admin.history.export.headers.quando'),
    t('admin.history.export.headers.quem'),
    t('admin.history.export.headers.tipo'),
    t('admin.history.export.headers.acao'),
    t('admin.history.export.headers.detalhe'),
    t('admin.history.export.headers.modulo'),
    t('admin.history.export.headers.recurso'),
    t('admin.history.export.headers.status'),
  ]
  const rows = dados.map(l => [
    formatDate(l.data_criacao_historico_log), l.nome_ator_historico_log, l.tipo_ator_historico_log,
    l.acao_historico_log, l.detalhe_acao_historico_log, l.modulo_historico_log, l.tipo_recurso_historico_log, l.status_historico_log,
  ])
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Gravity Platform'; wb.created = new Date()
  const ws = wb.addWorksheet(t('admin.history.titulo'), { views: [{ showGridLines: true }] })
  ws.columns = headers.map((h, i) => {
    const maxData = rows.length > 0 ? Math.max(...rows.map(r => String(r[i] ?? '').length)) : 0
    return { key: String(i), width: Math.min(Math.max(h.length, maxData) + 4, 50) }
  })
  const headerRow = ws.addRow(headers)
  headerRow.height = 22
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3256' } }
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FF38bdf8' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF38bdf8' } } }
  })
  rows.forEach((rowValues, idx) => {
    const dr = ws.addRow(rowValues)
    dr.height = 18
    dr.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFf1f5f9' : 'FFFFFFFF' } }
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1e293b' } }
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFe2e8f0' } },
        right:  { style: 'hair', color: { argb: 'FFe2e8f0' } },
      }
    })
  })
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'historico.xlsx'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

async function exportarLogsPDF(dados: AuditLog[], t: TFunction) {
  const headers = [
    t('admin.history.export.headers.quando'),
    t('admin.history.export.headers.quem'),
    t('admin.history.export.headers.tipo'),
    t('admin.history.export.headers.acao'),
    t('admin.history.export.headers.detalhe'),
    t('admin.history.export.headers.modulo'),
    t('admin.history.export.headers.recurso'),
    t('admin.history.export.headers.status'),
  ]
  const rows = dados.map(l => [
    formatDate(l.data_criacao_historico_log), l.nome_ator_historico_log, l.tipo_ator_historico_log,
    l.acao_historico_log, l.detalhe_acao_historico_log, l.modulo_historico_log, l.tipo_recurso_historico_log, l.status_historico_log,
  ])
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(16); doc.setTextColor(30, 41, 59)
  doc.text(t('admin.history.pdf.titulo'), 14, 16)
  doc.setFontSize(8); doc.setTextColor(100, 116, 139)
  doc.text(`${t('admin.history.pdf.gerado_em')} ${new Date().toLocaleString('pt-BR')}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows,
    styles:     { fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42], textColor: [56, 189, 248], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  })
  const totalPag = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= totalPag; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(148, 163, 184)
    doc.text(t('admin.history.pdf.pagina', { atual: i, total: totalPag }), doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' })
  }
  doc.save('historico.pdf')
}

function exportarLogs(dados: AuditLog[], formato: 'csv' | 'excel' | 'txt' | 'json' | 'xml', t: TFunction) {
  const headers = [
    t('admin.history.export.headers.quando'),
    t('admin.history.export.headers.quem'),
    t('admin.history.export.headers.tipo'),
    t('admin.history.export.headers.acao'),
    t('admin.history.export.headers.detalhe'),
    t('admin.history.export.headers.modulo'),
    t('admin.history.export.headers.recurso'),
    t('admin.history.export.headers.status'),
  ]
  const rows = dados.map(l => [
    formatDate(l.data_criacao_historico_log),
    l.nome_ator_historico_log,
    l.tipo_ator_historico_log,
    l.acao_historico_log,
    l.detalhe_acao_historico_log,
    l.modulo_historico_log,
    l.tipo_recurso_historico_log,
    l.status_historico_log,
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
  } else if (formato === 'xml') {
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const xmlRows = dados.map(l => [
      `  <log>`,
      `    <quando>${escape(formatDate(l.data_criacao_historico_log))}</quando>`,
      `    <quem>${escape(l.nome_ator_historico_log)}</quem>`,
      `    <tipo>${escape(l.tipo_ator_historico_log)}</tipo>`,
      `    <acao>${escape(l.acao_historico_log)}</acao>`,
      `    <detalhe>${escape(l.detalhe_acao_historico_log)}</detalhe>`,
      `    <modulo>${escape(l.modulo_historico_log)}</modulo>`,
      `    <recurso>${escape(l.tipo_recurso_historico_log)}</recurso>`,
      `    <status>${escape(l.status_historico_log)}</status>`,
      `  </log>`,
    ].join('\n')).join('\n')
    content = `<?xml version="1.0" encoding="UTF-8"?>\n<historico>\n${xmlRows}\n</historico>`
    type = 'application/xml;charset=utf-8;'
    ext = 'xml'
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

function DiffVisual({ before, after, t }: { before?: unknown; after?: unknown; t: TFunction }) {
  if (!before && !after) {
    return <p style={{ color: '#64748b', fontSize: '0.8125rem', padding: '0.5rem 0' }}>{t('admin.history.diff.sem_dados')}</p>
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
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.history.diff.antes')}</span>
        </div>
        <pre style={{
          background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '180px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {before ? JSON.stringify(before, null, 2) : t('admin.history.diff.novo_registro')}
        </pre>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.history.diff.depois')}</span>
        </div>
        <pre style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '180px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {after ? JSON.stringify(after, null, 2) : t('admin.history.diff.registro_excluido')}
        </pre>
      </div>
      {computedDiff && computedDiff.length > 0 && (
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {t('admin.history.diff.campos_alterados')} ({computedDiff.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {[
                  t('admin.history.diff.campo'),
                  t('admin.history.diff.antes'),
                  t('admin.history.diff.depois'),
                ].map((h) => (
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

function DetalheLog({ log, t }: { log: AuditLog; t: TFunction }) {
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
            {a === 'diff' ? t('admin.history.detalhe.aba_diff') : t('admin.history.detalhe.aba_meta')}
          </button>
        ))}
      </div>
      {aba === 'diff' && <DiffVisual before={log.estado_anterior_historico_log} after={log.estado_posterior_historico_log} t={t} />}
      {aba === 'meta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
          {[
            { label: t('admin.history.detalhe.meta.modulo'), valor: log.modulo_historico_log },
            { label: t('admin.history.detalhe.meta.tipo_recurso'), valor: log.tipo_recurso_historico_log },
            { label: t('admin.history.detalhe.meta.id_recurso'), valor: log.id_recurso_historico_log ?? '—' },
            { label: t('admin.history.detalhe.meta.ip_ator'), valor: log.ip_ator_historico_log ?? '—' },
            { label: t('admin.history.detalhe.meta.status'), valor: log.status_historico_log },
            { label: t('admin.history.detalhe.meta.id_log'), valor: log.id_historico_log },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ color: '#e2e8f0', fontWeight: 500, wordBreak: 'break-all' }}>{valor}</p>
            </div>
          ))}
          {log.mensagem_erro_historico_log && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase' }}>{t('admin.history.detalhe.meta.erro')}</p>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.mensagem_erro_historico_log}</p>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Hash size={12} color="#64748b" />
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{t('admin.history.detalhe.meta.integridade')}</span>
            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>{log.hash_integridade_historico_log}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Mock data (DEV ONLY) ──────────────────────────────────────────

const ATORES: Array<{ nome: string; tipo: TipoAtorHistoricoLog; id: string; ip?: string }> = [
  { nome: 'Daniel Martins', tipo: 'USUARIO', id: 'user_001', ip: '187.45.12.88' },
  { nome: 'Ana Souza', tipo: 'USUARIO', id: 'user_002', ip: '200.186.30.5' },
  { nome: 'Carlos Lima', tipo: 'USUARIO', id: 'user_003', ip: '177.92.44.201' },
  { nome: 'Fernanda Costa', tipo: 'USUARIO', id: 'user_004', ip: '189.6.77.12' },
  { nome: 'Gabi AI', tipo: 'IA', id: 'ai_gabi', ip: undefined },
  { nome: 'API Externa v2', tipo: 'API', id: 'api_ext_v2', ip: '54.230.101.5' },
  { nome: 'API Marketplace', tipo: 'API', id: 'api_market', ip: '52.11.200.14' },
  { nome: 'Cron: Receita Federal', tipo: 'JOB', id: 'job_receita', ip: undefined },
  { nome: 'Cron: Backup Diário', tipo: 'JOB', id: 'job_backup', ip: undefined },
  { nome: 'Cron: Partition Manager', tipo: 'JOB', id: 'job_partition', ip: undefined },
  { nome: 'SAP ERP Conector', tipo: 'INTEGRACAO', id: 'int_sap', ip: '10.0.0.50' },
  { nome: 'Siscomex Gateway', tipo: 'INTEGRACAO', id: 'int_siscomex', ip: '200.152.38.155' },
  { nome: 'Stripe Billing', tipo: 'INTEGRACAO', id: 'int_stripe', ip: '54.187.174.169' },
]

const EVENTOS: Array<{
  modulo_historico_log: string; tipo_recurso_historico_log: string; acao_historico_log: string; detalhe_acao_historico_log: string;
  estado_anterior_historico_log?: Record<string, unknown>; estado_posterior_historico_log?: Record<string, unknown>;
  status_historico_log?: StatusHistoricoLog; mensagem_erro_historico_log?: string;
}> = [
  // Pedido
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou o pedido #PED-2026-0441 — Acme Importações Ltda', estado_posterior_historico_log: { numero: 'PED-2026-0441', status_historico_log: 'RASCUNHO', valor: 152400.00, moeda: 'USD' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou status do pedido #PED-2026-0441 de RASCUNHO para CONFIRMADO', estado_anterior_historico_log: { status_historico_log: 'RASCUNHO' }, estado_posterior_historico_log: { status_historico_log: 'CONFIRMADO' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou valor do pedido #PED-2026-0440 de USD 98.000 para USD 112.500', estado_anterior_historico_log: { valor: 98000, moeda: 'USD', incoterm: 'FOB' }, estado_posterior_historico_log: { valor: 112500, moeda: 'USD', incoterm: 'CIF' } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Excluiu o pedido #PED-2026-0438 — cancelado pelo cliente', estado_anterior_historico_log: { numero: 'PED-2026-0438', status_historico_log: 'RASCUNHO', valor: 45000 } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'ItemPedido', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Adicionou item NCM 8471.30.19 — Notebook Dell XPS 15" (Qtd: 50)', estado_posterior_historico_log: { ncm: '8471.30.19', descricao: 'Notebook Dell XPS 15"', qtd: 50, unitario: 1800 } },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou pedido #PED-2026-0441 em formato CSV (128 linhas)' },
  { modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao atualizar pedido #PED-2026-0437 — campo obrigatório ausente', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ValidationError: campo "pais_origem" é obrigatório' },

  // Auth
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGIN', detalhe_acao_historico_log: 'Login realizado com sucesso via email+senha' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGOUT', detalhe_acao_historico_log: 'Logout realizado — sessão encerrada pelo usuário' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'SESSION_REVOKED', detalhe_acao_historico_log: 'Sessão revogada pelo administrador — inatividade de 30 dias', status_historico_log: 'PARCIAL' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'AUTH_FAILURE', detalhe_acao_historico_log: 'Tentativa de acesso negada — token JWT expirado', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'TokenExpiredError: jwt expired at 2026-04-03T22:00:00Z' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'AUTH_FAILURE', detalhe_acao_historico_log: 'Tentativa de acesso a recurso sem permissão suficiente (role: STANDARD)', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ForbiddenError: role STANDARD não tem acesso a /api/admin' },
  { modulo_historico_log: 'auth', tipo_recurso_historico_log: 'Session', acao_historico_log: 'LOGIN', detalhe_acao_historico_log: 'Login via SSO Google Workspace' },

  // Nota Fiscal
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou NF-e #55002 — Importação de equipamentos eletrônicos', estado_posterior_historico_log: { numero: '55002', valor: 284500.00, cfop: '3102', emitente: 'Dell Inc.' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Corrigiu CFOP da NF-e #55001 de 3102 para 3128', estado_anterior_historico_log: { cfop: '3102' }, estado_posterior_historico_log: { cfop: '3128' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'IMPORT', detalhe_acao_historico_log: 'Importou 14 notas fiscais via XML (lote #NF-LOTE-2026-04)', estado_posterior_historico_log: { quantidade: 14, formato: 'XML', tamanho_kb: 382 } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Excluiu NF-e #54998 — duplicidade identificada', estado_anterior_historico_log: { numero: '54998', status_historico_log: 'RASCUNHO' } },
  { modulo_historico_log: 'nf-importacao', tipo_recurso_historico_log: 'NotaFiscal', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao processar NF-e #55003 — XML inválido', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'XMLParseError: elemento <infNFe> ausente no arquivo enviado' },

  // LPCO
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou LPCO #LI-2026-00891 — Licença de Importação para máquinas industriais', estado_posterior_historico_log: { numero: 'LI-2026-00891', tipo: 'LI', ncm: '8457.10.00', valor_usd: 875000 } },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou vencimento da LI #LI-2026-00891 para 30/06/2026', estado_anterior_historico_log: { vencimento: '2026-03-31' }, estado_posterior_historico_log: { vencimento: '2026-06-30' } },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou status da LI #LI-2026-00890 no Siscomex — retorno: DEFERIDA' },
  { modulo_historico_log: 'lpco', tipo_recurso_historico_log: 'Licenca', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou relatório de LPCOs vencendo em 30 dias (22 registros)' },

  // SimulaCusto
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou simulação #SIM-0291 — NCM 8471.30.19, origem China, valor USD 90.000', estado_posterior_historico_log: { ncm: '8471.30.19', origem: 'CN', valor_usd: 90000, modal: 'Marítimo' } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Recalculou simulação #SIM-0291 — alteração de modal para Aéreo', estado_anterior_historico_log: { modal: 'Marítimo', frete_usd: 1200 }, estado_posterior_historico_log: { modal: 'Aéreo', frete_usd: 8500 } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou PTAX do dia 04/04/2026 — USD/BRL: 5.7832 (fonte: BACEN)', estado_posterior_historico_log: { ptax: 5.7832, data: '2026-04-04', fonte: 'BACEN' } },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'Simulacao', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou simulação #SIM-0291 em PDF para envio ao cliente' },
  { modulo_historico_log: 'simula-custo', tipo_recurso_historico_log: 'TabelaNCM', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou tabela NCM com Siscomex — 47 registros atualizados', estado_posterior_historico_log: { atualizados: 47, novos: 3, removidos: 0 }, status_historico_log: 'PARCIAL' },

  // Bid Câmbio
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou bid de câmbio #BID-FX-1102 — USD 500.000 compra, venc. 30/04/2026', estado_posterior_historico_log: { valor_usd: 500000, tipo: 'COMPRA', taxa: 5.79, vencimento: '2026-04-30' } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou taxa do bid #BID-FX-1102 de 5,79 para 5,81', estado_anterior_historico_log: { taxa: 5.79 }, estado_posterior_historico_log: { taxa: 5.81 } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'BidCambio', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Cancelou bid #BID-FX-1100 — prazo de validade expirado', estado_anterior_historico_log: { status_historico_log: 'ATIVO', taxa: 5.75 } },
  { modulo_historico_log: 'bid-cambio', tipo_recurso_historico_log: 'Cotacao', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou cotações de 5 bancos para USD 200.000 — melhor oferta: Bradesco 5,7810' },

  // Bid Frete
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'BidFrete', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou bid de frete #BID-FR-0341 — 2 contêineres 40HC Shanghai→Santos', estado_posterior_historico_log: { containers: 2, tipo: '40HC', origem: 'Shanghai', destino: 'Santos', valor_usd: 3200 } },
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'BidFrete', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Aceitou proposta do bid #BID-FR-0341 — Maersk Line USD 2.950/container', estado_anterior_historico_log: { status_historico_log: 'ABERTO' }, estado_posterior_historico_log: { status_historico_log: 'ACEITO', armador: 'Maersk', valor_aceito: 2950 } },
  { modulo_historico_log: 'bid-frete', tipo_recurso_historico_log: 'Proposta', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Registrou 4 propostas de armadores para bid #BID-FR-0341', estado_posterior_historico_log: { propostas: 4, menor_valor: 2950, maior_valor: 3400 } },

  // Processo
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Abriu processo de importação #PROC-2026-0077 — DI vinculada ao pedido #PED-2026-0440', estado_posterior_historico_log: { numero: 'PROC-2026-0077', tipo: 'IMPORTACAO', di: 'pendente' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Atualizou status do processo #PROC-2026-0077 para DESEMBARAÇADO', estado_anterior_historico_log: { status_historico_log: 'EM_DESPACHO' }, estado_posterior_historico_log: { status_historico_log: 'DESEMBARACADO', data_desembaraco: '2026-04-03' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Documento', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Anexou BL #MAEU-9182736450 ao processo #PROC-2026-0077', estado_posterior_historico_log: { tipo: 'BL', numero: 'MAEU-9182736450', arquivo: 'bl_maeu_9182736450.pdf' } },
  { modulo_historico_log: 'processo', tipo_recurso_historico_log: 'Processo', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Falha ao registrar DI — número já utilizado em outro processo', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'ConflictError: DI 26/0001234-5 já vinculada ao processo PROC-2026-0071' },

  // Financeiro
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Pagamento', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Registrou pagamento ao exterior #PAG-EXT-0812 — USD 152.400 via Swift', estado_posterior_historico_log: { valor: 152400, moeda: 'USD', banco: 'Itaú', swift: 'ITAUBRSP' } },
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Pagamento', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Confirmou liquidação do pagamento #PAG-EXT-0812 — taxa efetiva: 5,8021', estado_anterior_historico_log: { status_historico_log: 'PENDENTE' }, estado_posterior_historico_log: { status_historico_log: 'LIQUIDADO', taxa_efetiva: 5.8021 } },
  { modulo_historico_log: 'financeiro-comex', tipo_recurso_historico_log: 'Receita', acao_historico_log: 'CONSULTA', detalhe_acao_historico_log: 'Consultou situação fiscal da empresa no Simples Nacional — regular', estado_posterior_historico_log: { situacao: 'REGULAR', cnpj: '12.345.678/0001-90' } },

  // Email
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Enviou email "Confirmação do Pedido #PED-2026-0441" para fornecedor@acme.com', estado_posterior_historico_log: { assunto: 'Confirmação do Pedido #PED-2026-0441', destinatario: 'fornecedor@acme.com', message_id: '<msg.2026040411@gravity>' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'RECEBIMENTO', detalhe_acao_historico_log: 'Recebeu resposta do fornecedor acme.com — assunto: "Re: Confirmação do Pedido"', estado_posterior_historico_log: { assunto: 'Re: Confirmação do Pedido #PED-2026-0441', remetente: 'vendas@acme-supplier.com' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Gabi enviou email automático de follow-up para cliente — 3ª tentativa', estado_posterior_historico_log: { tipo: 'follow_up', tentativa: 3, destinatario: 'cliente@empresa.com.br' } },
  { modulo_historico_log: 'email', tipo_recurso_historico_log: 'Email', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Falha ao enviar email — domínio do destinatário bloqueado', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'SMTPError: 550 5.1.1 The email address does not exist' },

  // WhatsApp
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Enviou mensagem WhatsApp para +55 11 98765-4321 — notificação de desembaraço', estado_posterior_historico_log: { telefone: '+5511987654321', tipo: 'template', template: 'desembaraco_confirmado' } },
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'RECEBIMENTO', detalhe_acao_historico_log: 'Recebeu mensagem de +55 11 98765-4321 — cliente solicitou prazo de entrega' },
  { modulo_historico_log: 'whatsapp', tipo_recurso_historico_log: 'Conversa', acao_historico_log: 'ENVIO', detalhe_acao_historico_log: 'Gabi respondeu automaticamente sobre prazo de entrega via WhatsApp' },

  // Configuração
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Configuracao', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou configuração de notificações — ativou alertas por WhatsApp', estado_anterior_historico_log: { notif_whatsapp: false, notif_email: true }, estado_posterior_historico_log: { notif_whatsapp: true, notif_email: true } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Token', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Gerou novo token de API para integração com sistema ERP externo', estado_posterior_historico_log: { nome: 'ERP SAP Production', escopo: 'read:pedidos write:pedidos', expira_em: '2027-04-04' } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Token', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Revogou token de API #tok_legacy_v1 — substituído por versão mais segura', estado_anterior_historico_log: { nome: 'ERP SAP Legacy', criado_em: '2024-01-15' } },
  { modulo_historico_log: 'configuracao', tipo_recurso_historico_log: 'Webhook', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Configurou webhook para eventos de pedido — endpoint: https://erp.empresa.com/gravity', estado_posterior_historico_log: { url: 'https://erp.empresa.com/gravity', eventos: ['pedido.criado', 'pedido.atualizado'] } },

  // Usuário
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Convidou novo usuário pedro.alves@empresa.com com role STANDARD', estado_posterior_historico_log: { email: 'pedro.alves@empresa.com', role: 'STANDARD', produto_acesso: ['pedido', 'nf-importacao'] } },
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'UPDATE', detalhe_acao_historico_log: 'Alterou permissão de pedro.alves@empresa.com de STANDARD para MASTER', estado_anterior_historico_log: { role: 'STANDARD' }, estado_posterior_historico_log: { role: 'MASTER' } },
  { modulo_historico_log: 'usuario', tipo_recurso_historico_log: 'Usuario', acao_historico_log: 'DELETE', detalhe_acao_historico_log: 'Removeu acesso do usuário saiu@empresa.com — colaborador desligado', estado_anterior_historico_log: { email: 'saiu@empresa.com', role: 'STANDARD', ativo: true } },

  // Dashboard / Relatório
  { modulo_historico_log: 'dashboard', tipo_recurso_historico_log: 'Dashboard', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Criou dashboard "Resumo Mensal de Importações — Abr/2026"', estado_posterior_historico_log: { nome: 'Resumo Mensal de Importações — Abr/2026', widgets: 8 } },
  { modulo_historico_log: 'relatorio', tipo_recurso_historico_log: 'Relatorio', acao_historico_log: 'EXPORT', detalhe_acao_historico_log: 'Exportou relatório "Posição de Estoque em Trânsito" em XLSX — 847 linhas' },
  { modulo_historico_log: 'relatorio', tipo_recurso_historico_log: 'Relatorio', acao_historico_log: 'CREATE', detalhe_acao_historico_log: 'Agendou relatório semanal automático — toda segunda às 08h00', estado_posterior_historico_log: { nome: 'Posição Semanal Pedidos', cron: '0 8 * * 1', formato: 'XLSX' } },

  // Integração / Job
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou 312 pedidos do SAP ERP para o Gravity — duração: 4.2s', estado_posterior_historico_log: { registros: 312, novos: 14, atualizados: 298, erros: 0 } },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Falha na sincronização com SAP — timeout após 30s', status_historico_log: 'FALHA', mensagem_erro_historico_log: 'TimeoutError: SAP connection timeout after 30000ms — retrying in 5min' },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Integracao', acao_historico_log: 'SYNC', detalhe_acao_historico_log: 'Sincronizou tabela de NCMs com Siscomex — sincronização parcial (3 erros)', status_historico_log: 'PARCIAL', mensagem_erro_historico_log: 'PartialSyncWarning: 3 NCMs com formato inválido foram ignorados' },
  { modulo_historico_log: 'integracao', tipo_recurso_historico_log: 'Backup', acao_historico_log: 'BACKUP', detalhe_acao_historico_log: 'Backup diário concluído — 2.4 GB comprimido para 680 MB', estado_posterior_historico_log: { tamanho_original_gb: 2.4, comprimido_mb: 680, duracao_s: 47 } },

  // Compliance / LGPD
  { modulo_historico_log: 'compliance', tipo_recurso_historico_log: 'HistoryLog', acao_historico_log: 'ANONIMIZACAO_LGPD', detalhe_acao_historico_log: 'LGPD Art.18 — 47 logs anonimizados para actor_id user_099. Motivo: solicitação de exclusão de dados pelo titular', estado_posterior_historico_log: { logs_anonimizados: 47, campos_limpos: ['actor_name', 'actor_ip'] } },
]

function gerarMockLogs(quantidade: number): AuditLog[] {
  const logs: AuditLog[] = []
  const agora = new Date()

  for (let i = 0; i < quantidade; i++) {
    const ator = ATORES[i % ATORES.length]
    const evento = EVENTOS[i % EVENTOS.length]
    const minutosAtras = i * 7 + Math.floor(i / 10) * 60
    const data = new Date(agora.getTime() - minutosAtras * 60 * 1000)

    logs.push({
      id_historico_log: `mock-${String(i + 1).padStart(4, '0')}`,
      data_criacao_historico_log: data.toISOString(),
      tipo_ator_historico_log: ator.tipo,
      id_ator_historico_log: ator.id,
      nome_ator_historico_log: ator.nome,
      ip_ator_historico_log: ator.ip,
      modulo_historico_log: evento.modulo_historico_log,
      tipo_recurso_historico_log: evento.tipo_recurso_historico_log,
      id_recurso_historico_log: `${evento.tipo_recurso_historico_log.toLowerCase()}-${String(1000 + i)}`,
      acao_historico_log: evento.acao_historico_log,
      detalhe_acao_historico_log: evento.detalhe_acao_historico_log,
      estado_anterior_historico_log: evento.estado_anterior_historico_log,
      estado_posterior_historico_log: evento.estado_posterior_historico_log,
      status_historico_log: evento.status_historico_log ?? 'SUCESSO',
      mensagem_erro_historico_log: evento.mensagem_erro_historico_log,
      hash_integridade_historico_log: `sha256mock${i.toString(16).padStart(56, '0')}`,
    })
  }

  return logs
}

const MOCK_LOGS = gerarMockLogs(320)

// ── Componente principal ──────────────────────────────────────────

export interface HistoricoProps {
  /** ID do produto — usado para filtrar logs na API (ex: 'pedido', 'lpco') */
  productId: string
  /** Base URL do serviço historico-global (ex: 'http://localhost:8030') */
  apiBaseUrl: string
  /** Usa dados mock locais em vez de chamar a API. Útil para demos e dev. */
  useMock?: boolean
  /** id_organizacao enviado via header x-id-organizacao */
  tenantId?: string
}

export function Historico({ productId, apiBaseUrl, useMock = false, tenantId }: HistoricoProps) {
  const { t } = useTranslation()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      if (useMock) {
        await new Promise(r => setTimeout(r, 400))
        setLogs(MOCK_LOGS)
      } else {
        const url = `${apiBaseUrl}/api/v1/historico/logs?id_produto_historico_log=${encodeURIComponent(productId)}&limit=50`
        const headers: Record<string, string> = {}
        if (tenantId) headers['x-id-organizacao'] = tenantId
        const res = await fetch(url, { credentials: 'include', headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as { logs?: AuditLog[]; data?: AuditLog[] } | AuditLog[]
        setLogs(Array.isArray(data) ? data : (data.logs ?? data.data ?? []))
      }
    } catch (err) {
      console.error('[Historico] Erro ao carregar logs:', err)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [productId, apiBaseUrl, useMock, tenantId])

  useEffect(() => { loadLogs() }, [loadLogs])

  // ── Colunas ────────────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<AuditLog>[] = useMemo(() => [
    {
      key: 'data_criacao_historico_log',
      label: t('admin.history.tabela.quando'),
      tipo: 'periodo',
      tooltipTitulo: t('admin.history.tabela.quando_tooltip'),
      tooltipDescricao: t('admin.history.tabela.quando_desc'),
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{formatDate(v)}</span>,
    },
    {
      key: 'nome_ator_historico_log',
      label: t('admin.history.tabela.quem'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.quem_tooltip'),
      tooltipDescricao: t('admin.history.tabela.quem_desc'),
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <BadgeAtorType tipo={item.tipo_ator_historico_log} t={t} />
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>{String(v)}</span>
        </div>
      ),
    },
    {
      key: 'acao_historico_log',
      label: t('admin.history.tabela.acao'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.acao_tooltip'),
      tooltipDescricao: t('admin.history.tabela.acao_desc'),
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {ACAO_KEY[String(v)] ? t(ACAO_KEY[String(v)]) : String(v)}
        </span>
      ),
      renderFiltroLabel: (v) => ACAO_KEY[v] ? t(ACAO_KEY[v]) : v,
      renderFiltroItem: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {ACAO_KEY[v] ? t(ACAO_KEY[v]) : v}
        </span>
      ),
    },
    {
      key: 'estado_anterior_historico_log',
      label: t('admin.history.tabela.de'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.de_tooltip'),
      tooltipDescricao: t('admin.history.tabela.de_desc'),
      render: (v, item) => {
        const before = v as Record<string, unknown> | undefined
        const after  = item.estado_posterior_historico_log as Record<string, unknown> | undefined
        if (!before || typeof before !== 'object') return <span style={{ color: '#475569', display: 'block', textAlign: 'center' }}>—</span>
        const campos = after && typeof after === 'object'
          ? Object.keys(before).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
          : Object.keys(before)
        if (campos.length === 0) return <span style={{ color: '#475569', display: 'block', textAlign: 'center' }}>—</span>
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            {campos.slice(0, 3).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: '0.7rem', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: '4px', padding: '0 5px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(before[k] ?? '—')}
                </span>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      key: 'estado_posterior_historico_log',
      label: t('admin.history.tabela.para'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.para_tooltip'),
      tooltipDescricao: t('admin.history.tabela.para_desc'),
      render: (v, item) => {
        const after  = v as Record<string, unknown> | undefined
        const before = item.estado_anterior_historico_log as Record<string, unknown> | undefined
        if (!after || typeof after !== 'object') return <span style={{ color: '#475569', display: 'block', textAlign: 'center' }}>—</span>
        const campos = before && typeof before === 'object'
          ? Object.keys(after).filter(k => JSON.stringify(after[k]) !== JSON.stringify(before[k]))
          : Object.keys(after)
        if (campos.length === 0) return <span style={{ color: '#475569', display: 'block', textAlign: 'center' }}>—</span>
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            {campos.slice(0, 3).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: '4px', padding: '0 5px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(after[k] ?? '—')}
                </span>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      key: 'modulo_historico_log',
      label: t('admin.history.tabela.modulo'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.modulo_tooltip'),
      tooltipDescricao: t('admin.history.tabela.modulo_desc'),
      render: (v, item) => {
        const mod = String(v)
        const sameAsModule = item.tipo_recurso_historico_log.toLowerCase() === mod.toLowerCase()
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {item.tipo_recurso_historico_log}
            </span>
            {!sameAsModule && (
              <span style={{
                padding: '1px 6px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.6rem', color: '#64748b', whiteSpace: 'nowrap',
              }}>
                {mod}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'status_historico_log',
      label: t('admin.history.tabela.status'),
      tipo: 'texto',
      tooltipTitulo: t('admin.history.tabela.status_tooltip'),
      tooltipDescricao: t('admin.history.tabela.status_desc'),
      render: (v) => <BadgeStatus status={v as StatusHistoricoLog} t={t} />,
      renderFiltroLabel: (v) => STATUS_KEY[v as StatusHistoricoLog] ? t(STATUS_KEY[v as StatusHistoricoLog]) : v,
      renderFiltroItem: (v) => <BadgeStatus status={v as StatusHistoricoLog} t={t} />,
    },
  ], [t])

  // ── Exportação ─────────────────────────────────────────────────

  const ACOES_EXPORT: TabelaExportAcao<AuditLog>[] = useMemo(() => [
    { label: 'Excel (.xlsx)', icone: <DownloadSimple size={14} />, onClick: (d) => void exportarLogsExcel(d, t)       },
    { label: 'CSV',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'csv', t)         },
    { label: 'TXT',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'txt', t)         },
    { label: 'XML',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'xml', t)         },
    { label: 'JSON',          icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'json', t)        },
    { label: 'PDF',           icone: <FilePdf size={14} />,        onClick: (d) => void exportarLogsPDF(d, t)        },
  ], [t])

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
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
          {t('admin.history.btn_atualizar')}
        </button>
      </div>

      <TabelaGlobal<AuditLog>
        dados={logs}
        colunas={COLUNAS}
        acoesExportacao={ACOES_EXPORT}
        idKey="id_historico_log"
        itensPorPagina={20}
        mensagemSemFiltro={t('admin.history.tabela_vazio')}
        mensagemVazio={t('admin.history.tabela_sem_filtro')}
        renderExpandido={(item) => <DetalheLog log={item} t={t} />}
        tooltipExpandir={t('admin.history.tooltip_expandir')}
        tooltipRecolher={t('admin.history.tooltip_recolher')}
      />
    </div>
  )
}

export default Historico
