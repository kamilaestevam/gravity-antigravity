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
  File,
  Warning,
} from '@phosphor-icons/react'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaUploadProps {
  onArquivoSelecionado: (arquivo: File) => void
  carregando: boolean
  erro: string | null
}

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = ['xlsx', 'xls', 'csv', 'xml', 'txt', 'json']
const ACCEPT_STR = EXTENSOES_ACEITAS.map(e => `.${e}`).join(',')
const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

function iconeFormato(nomeArquivo: string): React.ReactNode {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  switch (ext) {
    case 'xlsx':
    case 'xls':  return <FileXls size={24} weight="duotone" style={{ color: '#34d399' }} />
    case 'csv':  return <FileCsv size={24} weight="duotone" style={{ color: '#60a5fa' }} />
    case 'xml':
    case 'json': return <FileCode size={24} weight="duotone" style={{ color: '#f59e0b' }} />
    default:     return <File size={24} weight="duotone" style={{ color: '#94a3b8' }} />
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaUpload({ onArquivoSelecionado, carregando, erro }: EtapaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  function validarESelecionar(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSOES_ACEITAS.includes(ext)) {
      setErroLocal(`Formato .${ext} nao suportado. Use: Excel, CSV, XML, TXT ou JSON.`)
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

  return (
    <div>
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
            Formatos aceitos: Excel (.xlsx, .xls), CSV, XML, TXT, JSON<br />
            Tamanho maximo: {TAMANHO_MAX_MB}MB
          </p>
        </div>

        {/* Icones de formatos aceitos */}
        <div style={{ display: 'flex', gap: '0.75rem', opacity: 0.6 }}>
          {['arquivo.xlsx','arquivo.csv','arquivo.xml','arquivo.json'].map(n => (
            <span key={n} title={n.split('.').pop()}>
              {iconeFormato(n)}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STR}
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
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
