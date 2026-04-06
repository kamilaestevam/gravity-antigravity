import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User, Robot, Globe, Cpu, Gear, Hash,
  ArrowsClockwise, DownloadSimple, FilePdf,
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

const ATOR_PT: Record<ActorType, string> = {
  USER: 'Usuário', API: 'API', AI: 'IA', JOB: 'Job', INTEGRATION: 'Integração',
}

const STATUS_PT: Record<EventStatus, string> = {
  SUCCESS: 'Sucesso', FAILURE: 'Falha', PARTIAL: 'Parcial',
}

const ACAO_PT: Record<string, string> = {
  CREATE: 'Criação', UPDATE: 'Alteração', DELETE: 'Exclusão',
  LOGIN: 'Login', LOGOUT: 'Logout', SESSION_REVOKED: 'Sessão Revogada',
  AUTH_FAILURE: 'Acesso Negado', EXPORT: 'Exportação', IMPORT: 'Importação',
  SYNC: 'Sincronização', CONSULTA: 'Consulta', ENVIO: 'Envio',
  RECEBIMENTO: 'Recebimento', BACKUP: 'Backup', ANONIMIZACAO_LGPD: 'LGPD Art.18',
}

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
      {ATOR_PT[tipo]}
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
      {STATUS_PT[status]}
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

