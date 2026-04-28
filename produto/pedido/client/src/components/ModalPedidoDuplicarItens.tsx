/**
 * ModalDuplicarItens.tsx — Modal de confirmação de duplicação de itens
 *
 * Substitui o confirm() nativo. Exibe:
 *   - Lista de itens que serão duplicados (dentro do mesmo pedido)
 *   - Botões Cancelar / Duplicar
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Info, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { pedidoDuplicarApi } from '../shared/api'
import type { PedidoItem } from '../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalDuplicarItensPedidoProps {
  itens: PedidoItem[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalDuplicarItensPedido({ itens, onFechar, onConcluido }: ModalDuplicarItensPedidoProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const pedidoId = itens[0]?.pedido_id ?? ''

  async function handleConfirmar() {
    setConfirmando(true)
    setErro(null)
    try {
      await pedidoDuplicarApi.duplicarItens({
        pedido_id: pedidoId,
        item_ids: itens.map(i => i.id),
      })
      addNotification({
        type: 'success',
        message: `${itens.length} item${itens.length !== 1 ? 'ns' : ''} duplicado${itens.length !== 1 ? 's' : ''} com sucesso.`,
      })
      onConcluido()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao duplicar itens. Tente novamente.')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.modal_dup_it.aria_modal')}>
      <div className="modal-duplicar__container">

        {/* Header */}
        <div className="modal-duplicar__header">
          <h2 className="modal-duplicar__titulo">
            {t('pedido.modal_dup_it.titulo', { count: itens.length, ns: itens.length !== 1 ? 'ns' : '' })}
          </h2>
          <button
            className="modal-duplicar__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_dup_it.aria_fechar')}
            disabled={confirmando}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-duplicar__body">

          {/* Info */}
          <div className="modal-duplicar__info">
            <Info size={16} weight="duotone" className="modal-duplicar__info-icone" aria-hidden="true" />
            <div className="modal-duplicar__info-texto">
              <span>{t('pedido.modal_dup_it.info')}</span>
            </div>
          </div>

          {/* Lista de itens */}
          <table className="modal-duplicar__tabela" aria-label={t('pedido.modal_dup_it.aria_tabela')}>
            <thead>
              <tr>
                <th className="modal-duplicar__th">{t('pedido.modal_dup_it.col_part_number')}</th>
                <th className="modal-duplicar__th">{t('pedido.modal_dup_it.col_descricao')}</th>
                <th className="modal-duplicar__th">{t('pedido.modal_dup_it.col_qtd')}</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id} className="modal-duplicar__linha">
                  <td className="modal-duplicar__td modal-duplicar__td--numero">
                    {item.part_number || '—'}
                  </td>
                  <td className="modal-duplicar__td modal-duplicar__td--itens">
                    {item.descricao_item || '—'}
                  </td>
                  <td className="modal-duplicar__td modal-duplicar__td--itens">
                    {String(item.quantidade_inicial_pedido ?? '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Erro */}
          {erro && (
            <div className="modal-duplicar__erro" role="alert">
              {erro}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-duplicar__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={confirmando}>
            {t('pedido.modal_dup_it.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleConfirmar}
            disabled={confirmando}
            carregando={confirmando}
          >
            <Copy size={16} aria-hidden="true" />
            {confirmando
              ? t('pedido.modal_dup_it.duplicando')
              : t('pedido.modal_dup_it.duplicar', { count: itens.length, ns: itens.length !== 1 ? 'ns' : '' })}
          </BotaoGlobal>
        </div>

      </div>
    </div>
  )
}
