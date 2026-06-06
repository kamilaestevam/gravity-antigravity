/**
 * ModalSeletorImportadorLista — troca de importador na Lista (exportação).
 * Lista importadores da organização; atalho para Configurador → Fornecedores.
 */

import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, Package, ArrowSquareOut } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { cadastrosApi, type Fornecedor } from '../../shared/cadastrosApi'
import { urlGerenciarFornecedores } from './urlsDeepLinkConfigurador'

export interface ModalSeletorImportadorListaProps {
  aberto: boolean
  nomeWorkspace: string
  importadorAtualId: string | null
  onFechar: () => void
  onConfirmar: (idFornecedor: string, nomeFornecedor: string) => void | Promise<void>
}

export function ModalSeletorImportadorLista({
  aberto,
  nomeWorkspace,
  importadorAtualId,
  onFechar,
  onConfirmar,
}: ModalSeletorImportadorListaProps) {
  const { t } = useTranslation()
  const [itens, setItens] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [selecionadoId, setSelecionadoId] = useState<string | null>(importadorAtualId)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setSelecionadoId(importadorAtualId)
    setErro(null)
    setCarregando(true)
    cadastrosApi.listarImportadores()
      .then((res) => setItens(res.itens))
      .catch((err: unknown) => {
        setErro(err instanceof Error ? err.message : t('pedido.lista.modal_importador.erro_carregar'))
      })
      .finally(() => setCarregando(false))
  }, [aberto, importadorAtualId, t])

  const confirmar = useCallback(async () => {
    if (!selecionadoId) return
    const item = itens.find(i => i.id_fornecedor === selecionadoId)
    if (!item) return
    setSalvando(true)
    try {
      await onConfirmar(item.id_fornecedor, item.nome_fornecedor)
      onFechar()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : t('pedido.lista.modal_importador.erro_salvar'))
    } finally {
      setSalvando(false)
    }
  }, [itens, onConfirmar, onFechar, selecionadoId, t])

  if (!aberto) return null

  const urlConfig = `${urlGerenciarFornecedores()}?retorno=${encodeURIComponent(window.location.href)}`

  return ReactDOM.createPortal(
    <div
      className="mg-overlay"
      role="presentation"
      onClick={onFechar}
      style={{ zIndex: 12000 }}
    >
      <div
        role="dialog"
        aria-labelledby="modal-seletor-importador-titulo"
        className="mg-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '28rem', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 id="modal-seletor-importador-titulo" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              {t('pedido.lista.modal_importador.titulo')}
            </h2>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('pedido.lista.modal_importador.subtitulo_workspace', { nome: nomeWorkspace })}
            </p>
          </div>
          <button type="button" onClick={onFechar} aria-label={t('pedido.lista.modal_importador.fechar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {carregando ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('pedido.lista.modal_importador.carregando')}</p>
        ) : erro ? (
          <p style={{ fontSize: '0.875rem', color: '#f87171' }}>{erro}</p>
        ) : itens.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('pedido.lista.modal_importador.vazio')}</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '16rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {itens.map((item) => {
              const ativo = selecionadoId === item.id_fornecedor
              return (
                <li key={item.id_fornecedor}>
                  <button
                    type="button"
                    onClick={() => setSelecionadoId(item.id_fornecedor)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: ativo ? '1px solid rgba(129, 140, 248, 0.55)' : '1px solid var(--border-subtle, #334155)',
                      background: ativo ? 'rgba(129, 140, 248, 0.12)' : 'transparent',
                      cursor: 'pointer',
                      color: 'inherit',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Package size={16} weight={ativo ? 'fill' : 'regular'} style={{ flexShrink: 0, color: '#818cf8' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome_fornecedor}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <a
            href={urlConfig}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#818cf8' }}
          >
            <ArrowSquareOut size={14} />
            {t('pedido.lista.modal_importador.atalho_config')}
          </a>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <BotaoGlobal variante="secundario" onClick={onFechar} disabled={salvando}>
              {t('pedido.lista.modal_importador.cancelar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              onClick={() => void confirmar()}
              disabled={!selecionadoId || salvando || carregando}
            >
              {t('pedido.lista.modal_importador.confirmar')}
            </BotaoGlobal>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
