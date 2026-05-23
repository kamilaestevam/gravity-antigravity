/**
 * ImportarBloco.tsx — Upload em lote de cotacoes via CSV/Excel
 * Sprint 2 — Importacao com preview, validacao e criacao em massa
 *
 * Skill: antigravity-design-system, antigravity-componentes
 * Phosphor icons (duotone), CSS vars, pill buttons, Plus Jakarta Sans + DM Mono
 */

import React, { useState, useCallback, useRef } from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import {
  Upload,
  ArrowLeft,
  FileArrowUp,
  FileCsv,
  CheckCircle,
  XCircle,
  Warning,
  Trash,
  ArrowClockwise,
} from '@phosphor-icons/react'

import { criarCotacao } from '../shared/api'
import type { TipoOperacao, ModalFrete, Incoterm } from '../shared/types'
import { INCOTERMS } from '../shared/types'

// ─── Constants ──────────────────────────────────────────────────────────────

const EXPECTED_COLUMNS = [
  { key: 'tipo_operacao_cotacao_bid_frete_internacional', label: 'Tipo Operacao', example: 'IMPORTACAO ou EXPORTACAO' },
  { key: 'modal_cotacao_bid_frete_internacional', label: 'Modal', example: 'MARITIMO, AEREO ou RODOVIARIO' },
  { key: 'origem_codigo_cotacao_bid_frete_internacional', label: 'Origem (codigo)', example: 'BRSSZ' },
  { key: 'origem_nome_cotacao_bid_frete_internacional', label: 'Origem (nome)', example: 'Santos' },
  { key: 'destino_codigo_cotacao_bid_frete_internacional', label: 'Destino (codigo)', example: 'CNSHA' },
  { key: 'destino_nome_cotacao_bid_frete_internacional', label: 'Destino (nome)', example: 'Shanghai' },
  { key: 'descricao_mercadoria_cotacao_bid_frete_internacional', label: 'Mercadoria', example: 'Pecas automotivas' },
  { key: 'incoterm_cotacao_bid_frete_internacional', label: 'Incoterm', example: 'FOB, CIF, EXW...' },
  { key: 'quantidade_cotacao_bid_frete_internacional', label: 'Quantidade', example: '10' },
  { key: 'ncm_cotacao_bid_frete_internacional', label: 'NCM (opcional)', example: '8708.99.90' },
]

const VALID_TIPOS: TipoOperacao[] = ['IMPORTACAO', 'EXPORTACAO']
const VALID_MODAIS: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']

// ─── Types ──────────────────────────────────────────────────────────────────

interface ParsedRow {
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  quantidade_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
}

interface ValidatedRow {
  id: number
  linha: number
  status: 'OK' | 'Erro'
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  quantidade_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
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

  if (!row.tipo_operacao_cotacao_bid_frete_internacional?.trim()) {
    erros.push('tipo_operacao_cotacao_bid_frete_internacional obrigatorio')
  } else if (!VALID_TIPOS.includes(row.tipo_operacao_cotacao_bid_frete_internacional.trim().toUpperCase() as TipoOperacao)) {
    erros.push('tipo_operacao_cotacao_bid_frete_internacional invalido (IMPORTACAO/EXPORTACAO)')
  }

  if (!row.modal_cotacao_bid_frete_internacional?.trim()) {
    erros.push('modal_cotacao_bid_frete_internacional obrigatorio')
  } else if (!VALID_MODAIS.includes(row.modal_cotacao_bid_frete_internacional.trim().toUpperCase() as ModalFrete)) {
    erros.push('modal_cotacao_bid_frete_internacional invalido (MARITIMO/AEREO/RODOVIARIO)')
  }

  if (!row.origem_codigo_cotacao_bid_frete_internacional?.trim()) {
    erros.push('origem_codigo_cotacao_bid_frete_internacional obrigatorio')
  }

  if (!row.destino_codigo_cotacao_bid_frete_internacional?.trim()) {
    erros.push('destino_codigo_cotacao_bid_frete_internacional obrigatorio')
  }

  if (!row.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()) {
    erros.push('descricao obrigatoria')
  }

  if (!row.incoterm_cotacao_bid_frete_internacional?.trim()) {
    erros.push('incoterm_cotacao_bid_frete_internacional obrigatorio')
  } else if (!INCOTERMS.includes(row.incoterm_cotacao_bid_frete_internacional.trim().toUpperCase() as Incoterm)) {
    erros.push('incoterm_cotacao_bid_frete_internacional invalido')
  }

