/**
 * PainelAnexos.tsx — Painel de Anexos do Pedido / Item
 *
 * Usado dentro do DrawerPedido e na view de item.
 * Suporta drag-and-drop, upload com barra de progresso,
 * ícone por tipo de arquivo, download e preview inline (PDF/imagem).
 *
 * Props:
 *   vinculo     — 'pedido' | 'item'
 *   vinculo_id  — ID do pedido ou item
 *   somenteLeitura — desabilita upload e exclusão
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  FilePdf,
  FileDoc,
  FileXls,
  FileCsv,
  FileZip,
  FileText,
  FileImage,
  File,
  DownloadSimple,
  Trash,
  Plus,
  Spinner,
  X,
  Eye,
} from '@phosphor-icons/react'
import type { Anexo } from '../shared/types'
import { anexosApi } from '../shared/api'
import { SelecaoExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import './PainelAnexos.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface PainelAnexosProps {
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  somenteLeitura?: boolean
}

// ── Ícone por tipo de arquivo ─────────────────────────────────────────────────

function IconeAnexo({ nomeArquivo }: { nomeArquivo: string }) {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return <FilePdf size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--pdf" aria-hidden="true" />
  if (['doc', 'docx'].includes(ext)) return <FileDoc size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--doc" aria-hidden="true" />
  if (['xls', 'xlsx'].includes(ext)) return <FileXls size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--xls" aria-hidden="true" />
  if (ext === 'csv') return <FileCsv size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--csv" aria-hidden="true" />
  if (['zip', 'rar'].includes(ext)) return <FileZip size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--zip" aria-hidden="true" />
  if (['txt', 'xml', 'json'].includes(ext)) return <FileText size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--txt" aria-hidden="true" />
  if (['png', 'jpg', 'jpeg', 'tiff', 'gif'].includes(ext)) return <FileImage size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--img" aria-hidden="true" />
  return <File size={20} weight="fill" className="painel-anexos__icone painel-anexos__icone--outros" aria-hidden="true" />
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Componente principal ──────────────────────────────────────────────────────

export function PainelAnexos({ vinculo, vinculo_id, somenteLeitura = false }: PainelAnexosProps) {
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewAnexo, setPreviewAnexo] = useState<Anexo | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [confirmarExcluirAnexo, setConfirmarExcluirAnexo] = useState<Anexo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const carregarAnexos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const dados = await anexosApi.listar(vinculo, vinculo_id)
      setAnexos(dados)
    } catch {
      setErro('Erro ao carregar anexos')
    } finally {
      setCarregando(false)
    }
  }, [vinculo, vinculo_id])

  useEffect(() => {
    carregarAnexos()
  }, [carregarAnexos])

  // Limpar URL de preview ao desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleUpload = useCallback(async (arquivos: FileList | File[]) => {
    if (somenteLeitura) return
    const lista = Array.from(arquivos)
    if (lista.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setErro(null)

    try {
      for (let i = 0; i < lista.length; i++) {
        await anexosApi.upload(vinculo, vinculo_id, lista[i])
        setUploadProgress(Math.round(((i + 1) / lista.length) * 100))
      }
      await carregarAnexos()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer upload'
      setErro(msg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [vinculo, vinculo_id, somenteLeitura, carregarAnexos])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDownload = useCallback(async (anexo: Anexo) => {
    try {
      const blob = await anexosApi.download(anexo.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = anexo.nome_arquivo
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Erro ao baixar arquivo')
    }
  }, [])

  const handlePreview = useCallback(async (anexo: Anexo) => {
    try {
      const blob = await anexosApi.download(anexo.id)
      const url = URL.createObjectURL(blob)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(url)
      setPreviewAnexo(anexo)
    } catch {
      setErro('Erro ao carregar preview')
    }
  }, [previewUrl])

  const handleExcluir = useCallback((anexo: Anexo) => {
    setConfirmarExcluirAnexo(anexo)
  }, [])

  const handleExcluirConfirmado = useCallback(async () => {
    const anexo = confirmarExcluirAnexo
    if (!anexo) return
    setConfirmarExcluirAnexo(null)
    try {
      await anexosApi.excluir(anexo.id)
      setAnexos(prev => prev.filter(a => a.id !== anexo.id))
    } catch {
      setErro('Erro ao excluir anexo')
    }
  }, [confirmarExcluirAnexo])

  const isPrevisualizavel = (anexo: Anexo) => {
    const ext = anexo.nome_arquivo.split('.').pop()?.toLowerCase() ?? ''
    return ext === 'pdf' || ['png', 'jpg', 'jpeg', 'gif'].includes(ext)
  }

  return (
    <div className="painel-anexos">
      {/* Cabeçalho */}
      <div className="painel-anexos__cabecalho">
        <span className="painel-anexos__titulo">
          Anexos {!carregando && `(${anexos.length})`}
        </span>
        {!somenteLeitura && (
          <button
            type="button"
            className="painel-anexos__btn-adicionar"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Adicionar anexo"
          >
            <Plus size={14} aria-hidden="true" />
            Adicionar
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="painel-anexos__input-oculto"
          onChange={e => e.target.files && handleUpload(e.target.files)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Área de drag-and-drop */}
      {!somenteLeitura && (
        <div
          className={`painel-anexos__dropzone${dragOver ? ' painel-anexos__dropzone--ativo' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="region"
          aria-label="Arraste arquivos aqui para fazer upload"
        >
          <span className="painel-anexos__dropzone-texto">
            Arraste arquivos aqui ou clique em Adicionar
          </span>
        </div>
      )}

      {/* Barra de progresso */}
      {uploading && (
        <div className="painel-anexos__progresso" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="painel-anexos__progresso-barra" style={{ width: `${uploadProgress}%` }} />
          <span className="painel-anexos__progresso-texto">
            <Spinner size={12} className="painel-anexos__spinner" aria-hidden="true" />
            Enviando... {uploadProgress}%
          </span>
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <div className="painel-anexos__erro" role="alert">
          {erro}
          <button type="button" onClick={() => setErro(null)} aria-label="Fechar erro">
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Lista de anexos */}
      {carregando ? (
        <div className="painel-anexos__carregando">
          <Spinner size={16} aria-hidden="true" />
          <span>Carregando...</span>
        </div>
      ) : anexos.length === 0 ? (
        <div className="painel-anexos__vazio">Nenhum anexo</div>
      ) : (
        <ul className="painel-anexos__lista" role="list">
          {anexos.map(anexo => (
            <li key={anexo.id} className="painel-anexos__item">
              <IconeAnexo nomeArquivo={anexo.nome_arquivo} />
              <div className="painel-anexos__info">
                <span className="painel-anexos__nome" title={anexo.nome_arquivo}>
                  {anexo.nome_arquivo}
                </span>
                <span className="painel-anexos__tamanho">{formatarTamanho(anexo.tamanho_bytes)}</span>
                {anexo.descricao && (
                  <span className="painel-anexos__descricao">{anexo.descricao}</span>
                )}
              </div>
              <div className="painel-anexos__acoes">
                {isPrevisualizavel(anexo) && (
                  <button
                    type="button"
                    className="painel-anexos__btn-acao"
                    onClick={() => handlePreview(anexo)}
                    aria-label={`Visualizar ${anexo.nome_arquivo}`}
                    title="Visualizar"
                  >
                    <Eye size={15} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="painel-anexos__btn-acao"
                  onClick={() => handleDownload(anexo)}
                  aria-label={`Baixar ${anexo.nome_arquivo}`}
                  title="Baixar"
                >
                  <DownloadSimple size={15} aria-hidden="true" />
                </button>
                {!somenteLeitura && (
                  <button
                    type="button"
                    className="painel-anexos__btn-acao painel-anexos__btn-excluir"
                    onClick={() => handleExcluir(anexo)}
                    aria-label={`Excluir ${anexo.nome_arquivo}`}
                    title="Excluir"
                  >
                    <Trash size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de preview */}
      {previewAnexo && previewUrl && (
        <div
          className="painel-anexos__preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${previewAnexo.nome_arquivo}`}
          onClick={() => { setPreviewAnexo(null); URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}
        >
          <div className="painel-anexos__preview-caixa" onClick={e => e.stopPropagation()}>
            <div className="painel-anexos__preview-cabecalho">
              <span>{previewAnexo.nome_arquivo}</span>
              <button
                type="button"
                onClick={() => { setPreviewAnexo(null); URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}
                aria-label="Fechar preview"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            {previewAnexo.tipo_arquivo === 'application/pdf' || previewAnexo.nome_arquivo.endsWith('.pdf') ? (
              <iframe
                src={previewUrl}
                className="painel-anexos__preview-iframe"
                title={`Preview de ${previewAnexo.nome_arquivo}`}
              />
            ) : (
              <img
                src={previewUrl}
                alt={previewAnexo.nome_arquivo}
                className="painel-anexos__preview-imagem"
              />
            )}
          </div>
        </div>
      )}
      <SelecaoExcluirGlobal
        aberto={confirmarExcluirAnexo !== null}
        titulo="Excluir anexo"
        descricao="Esta ação não pode ser desfeita."
        nomeItem={confirmarExcluirAnexo?.nome_arquivo}
        aoConfirmar={handleExcluirConfirmado}
        aoCancelar={() => setConfirmarExcluirAnexo(null)}
      />
    </div>
  )
}
