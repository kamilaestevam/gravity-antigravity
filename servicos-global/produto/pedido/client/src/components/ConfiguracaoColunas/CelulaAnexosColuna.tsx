/**
 * CelulaAnexosColuna.tsx — Célula interativa para colunas do tipo 'anexo'
 *
 * Exibe um ícone de clipe com contagem de arquivos. Ao clicar, abre um
 * painel flutuante (portal) para upload, visualização e exclusão dos arquivos
 * vinculados àquela coluna específica (via categoria = coluna.id).
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Paperclip, Upload, Trash, Download, X, FloppyDisk } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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

const LARGURA_PAINEL_PX = 340

export function CelulaAnexosColuna({
  vinculo_id,
  vinculo,
  colunaId,
  colunaNome,
}: CelulaAnexosColunaProps) {
  const { t } = useTranslation()
  const [aberto, setAberto]           = useState(false)
  const [carregando, setCarregando]   = useState(false)
  const [enviando, setEnviando]       = useState(false)
  const [anexos, setAnexos]           = useState<Anexo[] | null>(null)
  const [erro, setErro]               = useState<string | null>(null)
  const [posPainel, setPosPainel]     = useState({ top: 0, left: 0 })
  const triggerRef                    = useRef<HTMLButtonElement>(null)
  const panelRef                      = useRef<HTMLDivElement>(null)
  const inputFileRef                  = useRef<HTMLInputElement>(null)

  const anexosColuna = anexos?.filter(a => a.categoria === colunaId) ?? []

  const carregar = useCallback(async () => {
    if (carregando) return
    setCarregando(true)
    setErro(null)
    try {
      const todos = await anexosApi.listar(vinculo, vinculo_id)
      setAnexos(todos)
    } catch {
      setErro(t('pedido.cel_anexos.erro_carregar'))
    } finally {
      setCarregando(false)
    }
  }, [vinculo, vinculo_id, carregando, t])

  const posicionarPainel = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const metade = LARGURA_PAINEL_PX / 2
    const margem = 8
    const left = Math.max(
      margem + metade,
      Math.min(r.left + r.width / 2, window.innerWidth - margem - metade),
    )
    setPosPainel({ top: r.bottom + 4, left })
  }, [])

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!aberto) {
      posicionarPainel()
      if (anexos === null) void carregar()
      setAberto(true)
      return
    }
    setAberto(false)
  }, [aberto, anexos, carregar, posicionarPainel])

  const handleUpload = useCallback(async (arquivo: File) => {
    setEnviando(true)
    setErro(null)
    try {
      await anexosApi.upload(vinculo, vinculo_id, arquivo, undefined, colunaId)
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : t('pedido.cel_anexos.erro_enviar'))
    } finally {
      setEnviando(false)
    }
  }, [vinculo, vinculo_id, colunaId, carregar, t])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) void handleUpload(arquivo)
    e.target.value = ''
  }, [handleUpload])

  const handleExcluir = useCallback(async (id: string) => {
    setErro(null)
    try {
      await anexosApi.excluir(id)
      setAnexos(prev => prev?.filter(a => a.id !== id) ?? null)
    } catch {
      setErro(t('pedido.cel_anexos.erro_excluir'))
    }
  }, [t])

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
      setErro(t('pedido.cel_anexos.erro_baixar'))
    }
  }, [t])

  useEffect(() => {
    let ativo = true
    void (async () => {
      try {
        const todos = await anexosApi.listar(vinculo, vinculo_id)
        if (ativo) setAnexos(todos)
      } catch {
        if (ativo) setAnexos([])
      }
    })()
    return () => { ativo = false }
  }, [vinculo, vinculo_id, colunaId])

  useEffect(() => {
    if (!aberto) return
    const reposicionar = () => posicionarPainel()
    window.addEventListener('resize', reposicionar)
    window.addEventListener('scroll', reposicionar, true)
    return () => {
      window.removeEventListener('resize', reposicionar)
      window.removeEventListener('scroll', reposicionar, true)
    }
  }, [aberto, posicionarPainel])

  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      const alvo = e.target as Node
      if (triggerRef.current?.contains(alvo)) return
      if (panelRef.current?.contains(alvo)) return
      setAberto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  const contagem = anexosColuna.length

  const painel = aberto ? (
    <div
      ref={panelRef}
      className="cac-painel cac-painel--portal"
      role="dialog"
      aria-label={t('pedido.cel_anexos.painel_aria', { coluna: colunaNome })}
      style={{
        position: 'fixed',
        top: posPainel.top,
        left: posPainel.left,
        transform: 'translateX(-50%)',
        zIndex: 10050,
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <div className="cac-painel-header">
        <span className="cac-painel-titulo">{colunaNome}</span>
        <button
          type="button"
          className="cac-painel-fechar"
          onClick={() => setAberto(false)}
          aria-label={t('pedido.cel_anexos.fechar_painel')}
        >
          <X size={13} weight="bold" />
        </button>
      </div>

      <div className="cac-lista">
        {carregando && <p className="cac-info">{t('comum.carregando')}</p>}
        {!carregando && anexosColuna.length === 0 && (
          <button
            type="button"
            className="cac-vazio"
            disabled={enviando}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              inputFileRef.current?.click()
            }}
            aria-label={t('pedido.cel_anexos.continuar_anexando')}
          >
            <Paperclip size={22} weight="duotone" className="cac-vazio-icone" aria-hidden />
            <span className="cac-info cac-info--vazio">{t('pedido.cel_anexos.nenhum_arquivo')}</span>
          </button>
        )}
        {!carregando && anexosColuna.map(a => (
          <div key={a.id} className="cac-item">
            <Paperclip size={12} className="cac-item-icone" />
            <span className="cac-item-nome" title={a.nome_arquivo}>{a.nome_arquivo}</span>
            <button
              type="button"
              className="cac-item-btn"
              onClick={() => void handleDownload(a)}
              title={t('pedido.cel_anexos.baixar')}
              aria-label={t('pedido.cel_anexos.baixar_arquivo', { nome: a.nome_arquivo })}
            >
              <Download size={12} />
            </button>
            <button
              type="button"
              className="cac-item-btn cac-item-btn--excluir"
              onClick={() => void handleExcluir(a.id)}
              title={t('pedido.cel_anexos.excluir')}
              aria-label={t('pedido.cel_anexos.excluir_arquivo', { nome: a.nome_arquivo })}
            >
              <Trash size={12} />
            </button>
          </div>
        ))}
      </div>

      {erro && <p className="cac-erro">{erro}</p>}

      <input
        ref={inputFileRef}
        type="file"
        className="cac-input-file"
        onChange={handleFileChange}
        aria-label={t('pedido.cel_anexos.selecionar_arquivo')}
      />

      <div className="cac-rodape">
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<Upload size={13} weight="bold" />}
          onClick={() => inputFileRef.current?.click()}
          disabled={carregando}
          carregando={enviando}
          textoCarregando={t('pedido.cel_anexos.enviando')}
          aria-label={t('pedido.cel_anexos.continuar_anexando')}
        >
          {t('pedido.cel_anexos.continuar_anexando')}
        </BotaoGlobal>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<FloppyDisk size={13} weight="bold" />}
          onClick={() => setAberto(false)}
          disabled={enviando}
          aria-label={t('pedido.cel_anexos.salvar')}
        >
          {t('pedido.cel_anexos.salvar')}
        </BotaoGlobal>
      </div>
    </div>
  ) : null

  return (
    <div
      className="cac-raiz"
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        className={['cac-trigger', contagem > 0 ? 'cac-trigger--com-anexos' : ''].filter(Boolean).join(' ')}
        onMouseDown={e => e.stopPropagation()}
        onClick={handleToggle}
        aria-label={t('pedido.cel_anexos.coluna_arquivos_aria', { coluna: colunaNome, count: contagem })}
        aria-expanded={aberto}
      >
        <Paperclip size={14} weight={contagem > 0 ? 'fill' : 'regular'} />
        {contagem > 0 && <span className="cac-badge">{contagem}</span>}
      </button>

      {typeof document !== 'undefined' && painel ? createPortal(painel, document.body) : null}
    </div>
  )
}