  const qty = Number(row.quantidade_cotacao_bid_frete_internacional)
  if (!row.quantidade_cotacao_bid_frete_internacional?.trim() || isNaN(qty) || qty <= 0) {
    erros.push('quantidade_cotacao_bid_frete_internacional deve ser > 0')
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
      tipo_operacao_cotacao_bid_frete_internacional: cells[colMap['tipo_operacao_cotacao_bid_frete_internacional'] ?? 0] ?? '',
      modal_cotacao_bid_frete_internacional: cells[colMap['modal_cotacao_bid_frete_internacional'] ?? 1] ?? '',
      origem_codigo_cotacao_bid_frete_internacional: cells[colMap['origem_codigo_cotacao_bid_frete_internacional'] ?? 2] ?? '',
      origem_nome_cotacao_bid_frete_internacional: cells[colMap['origem_nome_cotacao_bid_frete_internacional'] ?? 3] ?? '',
      destino_codigo_cotacao_bid_frete_internacional: cells[colMap['destino_codigo_cotacao_bid_frete_internacional'] ?? 4] ?? '',
      destino_nome_cotacao_bid_frete_internacional: cells[colMap['destino_nome_cotacao_bid_frete_internacional'] ?? 5] ?? '',
      descricao_mercadoria_cotacao_bid_frete_internacional: cells[colMap['descricao_mercadoria_cotacao_bid_frete_internacional'] ?? 6] ?? '',
      incoterm_cotacao_bid_frete_internacional: cells[colMap['incoterm_cotacao_bid_frete_internacional'] ?? 7] ?? '',
      quantidade_cotacao_bid_frete_internacional: cells[colMap['quantidade_cotacao_bid_frete_internacional'] ?? 8] ?? '',
      ncm_cotacao_bid_frete_internacional: cells[colMap['ncm_cotacao_bid_frete_internacional'] ?? 9] ?? '',
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
          tipo_operacao_cotacao_bid_frete_internacional: row.tipo_operacao_cotacao_bid_frete_internacional.trim().toUpperCase() as TipoOperacao,
          modal_cotacao_bid_frete_internacional: row.modal_cotacao_bid_frete_internacional.trim().toUpperCase() as ModalFrete,
          origem_codigo_cotacao_bid_frete_internacional: row.origem_codigo_cotacao_bid_frete_internacional.trim(),
          origem_nome_cotacao_bid_frete_internacional: row.origem_nome_cotacao_bid_frete_internacional.trim() || row.origem_codigo_cotacao_bid_frete_internacional.trim(),
          origem_pais_cotacao_bid_frete_internacional: '',
          destino_codigo_cotacao_bid_frete_internacional: row.destino_codigo_cotacao_bid_frete_internacional.trim(),
          destino_nome_cotacao_bid_frete_internacional: row.destino_nome_cotacao_bid_frete_internacional.trim() || row.destino_codigo_cotacao_bid_frete_internacional.trim(),
          destino_pais_cotacao_bid_frete_internacional: '',
          descricao_mercadoria_cotacao_bid_frete_internacional: row.descricao_mercadoria_cotacao_bid_frete_internacional.trim(),
          incoterm_cotacao_bid_frete_internacional: row.incoterm_cotacao_bid_frete_internacional.trim().toUpperCase(),
          quantidade_cotacao_bid_frete_internacional: Number(row.quantidade_cotacao_bid_frete_internacional),
          ncm_cotacao_bid_frete_internacional: row.ncm_cotacao_bid_frete_internacional?.trim() || null,
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

  const colunas: TabelaGlobalColuna<any>[] = [
    {
      key: 'linha',
      label: '#',
      tipo: 'numero',
      largura: 56,
      align: 'center',
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
          {String(v)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 90,
      align: 'center',
      render: (v: unknown) => {
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
    { key: 'tipo_operacao_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_tipo'), tipo: 'texto', largura: 110 },
    { key: 'modal_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_modal'), tipo: 'texto', largura: 100 },
    {
      key: 'origem_codigo_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_origem'),
      tipo: 'texto',
      largura: 90,
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    {
      key: 'destino_codigo_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_destino'),
      tipo: 'texto',
      largura: 90,
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    { key: 'descricao_mercadoria_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_mercadoria'), tipo: 'texto' },
    {
      key: 'incoterm_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_incoterm'),
      tipo: 'texto',
      largura: 80,
      align: 'center',
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
          {String(v).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'quantidade_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_qtd'),
      tipo: 'numero',
      largura: 64,
      align: 'right',
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>
      ),
    },
    {
      key: 'erros',
      label: t('bidfrete.importar.col_erros'),
      tipo: 'texto',
      render: (v: unknown) => {
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
                  onClick={() => navigate('/produto/bid-frete/cotacoes')}
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
              <TabelaGlobal
                idKey="id"
                colunas={colunas}
                dados={rows}
                mensagemVazio={t('bidfrete.importar.vazio')}
                tooltipBusca={t('bidfrete.importar.buscar_placeholder')}
              />
            </>
          )}

          {/* ─── Phase: Creating ────────────────────────────────────────── */}
          {phase === 'creating' && (
            <div className="importar-bloco-result-card">
              <GravityLoader texto={t('bidfrete.importar.criando')} />
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
                  onClick={() => navigate('/produto/bid-frete/cotacoes')}
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
