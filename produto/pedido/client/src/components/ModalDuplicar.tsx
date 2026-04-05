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
import { Info, CheckCircle, Spinner, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, DuplicarPayload, DuplicarResultado } from '../shared/types'
import { pedidoDuplicarApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalDuplicarProps {
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

export function ModalDuplicar({ pedidos, onFechar, onConcluido }: ModalDuplicarProps) {
  const { addNotification } = useShellStore()
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
    if (statusInicial === 'copiar') return 'copiado do original'
    const mapa: Record<string, string> = {
      draft: 'Rascunho',
      aberto: 'Aberto',
      transferencia: 'Em Transferência',
      consolidado: 'Consolidado',
      cancelado: 'Cancelado',
    }
    return mapa[statusInicial] ?? statusInicial
  }

  // ── Tela de resultado ────────────────────────────────────────────────────────
  if (resultado) {
    return (
      <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label="Resultado da duplicação">
        <div className="modal-duplicar__container">
          <div className="modal-duplicar__header">
            <h2 className="modal-duplicar__titulo">Duplicação concluída</h2>
            <button
              className="modal-duplicar__fechar"
              onClick={onFechar}
              aria-label="Fechar modal"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-duplicar__body">
            {resultado.criados.length > 0 && (
              <div className="modal-duplicar__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-duplicar__icone-sucesso" aria-hidden="true" />
                <p className="modal-duplicar__resultado-texto">
                  {resultado.criados.length} pedido{resultado.criados.length !== 1 ? 's' : ''} duplicado{resultado.criados.length !== 1 ? 's' : ''} com sucesso.
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
                  {resultado.erros.length} pedido{resultado.erros.length !== 1 ? 's' : ''} com erro:
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
              Concluir
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // ── Tela principal ───────────────────────────────────────────────────────────
  return (
    <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label="Duplicar pedidos">
      <div className="modal-duplicar__container">
        <div className="modal-duplicar__header">
          <h2 className="modal-duplicar__titulo">
            Duplicar Pedidos ({pedidos.length} selecionado{pedidos.length !== 1 ? 's' : ''})
          </h2>
          <button
            className="modal-duplicar__fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-duplicar__body">
          {carregando && (
            <div className="modal-duplicar__carregando" aria-live="polite">
              <Spinner size={24} className="modal-duplicar__spinner" aria-hidden="true" />
              <span>Carregando configurações...</span>
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
                    Datas: <strong>{config.copiar_datas ? 'copiadas do original' : 'serão resetadas'}</strong>
                  </span>
                  <span>
                    Status: <strong>{labelStatus(config.status_inicial)}</strong>
                  </span>
                </div>
              </div>

              {/* Tabela de pedidos */}
              <table className="modal-duplicar__tabela" aria-label="Pedidos a duplicar">
                <thead>
                  <tr>
                    <th className="modal-duplicar__th">Pedido original</th>
                    <th className="modal-duplicar__th">Itens</th>
                    <th className="modal-duplicar__th">
                      {config.numero_auto ? 'Número gerado' : 'Número da cópia'}
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
                            <span className="modal-duplicar__badge-auto">auto</span>
                          </span>
                        ) : (
                          <input
                            type="text"
                            className="modal-duplicar__input"
                            value={numeros[p.id] ?? ''}
                            onChange={e => handleNumeroChange(p.id, e.target.value)}
                            placeholder="Ex.: PO-2026/099"
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
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleConfirmar}
            disabled={!podeDuplicar || confirmando || carregando}
            carregando={confirmando}
          >
            {confirmando ? 'Duplicando...' : 'Duplicar'}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
