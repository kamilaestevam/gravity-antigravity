import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Trash, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal, type ResultadoAcao } from '@nucleo/botao-global'
import { SelecaoExcluirProps } from './tipos'
import './modal-confirmar-excluir.css'

export function ModalConfirmarExcluirGlobal({
  aberto,
  titulo,
  descricao,
  nomeItem,
  aoConfirmar,
  aoCancelar,
}: SelecaoExcluirProps) {
  const { t } = useTranslation()
  const [confirmando, setConfirmando] = useState(false)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)

  useEffect(() => {
    if (!aberto) {
      setConfirmando(false)
      setFeedbackBotao(null)
    }
  }, [aberto])

  const handleConfirmar = useCallback(async () => {
    if (confirmando || feedbackBotao !== null) return
    setConfirmando(true)
    try {
      await Promise.resolve(aoConfirmar())
      setConfirmando(false)
      setFeedbackBotao('sucesso')
      window.setTimeout(() => {
        setFeedbackBotao(null)
        aoCancelar()
      }, 1200)
    } catch {
      setConfirmando(false)
      setFeedbackBotao('erro')
      window.setTimeout(() => { setFeedbackBotao(null) }, 1500)
    }
  }, [aoConfirmar, aoCancelar, confirmando, feedbackBotao])

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmando && feedbackBotao === null) aoCancelar()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [aberto, aoCancelar, confirmando, feedbackBotao])

  if (!aberto) return null

  return createPortal(
    <div
      className="mce__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mce-titulo"
      aria-describedby="mce-aviso"
    >
      <div className="mce__container">
        <div className="mce__header">
          <div className="mce__header-texto">
            <div className="mce__titulo-linha">
              <Trash size={20} weight="duotone" className="mce__icone-titulo" aria-hidden="true" />
              <h2 id="mce-titulo" className="mce__titulo">{titulo}</h2>
            </div>
            <p className="mce__subtitulo">
              {t('comum.modal_excluir_subtitulo', 'Confirme antes de prosseguir com a exclusão.')}
            </p>
          </div>
          <button
            type="button"
            className="mce__fechar"
            onClick={aoCancelar}
            disabled={confirmando || feedbackBotao !== null}
            aria-label={t('comum.fechar', 'Fechar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mce__body">
          <div className="mce__aviso" id="mce-aviso">
            <Warning size={20} weight="fill" className="mce__aviso-icone" aria-hidden="true" />
            <p className="mce__aviso-texto">
              <strong>{t('comum.modal_excluir_aviso', 'Esta ação é irreversível.')}</strong>{' '}
              {descricao}
            </p>
          </div>

          {nomeItem ? (
            <div>
              <p className="mce__secao-titulo">
                {t('comum.modal_excluir_registro', 'Registro')}
              </p>
              <table className="mce__tabela" aria-label={t('comum.modal_excluir_registro', 'Registro')}>
                <tbody>
                  <tr>
                    <td className="mce__td">{nomeItem}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="mce__footer">
          <BotaoGlobal
            variante="secundario"
            onClick={aoCancelar}
            disabled={confirmando || feedbackBotao !== null}
          >
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={handleConfirmar}
            disabled={feedbackBotao !== null}
            carregando={confirmando}
            textoCarregando={t('comum.modal_excluir_excluindo', 'Excluindo...')}
            resultadoAcao={feedbackBotao}
            icone={<Trash size={14} weight="bold" />}
          >
            {feedbackBotao === 'sucesso'
              ? t('comum.modal_excluir_excluido', 'Excluído')
              : feedbackBotao === 'erro'
                ? t('comum.modal_excluir_falhou', 'Falhou')
                : t('comum.excluir', 'Excluir')}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
