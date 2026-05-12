/**
 * ImportarBloco.tsx — Upload em lote de cotacoes via CSV/Excel
 * Sprint 2 — Importacao com preview, validacao e criacao em massa
 *
 * Skill: antigravity-design-system, antigravity-componentes
 * Phosphor icons (duotone), CSS vars, pill buttons, Plus Jakarta Sans + DM Mono
 */

import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { Coluna, RegistroTabela } from '@nucleo/tabela-global'
import {
  Upload,
  ArrowLeft,
  FileArrowUp,
  FileCsv,
  CheckCircle,
  XCircle,
  Warning,
  Trash,
  Spinner,
  ArrowClockwise,
} from '@phosphor-icons/react'

import { criarCotacao } from '../shared/api'
import type { TipoOperacao, ModalFrete, Incoterm } from '../shared/types'
import { INCOTERMS } from '../shared/types'

// ─── Constants ──────────────────────────────────────────────────────────────

const EXPECTED_COLUMNS = [
  { key: 'tipo_operacao', label: 'Tipo Operacao', example: 'IMPORTACAO ou EXPORTACAO' },
  { key: 'modal', label: 'Modal', example: 'MARITIMO, AEREO ou RODOVIARIO' },
  { key: 'origem_codigo', label: 'Origem (codigo)', example: 'BRSSZ' },
  { key: 'origem_nome', label: 'Origem (nome)', example: 'Santos' },
  { key: 'destino_codigo', label: 'Destino (codigo)', example: 'CNSHA' },
  { key: 'destino_nome', label: 'Destino (nome)', example: 'Shanghai' },
  { key: 'descricao_mercadoria', label: 'Mercadoria', example: 'Pecas automotivas' },
  { key: 'incoterm', label: 'Incoterm', example: 'FOB, CIF, EXW...' },
  { key: 'quantidade', label: 'Quantidade', example: '10' },
  { key: 'ncm', label: 'NCM (opcional)', example: '8708.99.90' },
]

const VALID_TIPOS: TipoOperacao[] = ['IMPORTACAO', 'EXPORTACAO']
const VALID_MODAIS: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']

// ─── Types ──────────────────────────────────────────────────────────────────

interface ParsedRow {
  tipo_operacao: string
  modal: string
  origem_codigo: string
  origem_nome: string
  destino_codigo: string
  destino_nome: string
  descricao_mercadoria: string
  incoterm: string
  quantidade: string
  ncm: string
}

interface ValidatedRow extends RegistroTabela {
  id: number
  linha: number
  status: 'OK' | 'Erro'
  tipo_operacao: string
  modal: string
  origem_codigo: string
  origem_nome: string
  destino_codigo: string
  destino_nome: string
  descricao_mercadoria: string
  incoterm: string
  quantidade: string
  ncm: string
  erros: string
}

type ImportPhase = 'upload' | 'preview' | 'creating' | 'done'

