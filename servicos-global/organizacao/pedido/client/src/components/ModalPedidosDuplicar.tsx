/**
 * ModalDuplicar.tsx — Modal de duplicação de pedidos
 *
 * Fluxo de 2 passos:
 *   Passo 1: Define número(s) do(s) pedido(s) duplicado(s)
 *     - Se config.numero_auto = true: exibe números gerados (editáveis)
 *     - Se config.numero_auto = false: usuário digita cada número
 *   Passo 2: Confirmação com resumo informativo
 *
 * Exibe informações sobre datas e status com base na config do tenant.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, CheckCircle, Spinner, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, DuplicarPayload, DuplicarResultado } from '../shared/types'
import { pedidoDuplicarApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalDuplicarPedidosProps {
  pedidos: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Tipos internos ────────────────────────────────────────────────────────────

interface PreviewConfig {
  numero_auto: boolean
  copiar_datas: boolean
  status_inicial: string
}

interface PreviewPedido {
  id: string
  numero_pedido: string
  total_itens: number
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalDuplicarPedidos({ pedidos, onFechar, onConcluido }: ModalDuplicarPedidosProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()
  const [config, setConfig] = useState<PreviewConfig | null>(null)
  const [previewPedidos, setPreviewPedidos] = useState<PreviewPedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [numeros, setNumeros] = useState<Record<string, string>>({})
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState<DuplicarResultado | null>(null)

  const ids = pedidos.map(p => p.id)

  // Carregar preview ao abrir
  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)

    pedidoDuplicarApi.preview(ids)
      .then(data => {
        if (cancelado) return
        setConfig(data.config)
        setPreviewPedidos(data.pedidos)
        // Inicializar números como vazio (usuário preenche) ou com número gerado (auto)
        const inicial: Record<string, string> = {}
        data.pedidos.forEach(p => { inicial[p.id] = '' })
        setNumeros(inicial)
      })
      .catch((err: unknown) => {
        if (cancelado) return
        setErro(err instanceof Error ? err.message : 'Erro ao carregar preview')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumeroChange = useCallback((pedidoId: string, valor: string) => {
    setNumeros(prev => ({ ...prev, [pedidoId]: valor }))
  }, [])

  const podeDuplicar = config?.numero_auto || previewPedidos.every(p => numeros[p.id]?.trim())

  const handleConfirmar = useCallback(async () => {
    if (!config) return
    setConfirmando(true)
    setErro(null)

    try {
      const payload: DuplicarPayload = {
        ids,
        numeros: config.numero_auto ? undefined : numeros,
      }
      const res = await pedidoDuplicarApi.confirmar(payload)
      setResultado(res)
      if (res.criados.length > 0) {
        const nums = res.criados.map(c => c.numero_pedido).join(', ')
        addNotification({ type: 'success', message: `${res.criados.length} PO(s) duplicada(s): ${nums}.`, duration: 4000 })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao duplicar pedidos'
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao duplicar PO: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [config, ids, numeros, addNotification])

  const labelStatus = (statusInicial: string) => {
    if (statusInicial === 'copiar') return t('pedido.modal_dup.status_copiado')
    const mapa: Record<string, string> = {
      draft: t('pedido.modal_dup.status_rascunho'),
      aberto: t('pedido.modal_dup.status_aberto'),
      transferencia: t('pedido.modal_dup.status_transferencia'),
      consolidado: t('pedido.modal_dup.status_consolidado'),
      cancelado: t('pedido.modal_dup.status_cancelado'),
    }
    return mapa[statusInicial] ?? statusInicial
  }

  // ── Tela de resultado ────────────────────────────────────────────────────────
  if (resultado) {
    return (
      <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.modal_dup.aria_resultado')}>
        <div className="modal-duplicar__container">
          <div className="modal-duplicar__header">
            <h2 className="modal-duplicar__titulo">{t('pedido.modal_dup.titulo_resultado')}</h2>
            <button
              className="modal-duplicar__fechar"
              onClick={onFechar}
              aria-label={t('pedido.modal_dup.aria_fechar')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-duplicar__body">
            {resultado.criados.length > 0 && (
              <div className="modal-duplicar__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-duplicar__icone-sucesso" aria-hidden="true" />
                <p className="modal-duplicar__resultado-texto">
                  {t('pedido.modal_dup.resultado_sucesso', { count: resultado.criados.length, s: resultado.criados.length !== 1 ? 's' : '' })}
                </p>
              </div>
            )}

            {resultado.criados.length > 0 && (
              <ul className="modal-duplicar__lista-resultado">
                {resultado.criados.map(c => (
                  <li key={c.novo_id} className="modal-duplicar__item-resultado">
                    <span className="modal-duplicar__numero-original">{c.original_id}</span>
                    <span className="modal-duplicar__seta" aria-hidden="true">→</span>
                    <span className="modal-duplicar__numero-novo">{c.numero_pedido}</span>
                  </li>
                ))}
              </ul>
            )}

            {resultado.erros.length > 0 && (
              <div className="modal-duplicar__resultado-erros">
                <p className="modal-duplicar__erros-titulo">
                  {t('pedido.modal_dup.erros_titulo', { count: resultado.erros.length, s: resultado.erros.length !== 1 ? 's' : '' })}
                </p>
                <ul className="modal-duplicar__lista-erros">
                  {resultado.erros.map(e => (
                    <li key={e.id} className="modal-duplicar__item-erro">
                      <strong>{e.id}:</strong> {e.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="modal-duplicar__footer">
            <BotaoGlobal variante="primario" onClick={onConcluido}>
              {t('pedido.modal_dup.concluir')}
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // ── Tela principal ───────────────────────────────────────────────────────────
  return (
    <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.modal_dup.aria_duplicar_pedidos')}>
      <div className="modal-duplicar__container">
        <div className="modal-duplicar__header">
          <h2 className="modal-duplicar__titulo">
            {t('pedido.modal_dup.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })}
          </h2>
          <button
            className="modal-duplicar__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_dup.aria_fechar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-duplicar__body">
          {carregando && (
            <div className="modal-duplicar__carregando" aria-live="polite">
              <Spinner size={24} className="modal-duplicar__spinner" aria-hidden="true" />
              <span>{t('pedido.modal_dup.carregando')}</span>
            </div>
          )}

          {erro && !carregando && (
            <div className="modal-duplicar__erro" role="alert">
              {erro}
            </div>
          )}

          {!carregando && config && (
            <>
              {/* Informativo sobre datas e status */}
              <div className="modal-duplicar__info">
                <Info size={16} weight="duotone" className="modal-duplicar__info-icone" aria-hidden="true" />
                <div className="modal-duplicar__info-texto">
                  <span>
                    {t('pedido.modal_dup.info_datas')} <strong>{config.copiar_datas ? t('pedido.modal_dup.info_datas_copiadas') : t('pedido.modal_dup.info_datas_resetadas')}</strong>
                  </span>
                  <span>
                    {t('pedido.modal_dup.info_status')} <strong>{labelStatus(config.status_inicial)}</strong>
                  </span>
                </div>
              </div>

              {/* Tabela de pedidos */}
              <table className="modal-duplicar__tabela" aria-label={t('pedido.modal_dup.aria_tabela')}>
                <thead>
                  <tr>
                    <th className="modal-duplicar__th">{t('pedido.modal_dup.col_original')}</th>
                    <th className="modal-duplicar__th">{t('pedido.modal_dup.col_itens')}</th>
                    <th className="modal-duplicar__th">
                      {config.numero_auto ? t('pedido.modal_dup.col_num_gerado') : t('pedido.modal_dup.col_num_copia')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewPedidos.map(p => (
                    <tr key={p.id} className="modal-duplicar__linha">
                      <td className="modal-duplicar__td modal-duplicar__td--numero">
                        {p.numero_pedido}
                      </td>
                      <td className="modal-duplicar__td modal-duplicar__td--itens">
                        {p.total_itens} {p.total_itens === 1 ? 'item' : 'itens'}
                      </td>
                      <td className="modal-duplicar__td">
                        {config.numero_auto ? (
                          <span className="modal-duplicar__numero-auto">
                            {numeros[p.id] || '(gerado automaticamente)'}
                            {' '}
                            <span className="modal-duplicar__badge-auto">{t('pedido.modal_dup.num_auto_badge')}</span>
                          </span>
                        ) : (
                          <input
                            type="text"
                            className="modal-duplicar__input"
                            value={numeros[p.id] ?? ''}
                            onChange={e => handleNumeroChange(p.id, e.target.value)}
                            placeholder={t('pedido.modal_dup.num_placeholder')}
                            aria-label={`Número da cópia do pedido ${p.numero_pedido}`}
                            maxLength={100}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {erro && (
                <div className="modal-duplicar__erro" role="alert">
                  {erro}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-duplicar__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={confirmando}>
            {t('pedido.modal_dup.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleConfirmar}
            disabled={!podeDuplicar || confirmando || carregando}
            carregando={confirmando}
          >
            {confirmando ? t('pedido.modal_dup.duplicando') : t('pedido.modal_dup.duplicar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
