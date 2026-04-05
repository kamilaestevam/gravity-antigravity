/**
 * EtapaUpload.tsx — Etapa 1 do Smart Import
 * Drag-and-drop para selecionar arquivo (xlsx/xls/csv/xml/txt/json)
 */

import React, { useRef, useState } from 'react'
import {
  FileArrowUp,
  FileXls,
  FileCsv,
  FileCode,
  FilePdf,
  File,
  Warning,
} from '@phosphor-icons/react'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaUploadProps {
  onArquivoSelecionado: (arquivo: File) => void
  carregando: boolean
  erro: string | null
  planilhas?: string[]
  planilhaSelecionada?: string
  onPlanilhaSelecionada?: (nome: string) => void
}

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = ['xlsx', 'xls', 'csv', 'xml', 'txt', 'json', 'pdf']
const ACCEPT_STR = EXTENSOES_ACEITAS.map(e => `.${e}`).join(',')
const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

const FORMATOS_ICONES: { ext: string; label: string; icone: React.ReactNode; descricao: string }[] = [
  { ext: 'xlsx', label: 'Excel',  descricao: 'Excel (.xlsx, .xls) — recomendado',                                        icone: <FileXls  size={28} weight="duotone" style={{ color: '#34d399' }} /> },
  { ext: 'csv',  label: 'CSV',    descricao: 'CSV — separado por vírgula, ponto-e-vírgula ou tab',                       icone: <FileCsv  size={28} weight="duotone" style={{ color: '#60a5fa' }} /> },
  { ext: 'xml',  label: 'XML',    descricao: 'XML — tags simples, um nível',                                             icone: <FileCode size={28} weight="duotone" style={{ color: '#f59e0b' }} /> },
  { ext: 'json', label: 'JSON',   descricao: 'JSON — array de objetos',                                                  icone: <FileCode size={28} weight="duotone" style={{ color: '#fb923c' }} /> },
  { ext: 'pdf',  label: 'PDF',    descricao: 'PDF — somente com texto selecionável. PDFs escaneados não são suportados', icone: <FilePdf  size={28} weight="duotone" style={{ color: '#f87171' }} /> },
  { ext: 'txt',  label: 'TXT',    descricao: 'TXT — texto tabulado',                                                    icone: <File     size={28} weight="duotone" style={{ color: '#94a3b8' }} /> },
]

function iconeFormato(nomeArquivo: string): React.ReactNode {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  return FORMATOS_ICONES.find(f => f.ext === ext)?.icone ?? <File size={28} weight="duotone" style={{ color: '#94a3b8' }} />
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaUpload({ onArquivoSelecionado, carregando, erro, planilhas, planilhaSelecionada, onPlanilhaSelecionada }: EtapaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  function validarESelecionar(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSOES_ACEITAS.includes(ext)) {
      setErroLocal(`Formato .${ext} nao suportado. Use: Excel, CSV, XML, TXT, JSON ou PDF.`)
      return
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      setErroLocal(`Arquivo muito grande. Tamanho maximo: ${TAMANHO_MAX_MB}MB.`)
      return
    }
    setErroLocal(null)
    onArquivoSelecionado(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validarESelecionar(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validarESelecionar(file)
  }

  const mensagemErro = erroLocal ?? erro

  const temMultiplasAbas = planilhas && planilhas.length > 1

  return (
    <div>
      {temMultiplasAbas && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Este arquivo tem {planilhas.length} abas. Selecione qual importar:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {planilhas.map(nome => (
              <button
                key={nome}
                type="button"
                className="smart-import__filtro-btn"
                onClick={() => onPlanilhaSelecionada?.(nome)}
                style={{ fontWeight: 500 }}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {planilhaSelecionada && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <span>Aba selecionada:</span>
          <span className="smart-import__badge-memoria">{planilhaSelecionada}</span>
        </div>
      )}

      {(!temMultiplasAbas || planilhaSelecionada) && (
      <div
        className={`smart-import__upload-area${dragOver ? ' smart-import__upload-area--drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !carregando && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Area de upload — clique ou arraste um arquivo"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <FileArrowUp
          size={48}
          weight="duotone"
          className="smart-import__upload-icone"
          aria-hidden="true"
        />
        <div style={{ textAlign: 'center' }}>
          <p className="smart-import__upload-titulo">
            {carregando ? 'Analisando arquivo...' : 'Arraste um arquivo ou clique para selecionar'}
          </p>
          <p className="smart-import__upload-sub">
            Tamanho máximo: {TAMANHO_MAX_MB}MB
          </p>
        </div>

        {/* Icones de formatos aceitos com descrição */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {FORMATOS_ICONES.map(({ ext, label, icone, descricao }) => (
            <div key={ext} title={descricao} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'default', opacity: 0.75 }}>
              {icone}
              <span style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Aviso PDF */}
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
          ⚠ PDF: apenas arquivos com texto selecionável. PDFs escaneados (imagem) não são suportados.<br />
          Arquivos salvos como "página web" (.html) não são aceitos mesmo com extensão .pdf
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STR}
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Não sabe qual formato usar?
        </span>
        <a
          href="/api/v1/pedidos/smart-import/template"
          download="template-importacao-pedidos.xlsx"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle, #333)',
            background: 'transparent',
            color: 'var(--text-secondary, #94a3b8)',
            fontSize: '0.8125rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ws-accent, #6366f1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary, #94a3b8)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-subtle, #333)' }}
        >
          ↓ Baixar planilha modelo (.xlsx)
        </a>
      </div>

      {mensagemErro && (
        <div className="smart-import__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {mensagemErro}
        </div>
      )}
    </div>
  )
}