interface CreationResult {
  criadas: number
  erros: number
  detalhes: string[]
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateRow(row: ParsedRow): string[] {
  const erros: string[] = []

  if (!row.tipo_operacao?.trim()) {
    erros.push('tipo_operacao obrigatorio')
  } else if (!VALID_TIPOS.includes(row.tipo_operacao.trim().toUpperCase() as TipoOperacao)) {
    erros.push('tipo_operacao invalido (IMPORTACAO/EXPORTACAO)')
  }

  if (!row.modal?.trim()) {
    erros.push('modal obrigatorio')
  } else if (!VALID_MODAIS.includes(row.modal.trim().toUpperCase() as ModalFrete)) {
    erros.push('modal invalido (MARITIMO/AEREO/RODOVIARIO)')
  }

  if (!row.origem_codigo?.trim()) {
    erros.push('origem_codigo obrigatorio')
  }

  if (!row.destino_codigo?.trim()) {
    erros.push('destino_codigo obrigatorio')
  }

  if (!row.descricao_mercadoria?.trim()) {
    erros.push('descricao obrigatoria')
  }

  if (!row.incoterm?.trim()) {
    erros.push('incoterm obrigatorio')
  } else if (!INCOTERMS.includes(row.incoterm.trim().toUpperCase() as Incoterm)) {
    erros.push('incoterm invalido')
  }

  const qty = Number(row.quantidade)
  if (!row.quantidade?.trim() || isNaN(qty) || qty <= 0) {
    erros.push('quantidade deve ser > 0')
  }

  return erros
}

// ─── CSV Parsing ────────────────────────────────────────────────────────────

function parseCSV(content: string): ParsedRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const delimiter = lines[0].includes(';') ? ';' : ','
  const headerLine = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))

  const colMap: Record<string, number> = {}
  EXPECTED_COLUMNS.forEach((col) => {
    const idx = headerLine.findIndex(
      (h) => h === col.key || h === col.label.toLowerCase() || h.replace(/[_\s]/g, '') === col.key.replace(/[_\s]/g, ''),
    )
    if (idx >= 0) colMap[col.key] = idx
  })

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''))
    rows.push({
      tipo_operacao: cells[colMap['tipo_operacao'] ?? 0] ?? '',
      modal: cells[colMap['modal'] ?? 1] ?? '',
      origem_codigo: cells[colMap['origem_codigo'] ?? 2] ?? '',
      origem_nome: cells[colMap['origem_nome'] ?? 3] ?? '',
      destino_codigo: cells[colMap['destino_codigo'] ?? 4] ?? '',
      destino_nome: cells[colMap['destino_nome'] ?? 5] ?? '',
      descricao_mercadoria: cells[colMap['descricao_mercadoria'] ?? 6] ?? '',
      incoterm: cells[colMap['incoterm'] ?? 7] ?? '',
      quantidade: cells[colMap['quantidade'] ?? 8] ?? '',
      ncm: cells[colMap['ncm'] ?? 9] ?? '',
    })
  }

  return rows
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ImportarBloco() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<ImportPhase>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ValidatedRow[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<CreationResult | null>(null)

  const validCount = rows.filter((r) => r.status === 'OK').length
  const errorCount = rows.filter((r) => r.status === 'Erro').length

  // ─── File handling ──────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const parsed = parseCSV(content)
      const validated: ValidatedRow[] = parsed.map((row, idx) => {
        const erros = validateRow(row)
        return {
          id: idx + 1,
          linha: idx + 1,
          status: erros.length === 0 ? 'OK' : 'Erro',
          ...row,
          erros: erros.join('; '),
        }
      })
      setRows(validated)
      setPhase('preview')
    }
    reader.readAsText(file, 'utf-8')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  // ─── Creation ─────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    setPhase('creating')
    const validRows = rows.filter((r) => r.status === 'OK')
    let criadas = 0
    let erros = 0
    const detalhes: string[] = []

    for (const row of validRows) {
      try {
        await criarCotacao({
          tipo_operacao: row.tipo_operacao.trim().toUpperCase() as TipoOperacao,
          modal: row.modal.trim().toUpperCase() as ModalFrete,
          origem_codigo: row.origem_codigo.trim(),
          origem_nome: row.origem_nome.trim() || row.origem_codigo.trim(),
          origem_pais: '',
          destino_codigo: row.destino_codigo.trim(),
          destino_nome: row.destino_nome.trim() || row.destino_codigo.trim(),
          destino_pais: '',
          descricao_mercadoria: row.descricao_mercadoria.trim(),
          incoterm: row.incoterm.trim().toUpperCase(),
          quantidade: Number(row.quantidade),
          ncm: row.ncm?.trim() || null,
        })
        criadas++
      } catch (err) {
        erros++
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        detalhes.push(`Linha ${row.linha}: ${msg}`)
      }
    }

    setResult({ criadas, erros, detalhes })
    setPhase('done')
  }, [rows])

  const handleReset = useCallback(() => {
    setPhase('upload')
    setFileName('')
    setRows([])
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  // ─── Table columns ───────────────────────────────────────────────────

  const colunas: Coluna<ValidatedRow>[] = [
    {
      key: 'linha',
      label: '#',
      largura: '56px',
      alinhamento: 'center',
      renderizar: (v) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
          {String(v)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      largura: '90px',
      alinhamento: 'center',
      renderizar: (v) => {
        const isOk = v === 'OK'
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: isOk ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: isOk ? 'var(--success, #22c55e)' : 'var(--danger, #ef4444)',
            }}
          >
            {isOk ? <CheckCircle weight="duotone" size={13} /> : <XCircle weight="duotone" size={13} />}
            {String(v)}
          </span>
        )
      },
    },
    { key: 'tipo_operacao', label: t('bidfrete.importar.col_tipo'), largura: '110px' },
    { key: 'modal', label: t('bidfrete.importar.col_modal'), largura: '100px' },
    {
      key: 'origem_codigo',
      label: t('bidfrete.importar.col_origem'),
      largura: '90px',
      renderizar: (v) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    {
      key: 'destino_codigo',
      label: t('bidfrete.importar.col_destino'),
      largura: '90px',
      renderizar: (v) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    { key: 'descricao_mercadoria', label: t('bidfrete.importar.col_mercadoria') },
    {
      key: 'incoterm',
      label: t('bidfrete.importar.col_incoterm'),
      largura: '80px',
      alinhamento: 'center',
      renderizar: (v) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
          {String(v).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'quantidade',
      label: t('bidfrete.importar.col_qtd'),
      largura: '64px',
      alinhamento: 'right',
      renderizar: (v) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    {
      key: 'erros',
      label: t('bidfrete.importar.col_erros'),
      renderizar: (v) => {
        const text = String(v)
        if (!text) return null
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--danger, #ef4444)',
            }}
          >
            <Warning weight="duotone" size={13} />
            {text}
          </span>
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .importar-bloco-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem 2rem;
          border: 2px dashed var(--bg-elevated, #475569);
          border-radius: var(--radius-lg, 12px);
          background: var(--bg-surface, #1e293b);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          min-height: 220px;
        }
        .importar-bloco-dropzone:hover,
        .importar-bloco-dropzone.drag-over {
          border-color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.05);
        }
        .importar-bloco-dropzone.drag-over {
          border-style: solid;
        }

        .importar-bloco-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
          border: none;
        }
        .importar-bloco-pill-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .importar-bloco-pill-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .importar-bloco-pill-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .importar-bloco-pill-btn--primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .importar-bloco-pill-btn--secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .importar-bloco-pill-btn--danger {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger, #ef4444);
        }

        .importar-bloco-counter-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
        }

        .importar-bloco-cols-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .importar-bloco-cols-table th,
        .importar-bloco-cols-table td {
          padding: 0.5rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--bg-elevated, #334155);
        }
        .importar-bloco-cols-table th {
          font-weight: 600;
          color: var(--text-muted, #64748b);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .importar-bloco-cols-table td:first-child {
          font-family: 'DM Mono', monospace;
          color: var(--accent, #6366f1);
          font-weight: 500;
        }
        .importar-bloco-cols-table td:last-child {
          color: var(--text-muted, #64748b);
          font-style: italic;
        }

        .importar-bloco-result-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 2.5rem;
          border-radius: var(--radius-lg, 12px);
          background: var(--bg-surface, #1e293b);
          border: 1px solid var(--bg-elevated, #334155);
          text-align: center;
          max-width: 480px;
          margin: 0 auto;
        }

        .importar-bloco-spinner {
          animation: importar-bloco-spin 0.8s linear infinite;
        }
        @keyframes importar-bloco-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <PaginaGlobal
        cabecalho={
          <CabecalhoGlobal
            icone={<Upload weight="duotone" size={22} />}
            titulo={t('bidfrete.importar.titulo')}
            subtitulo={
              phase === 'upload'
                ? t('bidfrete.importar.subtitulo_upload')
                : phase === 'preview'
                  ? `${fileName} — ${rows.length} ${t('bidfrete.importar.linhas_carregadas')}`
                  : phase === 'creating'
                    ? t('bidfrete.importar.criando')
                    : t('bidfrete.importar.concluida')
            }
            acoes={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {phase === 'preview' && (
                  <button
                    className="importar-bloco-pill-btn importar-bloco-pill-btn--danger"
                    onClick={handleReset}
                  >
                    <Trash weight="duotone" size={14} /> {t('bidfrete.importar.limpar')}
                  </button>
                )}
                <button
                  className="importar-bloco-pill-btn importar-bloco-pill-btn--secondary"
                  onClick={() => navigate('/cotacoes')}
                >
                  <ArrowLeft weight="bold" size={14} /> {t('comum.voltar')}
                </button>
              </div>
            }
          />
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ─── Phase: Upload ──────────────────────────────────────────── */}
          {phase === 'upload' && (
            <>
              {/* Drop zone */}
              <div
                className={`importar-bloco-dropzone${dragOver ? ' drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileArrowUp
                  weight="duotone"
                  size={48}
                  style={{ color: 'var(--accent, #6366f1)', opacity: 0.7 }}
                />
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary, #f1f5f9)',
                    margin: '0 0 0.35rem 0',
                  }}>
                    {t('bidfrete.importar.dropzone_titulo')}
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted, #64748b)',
                    margin: 0,
                  }}>
                    {t('bidfrete.importar.dropzone_subtitulo')}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: 'var(--accent, #6366f1)',
                    color: '#fff',
                    marginTop: '0.25rem',
                  }}
                >
                  <FileCsv weight="duotone" size={16} /> {t('bidfrete.importar.selecionar_arquivo')}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Expected columns */}
              <div style={{
                background: 'var(--bg-surface, #1e293b)',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--bg-elevated, #334155)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--bg-elevated, #334155)',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary, #f1f5f9)',
                  }}>
                    {t('bidfrete.importar.colunas_esperadas')}
                  </p>
                </div>
                <table className="importar-bloco-cols-table">
                  <thead>
                    <tr>
                      <th>{t('bidfrete.importar.th_coluna')}</th>
                      <th>{t('bidfrete.importar.th_descricao')}</th>
                      <th>{t('bidfrete.importar.th_exemplo')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPECTED_COLUMNS.map((col) => (
                      <tr key={col.key}>
                        <td>{col.key}</td>
                        <td style={{ color: 'var(--text-secondary, #94a3b8)' }}>{col.label}</td>
                        <td>{col.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── Phase: Preview ─────────────────────────────────────────── */}
          {phase === 'preview' && (
            <>
              {/* Counters + action bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    className="importar-bloco-counter-badge"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      color: 'var(--success, #22c55e)',
                    }}
                  >
                    <CheckCircle weight="duotone" size={15} />
                    {validCount} valida{validCount !== 1 ? 's' : ''}
                  </span>
                  {errorCount > 0 && (
                    <span
                      className="importar-bloco-counter-badge"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        color: 'var(--danger, #ef4444)',
                      }}
                    >
                      <XCircle weight="duotone" size={15} />
                      {errorCount} com erro{errorCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted, #64748b)',
                    marginLeft: '0.25rem',
                  }}>
                    {rows.length} linha{rows.length !== 1 ? 's' : ''} no total
                  </span>
                </div>

                <button
                  className="importar-bloco-pill-btn importar-bloco-pill-btn--primary"
                  disabled={validCount === 0}
                  onClick={handleCreate}
                >
                  <FileArrowUp weight="duotone" size={16} />
                  {t('bidfrete.importar.criar_cotacoes', { count: validCount })}
                </button>
              </div>

              {/* Preview table */}
              <TabelaGlobal<ValidatedRow>
                idKey="id"
                colunas={colunas}
                dados={rows}
                itensPorPagina={25}
                buscaGlobal
                buscaPlaceholder={t('bidfrete.importar.buscar_placeholder')}
                mensagemVazia={t('bidfrete.importar.vazio')}
              />
            </>
          )}

          {/* ─── Phase: Creating ────────────────────────────────────────── */}
          {phase === 'creating' && (
            <div className="importar-bloco-result-card">
              <Spinner
                weight="bold"
                size={40}
                className="importar-bloco-spinner"
                style={{ color: 'var(--accent, #6366f1)' }}
              />
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary, #f1f5f9)',
              }}>
                {t('bidfrete.importar.criando')}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--text-muted, #64748b)',
              }}>
                {t('bidfrete.importar.processando', { count: validCount })}
              </p>
            </div>
          )}

          {/* ─── Phase: Done ────────────────────────────────────────────── */}
          {phase === 'done' && result && (
            <div className="importar-bloco-result-card">
              {result.erros === 0 ? (
                <CheckCircle
                  weight="duotone"
                  size={48}
                  style={{ color: 'var(--success, #22c55e)' }}
                />
              ) : (
                <Warning
                  weight="duotone"
                  size={48}
                  style={{ color: 'var(--warning, #f59e0b)' }}
                />
              )}

              <div>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #f1f5f9)',
                }}>
                  {t('bidfrete.importar.concluida')}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <span
                    className="importar-bloco-counter-badge"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      color: 'var(--success, #22c55e)',
                    }}
                  >
                    <CheckCircle weight="duotone" size={14} />
                    {result.criadas} criada{result.criadas !== 1 ? 's' : ''}
                  </span>
                  {result.erros > 0 && (
                    <span
                      className="importar-bloco-counter-badge"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        color: 'var(--danger, #ef4444)',
                      }}
                    >
                      <XCircle weight="duotone" size={14} />
                      {result.erros} erro{result.erros !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Error details */}
              {result.detalhes.length > 0 && (
                <div style={{
                  width: '100%',
                  background: 'rgba(239,68,68,0.08)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                }}>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--danger, #ef4444)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Detalhes dos erros
                  </p>
                  {result.detalhes.map((d, i) => (
                    <p
                      key={i}
                      style={{
                        margin: '0 0 0.2rem 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary, #94a3b8)',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {d}
                    </p>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="importar-bloco-pill-btn importar-bloco-pill-btn--secondary"
                  onClick={handleReset}
                >
                  <ArrowClockwise weight="duotone" size={14} /> Nova importacao
                </button>
                <button
                  className="importar-bloco-pill-btn importar-bloco-pill-btn--primary"
                  onClick={() => navigate('/cotacoes')}
                >
                  Ver cotacoes
                </button>
              </div>
            </div>
          )}

        </div>
      </PaginaGlobal>
    </>
  )
}
