/**
 * ImportarArquivo.tsx — Importacao de pedidos via arquivo
 *
 * Formatos suportados: Excel (.xlsx, .xls), CSV, XML, TXT, JSON
 * Fluxo: Upload -> Preview -> Mapeamento de colunas -> Confirmacao -> Criacao batch
 */

import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadSimple,
  FileArrowUp,
  ArrowLeft,
  Check,
  X,
  FileXls,
  FileCsv,
  FileCode,
  File,
  Warning,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Etapa = 'upload' | 'preview' | 'confirmacao'

interface PreviewRow {
  [key: string]: string | number | null
}

const FORMATOS_ACEITOS = '.xlsx,.xls,.csv,.xml,.txt,.json'

const FORMATO_ICONES: Record<string, React.ReactNode> = {
  xlsx: <FileXls size={24} weight="duotone" color="#34d399" />,
  xls: <FileXls size={24} weight="duotone" color="#34d399" />,
  csv: <FileCsv size={24} weight="duotone" color="#60a5fa" />,
  xml: <FileCode size={24} weight="duotone" color="#f59e0b" />,
  json: <FileCode size={24} weight="duotone" color="#a78bfa" />,
  txt: <File size={24} weight="duotone" color="#94a3b8" />,
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImportarArquivo() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [etapa, setEtapa] = useState<Etapa>('upload')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function getExtensao(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() ?? ''
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = getExtensao(file)
    if (!['xlsx', 'xls', 'csv', 'xml', 'txt', 'json'].includes(ext)) {
      setErro(`Formato .${ext} nao suportado. Use: Excel, CSV, XML, TXT ou JSON.`)
      return
    }

    setArquivo(file)
    setErro(null)
    handlePreview(file)
  }

  async function handlePreview(file: File) {
    setProcessando(true)
    setErro(null)
    try {
      // TODO: integrar com importacaoApi.upload(file)
      // Mock preview
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockData: PreviewRow[] = [
        { numero_pedido: 'PO-2026/010', tipo_operacao: 'importacao', exportador: 'Shanghai Co.', incoterm: 'FOB', moeda: 'USD', valor: 25000, itens: 3 },
        { numero_pedido: 'PO-2026/011', tipo_operacao: 'importacao', exportador: 'Dongguan Ltd.', incoterm: 'CIF', moeda: 'USD', valor: 18500, itens: 2 },
        { numero_pedido: 'PO-2026/012', tipo_operacao: 'exportacao', exportador: 'Berlin GmbH', incoterm: 'EXW', moeda: 'EUR', valor: 42000, itens: 5 },
      ]
      setPreviewData(mockData)
      setEtapa('preview')
    } catch {
      setErro('Erro ao processar arquivo. Verifique o formato e tente novamente.')
    } finally {
      setProcessando(false)
    }
  }

  async function handleConfirmar() {
    setProcessando(true)
    try {
      // TODO: integrar com importacaoApi.confirmar(previewData)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEtapa('confirmacao')
    } catch {
      setErro('Erro ao importar pedidos. Tente novamente.')
    } finally {
      setProcessando(false)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setArquivo(file)
      setErro(null)
      handlePreview(file)
    }
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<UploadSimple weight="duotone" size={22} />}
          titulo="Importar Pedidos"
          subtitulo="Importar pedidos a partir de arquivo (Excel, CSV, XML, TXT, JSON)"
        />
      }
      acoes={
        <BotaoGlobal
          variante="secundario"
          icone={<ArrowLeft size={16} />}
          onClick={() => navigate('/pedidos')}
        >
          Voltar
        </BotaoGlobal>
      }
    >
      {/* ── Etapa 1: Upload ─────────────────────────────────────────── */}
      {etapa === 'upload' && (
        <div
          className="ws-fade-up ws-fade-up-d1"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '4rem 2rem',
            border: '2px dashed var(--border-subtle, #333)',
            borderRadius: '0.75rem',
            background: 'var(--bg-surface, #1e1e2e)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileArrowUp weight="duotone" size={48} style={{ color: 'var(--ws-accent, #6366f1)', opacity: 0.6 }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>
              Arraste um arquivo ou clique para selecionar
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
              Formatos: Excel (.xlsx, .xls), CSV, XML, TXT, JSON
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={FORMATOS_ACEITOS}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          {processando && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-accent, #6366f1)' }}>
              Processando arquivo...
            </p>
          )}
        </div>
      )}

      {/* ── Etapa 2: Preview ────────────────────────────────────────── */}
      {etapa === 'preview' && (
        <div className="ws-fade-up ws-fade-up-d1">
          {/* Arquivo selecionado */}
          {arquivo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg-surface, #1e1e2e)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle, #333)',
            }}>
              {FORMATO_ICONES[getExtensao(arquivo)] ?? <File size={24} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {arquivo.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(arquivo.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <BotaoGlobal
                variante="secundario"
                icone={<X size={14} />}
                onClick={() => {
                  setArquivo(null)
                  setPreviewData([])
                  setEtapa('upload')
                }}
              >
                Trocar
              </BotaoGlobal>
            </div>
          )}

          {/* Tabela preview */}
          <div style={{
            overflowX: 'auto',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle, #333)',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
            }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface, #1e1e2e)' }}>
                  {previewData[0] && Object.keys(previewData[0]).map((col) => (
                    <th key={col} style={{
                      padding: '0.625rem 0.75rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--text-secondary, #94a3b8)',
                      borderBottom: '1px solid var(--border-subtle, #333)',
                      textTransform: 'uppercase',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.05em',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid var(--border-subtle, #222)',
                  }}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{
                        padding: '0.5rem 0.75rem',
                        color: 'var(--text-primary, #e2e8f0)',
                      }}>
                        {val ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginTop: '0.75rem',
          }}>
            {previewData.length} pedido(s) encontrado(s). Todos serao criados com status Draft.
          </p>

          {/* Acoes */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <BotaoGlobal
              variante="secundario"
              onClick={() => {
                setArquivo(null)
                setPreviewData([])
                setEtapa('upload')
              }}
            >
              Cancelar
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              icone={<Check size={16} />}
              onClick={handleConfirmar}
              disabled={processando}
            >
              {processando ? 'Importando...' : `Importar ${previewData.length} pedido(s)`}
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* ── Etapa 3: Confirmacao ────────────────────────────────────── */}
      {etapa === 'confirmacao' && (
        <div
          className="ws-fade-up ws-fade-up-d1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '4rem 2rem',
          }}
        >
          <Check weight="duotone" size={48} style={{ color: '#34d399' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {previewData.length} pedido(s) importado(s) com sucesso!
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Todos os pedidos foram criados com status Draft. Valide os dados e altere para Aberto.
          </p>
          <BotaoGlobal
            variante="primario"
            onClick={() => navigate('/pedidos')}
          >
            Ver Pedidos
          </BotaoGlobal>
        </div>
      )}

      {/* ── Erro ────────────────────────────────────────────────────── */}
      {erro && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          marginTop: '1rem',
          color: '#ef4444',
          fontSize: '0.8125rem',
        }}>
          <Warning size={16} weight="duotone" />
          {erro}
        </div>
      )}
    </PaginaGlobal>
  )
}
