/**
 * CelulaAnexosColuna.tsx — Célula interativa para colunas do tipo 'anexo'
 *
 * Exibe um ícone de clipe com contagem de arquivos. Ao clicar, abre um
 * mini-painel inline para upload, visualização e exclusão dos arquivos
 * vinculados àquela coluna específica (via categoria = coluna.id).
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Paperclip, Upload, Trash, Download, X } from '@phosphor-icons/react'
import type { Anexo } from '../../shared/types'
import { anexosApi } from '../../shared/api'
import './CelulaAnexosColuna.css'

interface CelulaAnexosColunaProps {
  /** ID do vínculo (ex: pedido.id ou item.id) */
  vinculo_id: string
  /** 'pedido' ou 'item' */
  vinculo: 'pedido' | 'item'
  /** ID da coluna customizada — usado como categoria do anexo */
  colunaId: string
  /** Nome da coluna — exibido no cabeçalho do painel */
  colunaNome: string
}

export function CelulaAnexosColuna({
  vinculo_id,
  vinculo,
  colunaId,
  colunaNome,
}: CelulaAnexosColunaProps) {
  const [aberto, setAberto]           = useState(false)
  const [carregando, setCarregando]   = useState(false)
  const [enviando, setEnviando]       = useState(false)
  const [anexos, setAnexos]           = useState<Anexo[] | null>(null)
  const [erro, setErro]               = useState<string | null>(null)
  const panelRef                      = useRef<HTMLDivElement>(null)
  const inputFileRef                  = useRef<HTMLInputElement>(null)

  // Filtra apenas os anexos desta coluna
  const anexosColuna = anexos?.filter(a => a.categoria === colunaId) ?? []

  const carregar = useCallback(async () => {
    if (carregando) return
    setCarregando(true)
    setErro(null)
    try {
      const todos = await anexosApi.listar(vinculo, vinculo_id)
      setAnexos(todos)
    } catch {
      setErro('Erro ao carregar arquivos.')
    } finally {
      setCarregando(false)
    }
  }, [vinculo, vinculo_id, carregando])

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!aberto && anexos === null) {
      carregar()
    }
    setAberto(prev => !prev)
  }, [aberto, anexos, carregar])

  const handleUpload = useCallback(async (arquivo: File) => {
    setEnviando(true)
    setErro(null)
    try {
      await anexosApi.upload(vinculo, vinculo_id, arquivo, undefined, colunaId)
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar arquivo.')
    } finally {
      setEnviando(false)
    }
  }, [vinculo, vinculo_id, colunaId, carregar])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) handleUpload(arquivo)
    e.target.value = ''
  }, [handleUpload])

  const handleExcluir = useCallback(async (id: string) => {
    setErro(null)
    try {
      await anexosApi.excluir(id)
      setAnexos(prev => prev?.filter(a => a.id !== id) ?? null)
    } catch {
      setErro('Erro ao excluir arquivo.')
    }
  }, [])

  const handleDownload = useCallback(async (anexo: Anexo) => {
    try {
      const blob = await anexosApi.download(anexo.id)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = anexo.nome_arquivo
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Erro ao baixar arquivo.')
    }
  }, [])

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  const contagem = anexosColuna.length

  return (
    <div className="cac-raiz" ref={panelRef}>
      {/* Botão trigger */}
      <button
        type="button"
        className={['cac-trigger', contagem > 0 ? 'cac-trigger--com-anexos' : ''].filter(Boolean).join(' ')}
        onClick={handleToggle}
        title={contagem > 0 ? `${contagem} arquivo${contagem > 1 ? 's' : ''} anexado${contagem > 1 ? 's' : ''}` : 'Anexar arquivo'}
        aria-label={`${colunaNome}: ${contagem} arquivo${contagem > 1 ? 's' : ''}`}
        aria-expanded={aberto}
      >
        <Paperclip size={14} weight={contagem > 0 ? 'fill' : 'regular'} />
        {contagem > 0 && <span className="cac-badge">{contagem}</span>}
      </button>

      {/* Painel dropdown */}
      {aberto && (
        <div className="cac-painel" role="dialog" aria-label={`Arquivos — ${colunaNome}`}>
          {/* Cabeçalho */}
          <div className="cac-painel-header">
            <span className="cac-painel-titulo">{colunaNome}</span>
            <button
              type="button"
              className="cac-painel-fechar"
              onClick={() => setAberto(false)}
              aria-label="Fechar painel de anexos"
            >
              <X size={13} weight="bold" />
            </button>
          </div>

          {/* Lista de arquivos */}
          <div className="cac-lista">
            {carregando && <p className="cac-info">Carregando...</p>}
            {!carregando && anexosColuna.length === 0 && (
              <p className="cac-info cac-info--vazio">Nenhum arquivo anexado</p>
            )}
            {!carregando && anexosColuna.map(a => (
              <div key={a.id} className="cac-item">
                <Paperclip size={12} className="cac-item-icone" />
                <span className="cac-item-nome" title={a.nome_arquivo}>{a.nome_arquivo}</span>
                <button
                  type="button"
                  className="cac-item-btn"
                  onClick={() => handleDownload(a)}
                  title="Baixar"
                  aria-label={`Baixar ${a.nome_arquivo}`}
                >
                  <Download size={12} />
                </button>
                <button
                  type="button"
                  className="cac-item-btn cac-item-btn--excluir"
                  onClick={() => handleExcluir(a.id)}
                  title="Excluir"
                  aria-label={`Excluir ${a.nome_arquivo}`}
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Erro */}
          {erro && <p className="cac-erro">{erro}</p>}

          {/* Upload */}
          <div className="cac-upload">
            <input
              ref={inputFileRef}
              type="file"
              className="cac-input-file"
              onChange={handleFileChange}
              aria-label="Selecionar arquivo para upload"
            />
            <button
              type="button"
              className="cac-btn-upload"
              onClick={() => inputFileRef.current?.click()}
              disabled={enviando}
              aria-label="Anexar arquivo"
            >
              <Upload size={12} />
              {enviando ? 'Enviando...' : 'Anexar arquivo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