async function exportarLogsExcel(dados: AuditLog[]) {
  const headers = ['Quando', 'Quem', 'Tipo', 'Ação', 'Detalhe', 'Módulo', 'Recurso', 'Status']
  const rows = dados.map(l => [
    formatDate(l.created_at), l.actor_name, l.actor_type,
    l.action, l.action_detail, l.module, l.resource_type, l.status,
  ])
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Gravity Platform'; wb.created = new Date()
  const ws = wb.addWorksheet('Histórico', { views: [{ showGridLines: true }] })
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

async function exportarLogsPDF(dados: AuditLog[]) {
  const headers = ['Quando', 'Quem', 'Tipo', 'Ação', 'Detalhe', 'Módulo', 'Recurso', 'Status']
  const rows = dados.map(l => [
    formatDate(l.created_at), l.actor_name, l.actor_type,
    l.action, l.action_detail, l.module, l.resource_type, l.status,
  ])
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(16); doc.setTextColor(30, 41, 59)
  doc.text('Histórico de Atividades', 14, 16)
  doc.setFontSize(8); doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22)
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
    doc.text(`Página ${i} de ${totalPag}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' })
  }
  doc.save('historico.pdf')
}

function exportarLogs(dados: AuditLog[], formato: 'csv' | 'excel' | 'txt' | 'json' | 'xml') {
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
  } else if (formato === 'xml') {
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const xmlRows = dados.map(l => [
      `  <log>`,
      `    <quando>${escape(formatDate(l.created_at))}</quando>`,
      `    <quem>${escape(l.actor_name)}</quem>`,
      `    <tipo>${escape(l.actor_type)}</tipo>`,
      `    <acao>${escape(l.action)}</acao>`,
      `    <detalhe>${escape(l.action_detail)}</detalhe>`,
      `    <modulo>${escape(l.module)}</modulo>`,
      `    <recurso>${escape(l.resource_type)}</recurso>`,
      `    <status>${escape(l.status)}</status>`,
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

// ── Mock data (DEV ONLY) ──────────────────────────────────────────

const ATORES: Array<{ nome: string; tipo: ActorType; id: string; ip?: string }> = [
  { nome: 'Daniel Martins', tipo: 'USER', id: 'user_001', ip: '187.45.12.88' },
  { nome: 'Ana Souza', tipo: 'USER', id: 'user_002', ip: '200.186.30.5' },
  { nome: 'Carlos Lima', tipo: 'USER', id: 'user_003', ip: '177.92.44.201' },
  { nome: 'Fernanda Costa', tipo: 'USER', id: 'user_004', ip: '189.6.77.12' },
  { nome: 'Gabi AI', tipo: 'AI', id: 'ai_gabi', ip: undefined },
  { nome: 'API Externa v2', tipo: 'API', id: 'api_ext_v2', ip: '54.230.101.5' },
  { nome: 'API Marketplace', tipo: 'API', id: 'api_market', ip: '52.11.200.14' },
  { nome: 'Cron: Receita Federal', tipo: 'JOB', id: 'job_receita', ip: undefined },
  { nome: 'Cron: Backup Diário', tipo: 'JOB', id: 'job_backup', ip: undefined },
  { nome: 'Cron: Partition Manager', tipo: 'JOB', id: 'job_partition', ip: undefined },
  { nome: 'SAP ERP Conector', tipo: 'INTEGRATION', id: 'int_sap', ip: '10.0.0.50' },
  { nome: 'Siscomex Gateway', tipo: 'INTEGRATION', id: 'int_siscomex', ip: '200.152.38.155' },
  { nome: 'Stripe Billing', tipo: 'INTEGRATION', id: 'int_stripe', ip: '54.187.174.169' },
]

const EVENTOS: Array<{
  module: string; resource_type: string; action: string; action_detail: string;
  before?: Record<string, unknown>; after?: Record<string, unknown>;
  status?: EventStatus; error_message?: string;
}> = [
  // Pedido
  { module: 'pedido', resource_type: 'Pedido', action: 'CREATE', action_detail: 'Criou o pedido #PED-2026-0441 — Acme Importações Ltda', after: { numero: 'PED-2026-0441', status: 'RASCUNHO', valor: 152400.00, moeda: 'USD' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Alterou status do pedido #PED-2026-0441 de RASCUNHO para CONFIRMADO', before: { status: 'RASCUNHO' }, after: { status: 'CONFIRMADO' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Alterou valor do pedido #PED-2026-0440 de USD 98.000 para USD 112.500', before: { valor: 98000, moeda: 'USD', incoterm: 'FOB' }, after: { valor: 112500, moeda: 'USD', incoterm: 'CIF' } },
  { module: 'pedido', resource_type: 'Pedido', action: 'DELETE', action_detail: 'Excluiu o pedido #PED-2026-0438 — cancelado pelo cliente', before: { numero: 'PED-2026-0438', status: 'RASCUNHO', valor: 45000 } },
  { module: 'pedido', resource_type: 'ItemPedido', action: 'CREATE', action_detail: 'Adicionou item NCM 8471.30.19 — Notebook Dell XPS 15" (Qtd: 50)', after: { ncm: '8471.30.19', descricao: 'Notebook Dell XPS 15"', qtd: 50, unitario: 1800 } },
  { module: 'pedido', resource_type: 'Pedido', action: 'EXPORT', action_detail: 'Exportou pedido #PED-2026-0441 em formato CSV (128 linhas)' },
  { module: 'pedido', resource_type: 'Pedido', action: 'UPDATE', action_detail: 'Falha ao atualizar pedido #PED-2026-0437 — campo obrigatório ausente', status: 'FAILURE', error_message: 'ValidationError: campo "pais_origem" é obrigatório' },

  // Auth
  { module: 'auth', resource_type: 'Session', action: 'LOGIN', action_detail: 'Login realizado com sucesso via email+senha' },
  { module: 'auth', resource_type: 'Session', action: 'LOGOUT', action_detail: 'Logout realizado — sessão encerrada pelo usuário' },
  { module: 'auth', resource_type: 'Session', action: 'SESSION_REVOKED', action_detail: 'Sessão revogada pelo administrador — inatividade de 30 dias', status: 'PARTIAL' },
  { module: 'auth', resource_type: 'Session', action: 'AUTH_FAILURE', action_detail: 'Tentativa de acesso negada — token JWT expirado', status: 'FAILURE', error_message: 'TokenExpiredError: jwt expired at 2026-04-03T22:00:00Z' },
  { module: 'auth', resource_type: 'Session', action: 'AUTH_FAILURE', action_detail: 'Tentativa de acesso a recurso sem permissão suficiente (role: STANDARD)', status: 'FAILURE', error_message: 'ForbiddenError: role STANDARD não tem acesso a /api/admin' },
  { module: 'auth', resource_type: 'Session', action: 'LOGIN', action_detail: 'Login via SSO Google Workspace' },

  // Nota Fiscal
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'CREATE', action_detail: 'Criou NF-e #55002 — Importação de equipamentos eletrônicos', after: { numero: '55002', valor: 284500.00, cfop: '3102', emitente: 'Dell Inc.' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'UPDATE', action_detail: 'Corrigiu CFOP da NF-e #55001 de 3102 para 3128', before: { cfop: '3102' }, after: { cfop: '3128' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'IMPORT', action_detail: 'Importou 14 notas fiscais via XML (lote #NF-LOTE-2026-04)', after: { quantidade: 14, formato: 'XML', tamanho_kb: 382 } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'DELETE', action_detail: 'Excluiu NF-e #54998 — duplicidade identificada', before: { numero: '54998', status: 'RASCUNHO' } },
  { module: 'nf-importacao', resource_type: 'NotaFiscal', action: 'UPDATE', action_detail: 'Falha ao processar NF-e #55003 — XML inválido', status: 'FAILURE', error_message: 'XMLParseError: elemento <infNFe> ausente no arquivo enviado' },

  // LPCO
  { module: 'lpco', resource_type: 'Licenca', action: 'CREATE', action_detail: 'Criou LPCO #LI-2026-00891 — Licença de Importação para máquinas industriais', after: { numero: 'LI-2026-00891', tipo: 'LI', ncm: '8457.10.00', valor_usd: 875000 } },
  { module: 'lpco', resource_type: 'Licenca', action: 'UPDATE', action_detail: 'Atualizou vencimento da LI #LI-2026-00891 para 30/06/2026', before: { vencimento: '2026-03-31' }, after: { vencimento: '2026-06-30' } },
  { module: 'lpco', resource_type: 'Licenca', action: 'CONSULTA', action_detail: 'Consultou status da LI #LI-2026-00890 no Siscomex — retorno: DEFERIDA' },
  { module: 'lpco', resource_type: 'Licenca', action: 'EXPORT', action_detail: 'Exportou relatório de LPCOs vencendo em 30 dias (22 registros)' },

  // SimulaCusto
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'CREATE', action_detail: 'Criou simulação #SIM-0291 — NCM 8471.30.19, origem China, valor USD 90.000', after: { ncm: '8471.30.19', origem: 'CN', valor_usd: 90000, modal: 'Marítimo' } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'UPDATE', action_detail: 'Recalculou simulação #SIM-0291 — alteração de modal para Aéreo', before: { modal: 'Marítimo', frete_usd: 1200 }, after: { modal: 'Aéreo', frete_usd: 8500 } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'CONSULTA', action_detail: 'Consultou PTAX do dia 04/04/2026 — USD/BRL: 5.7832 (fonte: BACEN)', after: { ptax: 5.7832, data: '2026-04-04', fonte: 'BACEN' } },
  { module: 'simula-custo', resource_type: 'Simulacao', action: 'EXPORT', action_detail: 'Exportou simulação #SIM-0291 em PDF para envio ao cliente' },
  { module: 'simula-custo', resource_type: 'TabelaNCM', action: 'SYNC', action_detail: 'Sincronizou tabela NCM com Siscomex — 47 registros atualizados', after: { atualizados: 47, novos: 3, removidos: 0 }, status: 'PARTIAL' },

  // Bid Câmbio
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'CREATE', action_detail: 'Criou bid de câmbio #BID-FX-1102 — USD 500.000 compra, venc. 30/04/2026', after: { valor_usd: 500000, tipo: 'COMPRA', taxa: 5.79, vencimento: '2026-04-30' } },
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'UPDATE', action_detail: 'Atualizou taxa do bid #BID-FX-1102 de 5,79 para 5,81', before: { taxa: 5.79 }, after: { taxa: 5.81 } },
  { module: 'bid-cambio', resource_type: 'BidCambio', action: 'DELETE', action_detail: 'Cancelou bid #BID-FX-1100 — prazo de validade expirado', before: { status: 'ATIVO', taxa: 5.75 } },
  { module: 'bid-cambio', resource_type: 'Cotacao', action: 'CONSULTA', action_detail: 'Consultou cotações de 5 bancos para USD 200.000 — melhor oferta: Bradesco 5,7810' },

  // Bid Frete
  { module: 'bid-frete', resource_type: 'BidFrete', action: 'CREATE', action_detail: 'Criou bid de frete #BID-FR-0341 — 2 contêineres 40HC Shanghai→Santos', after: { containers: 2, tipo: '40HC', origem: 'Shanghai', destino: 'Santos', valor_usd: 3200 } },
  { module: 'bid-frete', resource_type: 'BidFrete', action: 'UPDATE', action_detail: 'Aceitou proposta do bid #BID-FR-0341 — Maersk Line USD 2.950/container', before: { status: 'ABERTO' }, after: { status: 'ACEITO', armador: 'Maersk', valor_aceito: 2950 } },
  { module: 'bid-frete', resource_type: 'Proposta', action: 'CREATE', action_detail: 'Registrou 4 propostas de armadores para bid #BID-FR-0341', after: { propostas: 4, menor_valor: 2950, maior_valor: 3400 } },

  // Processo
  { module: 'processo', resource_type: 'Processo', action: 'CREATE', action_detail: 'Abriu processo de importação #PROC-2026-0077 — DI vinculada ao pedido #PED-2026-0440', after: { numero: 'PROC-2026-0077', tipo: 'IMPORTACAO', di: 'pendente' } },
  { module: 'processo', resource_type: 'Processo', action: 'UPDATE', action_detail: 'Atualizou status do processo #PROC-2026-0077 para DESEMBARAÇADO', before: { status: 'EM_DESPACHO' }, after: { status: 'DESEMBARACADO', data_desembaraco: '2026-04-03' } },
  { module: 'processo', resource_type: 'Documento', action: 'CREATE', action_detail: 'Anexou BL #MAEU-9182736450 ao processo #PROC-2026-0077', after: { tipo: 'BL', numero: 'MAEU-9182736450', arquivo: 'bl_maeu_9182736450.pdf' } },
  { module: 'processo', resource_type: 'Processo', action: 'UPDATE', action_detail: 'Falha ao registrar DI — número já utilizado em outro processo', status: 'FAILURE', error_message: 'ConflictError: DI 26/0001234-5 já vinculada ao processo PROC-2026-0071' },

  // Financeiro
  { module: 'financeiro-comex', resource_type: 'Pagamento', action: 'CREATE', action_detail: 'Registrou pagamento ao exterior #PAG-EXT-0812 — USD 152.400 via Swift', after: { valor: 152400, moeda: 'USD', banco: 'Itaú', swift: 'ITAUBRSP' } },
  { module: 'financeiro-comex', resource_type: 'Pagamento', action: 'UPDATE', action_detail: 'Confirmou liquidação do pagamento #PAG-EXT-0812 — taxa efetiva: 5,8021', before: { status: 'PENDENTE' }, after: { status: 'LIQUIDADO', taxa_efetiva: 5.8021 } },
  { module: 'financeiro-comex', resource_type: 'Receita', action: 'CONSULTA', action_detail: 'Consultou situação fiscal da empresa no Simples Nacional — regular', after: { situacao: 'REGULAR', cnpj: '12.345.678/0001-90' } },

  // Email
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Enviou email "Confirmação do Pedido #PED-2026-0441" para fornecedor@acme.com', after: { assunto: 'Confirmação do Pedido #PED-2026-0441', destinatario: 'fornecedor@acme.com', message_id: '<msg.2026040411@gravity>' } },
  { module: 'email', resource_type: 'Email', action: 'RECEBIMENTO', action_detail: 'Recebeu resposta do fornecedor acme.com — assunto: "Re: Confirmação do Pedido"', after: { assunto: 'Re: Confirmação do Pedido #PED-2026-0441', remetente: 'vendas@acme-supplier.com' } },
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Gabi enviou email automático de follow-up para cliente — 3ª tentativa', after: { tipo: 'follow_up', tentativa: 3, destinatario: 'cliente@empresa.com.br' } },
  { module: 'email', resource_type: 'Email', action: 'ENVIO', action_detail: 'Falha ao enviar email — domínio do destinatário bloqueado', status: 'FAILURE', error_message: 'SMTPError: 550 5.1.1 The email address does not exist' },

  // WhatsApp
  { module: 'whatsapp', resource_type: 'Conversa', action: 'ENVIO', action_detail: 'Enviou mensagem WhatsApp para +55 11 98765-4321 — notificação de desembaraço', after: { telefone: '+5511987654321', tipo: 'template', template: 'desembaraco_confirmado' } },
  { module: 'whatsapp', resource_type: 'Conversa', action: 'RECEBIMENTO', action_detail: 'Recebeu mensagem de +55 11 98765-4321 — cliente solicitou prazo de entrega' },
  { module: 'whatsapp', resource_type: 'Conversa', action: 'ENVIO', action_detail: 'Gabi respondeu automaticamente sobre prazo de entrega via WhatsApp' },

  // Configuração
  { module: 'configuracao', resource_type: 'Configuracao', action: 'UPDATE', action_detail: 'Alterou configuração de notificações — ativou alertas por WhatsApp', before: { notif_whatsapp: false, notif_email: true }, after: { notif_whatsapp: true, notif_email: true } },
  { module: 'configuracao', resource_type: 'Token', action: 'CREATE', action_detail: 'Gerou novo token de API para integração com sistema ERP externo', after: { nome: 'ERP SAP Production', escopo: 'read:pedidos write:pedidos', expira_em: '2027-04-04' } },
  { module: 'configuracao', resource_type: 'Token', action: 'DELETE', action_detail: 'Revogou token de API #tok_legacy_v1 — substituído por versão mais segura', before: { nome: 'ERP SAP Legacy', criado_em: '2024-01-15' } },
  { module: 'configuracao', resource_type: 'Webhook', action: 'CREATE', action_detail: 'Configurou webhook para eventos de pedido — endpoint: https://erp.empresa.com/gravity', after: { url: 'https://erp.empresa.com/gravity', eventos: ['pedido.criado', 'pedido.atualizado'] } },

  // Usuário
  { module: 'usuario', resource_type: 'Usuario', action: 'CREATE', action_detail: 'Convidou novo usuário pedro.alves@empresa.com com role STANDARD', after: { email: 'pedro.alves@empresa.com', role: 'STANDARD', produto_acesso: ['pedido', 'nf-importacao'] } },
  { module: 'usuario', resource_type: 'Usuario', action: 'UPDATE', action_detail: 'Alterou permissão de pedro.alves@empresa.com de STANDARD para MASTER', before: { role: 'STANDARD' }, after: { role: 'MASTER' } },
  { module: 'usuario', resource_type: 'Usuario', action: 'DELETE', action_detail: 'Removeu acesso do usuário saiu@empresa.com — colaborador desligado', before: { email: 'saiu@empresa.com', role: 'STANDARD', ativo: true } },

  // Dashboard / Relatório
  { module: 'dashboard', resource_type: 'Dashboard', action: 'CREATE', action_detail: 'Criou dashboard "Resumo Mensal de Importações — Abr/2026"', after: { nome: 'Resumo Mensal de Importações — Abr/2026', widgets: 8 } },
  { module: 'relatorio', resource_type: 'Relatorio', action: 'EXPORT', action_detail: 'Exportou relatório "Posição de Estoque em Trânsito" em XLSX — 847 linhas' },
  { module: 'relatorio', resource_type: 'Relatorio', action: 'CREATE', action_detail: 'Agendou relatório semanal automático — toda segunda às 08h00', after: { nome: 'Posição Semanal Pedidos', cron: '0 8 * * 1', formato: 'XLSX' } },

  // Integração / Job
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Sincronizou 312 pedidos do SAP ERP para o Gravity — duração: 4.2s', after: { registros: 312, novos: 14, atualizados: 298, erros: 0 } },
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Falha na sincronização com SAP — timeout após 30s', status: 'FAILURE', error_message: 'TimeoutError: SAP connection timeout after 30000ms — retrying in 5min' },
  { module: 'integracao', resource_type: 'Integracao', action: 'SYNC', action_detail: 'Sincronizou tabela de NCMs com Siscomex — sincronização parcial (3 erros)', status: 'PARTIAL', error_message: 'PartialSyncWarning: 3 NCMs com formato inválido foram ignorados' },
  { module: 'integracao', resource_type: 'Backup', action: 'BACKUP', action_detail: 'Backup diário concluído — 2.4 GB comprimido para 680 MB', after: { tamanho_original_gb: 2.4, comprimido_mb: 680, duracao_s: 47 } },

  // Compliance / LGPD
  { module: 'compliance', resource_type: 'HistoryLog', action: 'ANONIMIZACAO_LGPD', action_detail: 'LGPD Art.18 — 47 logs anonimizados para actor_id user_099. Motivo: solicitação de exclusão de dados pelo titular', after: { logs_anonimizados: 47, campos_limpos: ['actor_name', 'actor_ip'] } },
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
      id: `mock-${String(i + 1).padStart(4, '0')}`,
      created_at: data.toISOString(),
      actor_type: ator.tipo,
      actor_id: ator.id,
      actor_name: ator.nome,
      actor_ip: ator.ip,
      module: evento.module,
      resource_type: evento.resource_type,
      resource_id: `${evento.resource_type.toLowerCase()}-${String(1000 + i)}`,
      action: evento.action,
      action_detail: evento.action_detail,
      before: evento.before,
      after: evento.after,
      status: evento.status ?? 'SUCCESS',
      error_message: evento.error_message,
      integrity_hash: `sha256mock${i.toString(16).padStart(56, '0')}`,
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
  /** tenant_id enviado via header x-tenant-id */
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
        const url = `${apiBaseUrl}/api/v1/historico/logs?product_id=${encodeURIComponent(productId)}&limit=50`
        const headers: Record<string, string> = {}
        if (tenantId) headers['x-tenant-id'] = tenantId
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
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {ACAO_PT[String(v)] ?? String(v)}
        </span>
      ),
      renderFiltroLabel: (v) => ACAO_PT[v] ?? v,
      renderFiltroItem: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {ACAO_PT[v] ?? v}
        </span>
      ),
    },
    {
      key: 'before',
      label: 'De',
      tipo: 'texto',
      tooltipTitulo: 'De',
      tooltipDescricao: 'Estado do registro antes da ação.',
      render: (v, item) => {
        const before = v as Record<string, unknown> | undefined
        const after  = item.after as Record<string, unknown> | undefined
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
      key: 'after',
      label: 'Para',
      tipo: 'texto',
      tooltipTitulo: 'Para',
      tooltipDescricao: 'Estado do registro após a ação.',
      render: (v, item) => {
        const after  = v as Record<string, unknown> | undefined
        const before = item.before as Record<string, unknown> | undefined
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
      key: 'module',
      label: 'Módulo',
      tipo: 'texto',
      tooltipTitulo: 'Módulo / Recurso',
      tooltipDescricao: 'Módulo e tipo de recurso afetado pela ação.',
      render: (v, item) => {
        const mod = String(v)
        const sameAsModule = item.resource_type.toLowerCase() === mod.toLowerCase()
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {item.resource_type}
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
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Resultado da operação: Sucesso, Falha ou Parcial.',
      render: (v) => <BadgeStatus status={v as EventStatus} />,
      renderFiltroLabel: (v) => STATUS_PT[v as EventStatus] ?? v,
      renderFiltroItem: (v) => <BadgeStatus status={v as EventStatus} />,
    },
  ], [t])

  // ── Exportação ─────────────────────────────────────────────────

  const ACOES_EXPORT: TabelaExportAcao<AuditLog>[] = useMemo(() => [
    { label: 'Excel (.xlsx)', icone: <DownloadSimple size={14} />, onClick: (d) => void exportarLogsExcel(d)       },
    { label: 'CSV',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'csv')         },
    { label: 'TXT',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'txt')         },
    { label: 'XML',           icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'xml')         },
    { label: 'JSON',          icone: <DownloadSimple size={14} />, onClick: (d) => exportarLogs(d, 'json')        },
    { label: 'PDF',           icone: <FilePdf size={14} />,        onClick: (d) => void exportarLogsPDF(d)        },
  ], [])

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
