/**
 * EtapaUpload.tsx — Etapa 1 do Smart Import
 * Drag-and-drop para selecionar arquivo (xlsx/xls/csv/xml/txt/json)
 */

import React, { useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

/**
 * Estrutura rica de erro vinda do Modal pai. Cobre todos os codes do backend
 * + erros de cliente (rede, HTTP genericos). Contem sugestoes contextuais
 * por tipo de erro — render lista com bullets.
 */
export interface ErroDetalhadoUpload {
  code: string
  titulo: string
  mensagem: string
  causa?: string
  sugestoes: string[]
  retryable: boolean
  acoes?: Array<{ label: string; tipo: 'baixar_template' | 'recarregar' }>
}

interface EtapaUploadProps {
  onArquivoSelecionado: (arquivo: File) => void
  carregando: boolean
  erro: ErroDetalhadoUpload | null
  planilhas?: string[]
  planilhaSelecionada?: string
  onPlanilhaSelecionada?: (nome: string) => void
  /** Acao para baixar o template — usada quando o erro sugere fazer download. */
  onBaixarTemplate?: () => void
}

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = ['xlsx', 'xls', 'csv', 'xml', 'txt', 'json', 'pdf']
const ACCEPT_STR = EXTENSOES_ACEITAS.map(e => `.${e}`).join(',')
const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaUpload({ onArquivoSelecionado, carregando, erro, planilhas, planilhaSelecionada, onPlanilhaSelecionada, onBaixarTemplate }: EtapaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const { t } = useTranslation()

  const formatosIcones = useMemo(() => [
    { ext: 'xlsx', label: 'Excel',  descricao: t('pedido.importar.fmt_excel'), icone: <FileXls  size={28} weight="duotone" style={{ color: '#34d399' }} /> },
    { ext: 'csv',  label: 'CSV',    descricao: t('pedido.importar.fmt_csv'),   icone: <FileCsv  size={28} weight="duotone" style={{ color: '#60a5fa' }} /> },
    { ext: 'xml',  label: 'XML',    descricao: t('pedido.importar.fmt_xml'),   icone: <FileCode size={28} weight="duotone" style={{ color: '#f59e0b' }} /> },
    { ext: 'json', label: 'JSON',   descricao: t('pedido.importar.fmt_json'),  icone: <FileCode size={28} weight="duotone" style={{ color: '#fb923c' }} /> },
    { ext: 'pdf',  label: 'PDF',    descricao: t('pedido.importar.fmt_pdf'),   icone: <FilePdf  size={28} weight="duotone" style={{ color: '#f87171' }} /> },
    { ext: 'txt',  label: 'TXT',    descricao: t('pedido.importar.fmt_txt'),   icone: <File     size={28} weight="duotone" style={{ color: '#94a3b8' }} /> },
  ], [t])

  function iconeFormato(nomeArquivo: string): React.ReactNode {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
    return formatosIcones.find(f => f.ext === ext)?.icone ?? <File size={28} weight="duotone" style={{ color: '#94a3b8' }} />
  }

  function validarESelecionar(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSOES_ACEITAS.includes(ext)) {
      setErroLocal(t('pedido.importar.erro_formato_local', { ext }))
      return
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      setErroLocal(t('pedido.importar.erro_tamanho_local', { mb: TAMANHO_MAX_MB }))
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

  // Renderizacao do erro: prioriza erro rico do backend (ErroDetalhado).
  // Se for so erro local (validacao client-side), monta estrutura minima.
  const erroExibir: ErroDetalhadoUpload | null =
    erro
      ? erro
      : erroLocal
        ? {
            code: 'VALIDACAO_LOCAL',
            titulo: t('pedido.smart_import.erro_titulo'),
            mensagem: erroLocal,
            sugestoes: [
              t('pedido.smart_import.dica_formato', { extensoes: EXTENSOES_ACEITAS.join(', ') }),
              t('pedido.smart_import.dica_tamanho', { mb: TAMANHO_MAX_MB }),
            ],
            retryable: false,
          }
        : null
  const temMultiplasAbas = planilhas && planilhas.length > 1

  return (
    <div>
      {temMultiplasAbas && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('pedido.importar.multiplas_abas', { count: planilhas.length })}
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
          <span>{t('pedido.importar.aba_selecionada')}</span>
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
        aria-label={t('pedido.importar.aria_upload')}
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
            {carregando ? t('pedido.importar.analisando') : t('pedido.importar.arrastar')}
          </p>
          <p className="smart-import__upload-sub">
            {t('pedido.importar.tamanho_maximo', { mb: TAMANHO_MAX_MB })}
          </p>
        </div>

        {/* Icones de formatos aceitos com descrição */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {formatosIcones.map(({ ext, label, icone, descricao }) => (
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
          {t('pedido.importar.aviso_pdf')}<br />
          {t('pedido.importar.aviso_pdf_2')}
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
          {t('pedido.importar.nao_sabe_formato')}
        </span>
        <a
          href="/api/v1/pedidos/importacoes-inteligentes/template"
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
          {t('pedido.importar.baixar_template')}
        </a>
      </div>

      {erroExibir && (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '0.5rem',
          }}
        >
          {/* Titulo + mensagem */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#ef4444' }}>
            <Warning size={18} weight="fill" aria-hidden="true" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                {erroExibir.titulo}
              </strong>
              <span style={{ fontSize: '0.8125rem', color: '#fca5a5', display: 'block' }}>
                {erroExibir.mensagem}
              </span>
              {erroExibir.causa && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginTop: '0.25rem' }}>
                  {erroExibir.causa}
                </span>
              )}
            </div>
          </div>

          {/* Sugestoes contextuais — geradas pelo traduzirErroDetalhado */}
          {erroExibir.sugestoes.length > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(239,68,68,0.18)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted, #94a3b8)',
                  marginBottom: '0.375rem',
                }}
              >
                O QUE FAZER:
              </span>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.125rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-default, #e2e8f0)',
                  lineHeight: 1.6,
                }}
              >
                {erroExibir.sugestoes.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Botoes de acao contextuais (baixar template, recarregar) */}
          {erroExibir.acoes && erroExibir.acoes.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {erroExibir.acoes.map((a, i) => {
                if (a.tipo === 'baixar_template' && onBaixarTemplate) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={onBaixarTemplate}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99,102,241,0.15)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      📥 {a.label}
                    </button>
                  )
                }
                if (a.tipo === 'recarregar') {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => window.location.reload()}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99,102,241,0.15)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 {a.label}
                    </button>
                  )
                }
                return null
              })}
            </div>
          )}

          {/* Codigo do erro — para suporte/debug. Sempre presente. */}
          <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)' }}>
            Codigo: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>{erroExibir.code}</code>
          </div>
        </div>
      )}
    </div>
  )
}
