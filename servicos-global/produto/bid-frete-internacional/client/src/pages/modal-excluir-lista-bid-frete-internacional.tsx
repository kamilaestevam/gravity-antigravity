/**
 * modal-excluir-lista-bid-frete-internacional.tsx — Exclusão em lote com preview.
 * Layout e modelo alinhados a ModalPedidosExcluir (Lista de Pedidos).
 *
 * Regra de negócio (dono, 2026-06-11): exclusão definitiva só para itens em
 * RASCUNHO ou nunca enviados a fornecedor e sem propostas. O preview do servidor
 * lista os bloqueados com o motivo — aqui só exibimos e confirmamos.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner, Trash, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal, type ResultadoAcao } from '@nucleo/botao-global'

import {
  exclusoesBidFreteApi,
  type CotacaoPreviewExclusaoBidFrete,
  type BidPreviewExclusaoBidFrete,
} from '../shared/api'
import './modal-excluir-lista-bid-frete-internacional.css'

export interface ModalExcluirListaBidFreteInternacionalProps {
  aberto: boolean
  aoFechar: () => void
  idsBidsSelecionados: string[]
  idsCotacoesSelecionadas: string[]
  /** Chamado após exclusão confirmada com sucesso (recarregar lista + limpar seleção) */
  aoExcluido: (totais: { bids: number; cotacoes: number }) => void
}

interface PreviewCarregado {
  cotacoesPermitidas: CotacaoPreviewExclusaoBidFrete[]
  cotacoesBloqueadas: CotacaoPreviewExclusaoBidFrete[]
  bidsPermitidos: BidPreviewExclusaoBidFrete[]
  bidsBloqueados: BidPreviewExclusaoBidFrete[]
}

interface ItemBloqueadoExibicao {
  id: string
  numero: string
  motivo: string
}

function rotuloMotivoBloqueio(motivo: string | undefined, t: (k: string, d?: string) => string): string {
  if (motivo === 'COM_PROPOSTAS') {
    return t('bidfrete.excluir.motivo_com_propostas', 'Já recebeu propostas')
  }
  if (motivo === 'ENVIADA_FORNECEDOR') {
    return t('bidfrete.excluir.motivo_enviada', 'Já enviada ao fornecedor')
  }
  return t('bidfrete.excluir.motivo_bloqueada', 'Bloqueada')
}

export function ModalExcluirListaBidFreteInternacional({
  aberto,
  aoFechar,
  idsBidsSelecionados,
  idsCotacoesSelecionadas,
  aoExcluido,
}: ModalExcluirListaBidFreteInternacionalProps) {
  const { t } = useTranslation()

  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewCarregado | null>(null)

  const carregarPreview = useCallback(async () => {
    setCarregandoPreview(true)
    setErro(null)
    setPreview(null)
    try {
      const [previewCotacoes, previewBids] = await Promise.all([
        idsCotacoesSelecionadas.length > 0
          ? exclusoesBidFreteApi.previewCotacoes(idsCotacoesSelecionadas)
          : Promise.resolve({ permitidas: [], bloqueadas: [] }),
        idsBidsSelecionados.length > 0
          ? exclusoesBidFreteApi.previewBids(idsBidsSelecionados)
          : Promise.resolve({ permitidos: [], bloqueados: [] }),
      ])
      setPreview({
        cotacoesPermitidas: previewCotacoes.permitidas,
        cotacoesBloqueadas: previewCotacoes.bloqueadas,
        bidsPermitidos: previewBids.permitidos,
        bidsBloqueados: previewBids.bloqueados,
      })
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.excluir.erro_preview', 'Falha ao verificar o que pode ser excluído.'))
    } finally {
      setCarregandoPreview(false)
    }
  }, [idsBidsSelecionados, idsCotacoesSelecionadas, t])

  useEffect(() => {
    if (!aberto) {
      setFeedbackBotao(null)
      setExcluindo(false)
      return
    }
    void carregarPreview()
  }, [aberto, carregarPreview])

  const totalPermitidos = preview
    ? preview.bidsPermitidos.length + preview.cotacoesPermitidas.length
    : 0
  const totalBloqueados = preview
    ? preview.bidsBloqueados.length + preview.cotacoesBloqueadas.length
    : 0

  const podeExcluir = totalPermitidos > 0 && !carregandoPreview && !excluindo

  const tituloContagem = useMemo(() => {
    const partes: string[] = []
    const totalBids = idsBidsSelecionados.length
    const totalCotacoes = idsCotacoesSelecionadas.length
    if (totalBids > 0) {
      partes.push(t('bidfrete.excluir.contagem_bids', `${totalBids} BID${totalBids !== 1 ? 's' : ''}`))
    }
    if (totalCotacoes > 0) {
      partes.push(t('bidfrete.excluir.contagem_cotacoes', `${totalCotacoes} cotaç${totalCotacoes !== 1 ? 'ões' : 'ão'}`))
    }
    return partes.join(t('bidfrete.excluir.contagem_separador', ' e '))
  }, [idsBidsSelecionados.length, idsCotacoesSelecionadas.length, t])

  const itensBloqueados = useMemo((): ItemBloqueadoExibicao[] => {
    if (!preview) return []
    const lista: ItemBloqueadoExibicao[] = []

    for (const bid of preview.bidsBloqueados) {
      const motivosFilhas = (bid.cotacoes_bloqueadas ?? [])
        .map(c => `${c.numero_cotacao_bid_frete_internacional}: ${rotuloMotivoBloqueio(c.motivo_bloqueio, t)}`)
        .join(' · ')
      lista.push({
        id: bid.id_bid_bid_frete_internacional,
        numero: bid.numero_bid_bid_frete_internacional,
        motivo: motivosFilhas || t('bidfrete.excluir.motivo_bid_bloqueado', 'BID com cotações que não podem ser excluídas'),
      })
    }

    for (const cotacao of preview.cotacoesBloqueadas) {
      lista.push({
        id: cotacao.id_cotacao_bid_frete_internacional,
        numero: cotacao.numero_cotacao_bid_frete_internacional,
        motivo: rotuloMotivoBloqueio(cotacao.motivo_bloqueio, t),
      })
    }

    return lista
  }, [preview, t])

  const handleConfirmar = useCallback(async () => {
    if (!preview || !podeExcluir) return
    setExcluindo(true)
    setErro(null)
    try {
      let totalBids = 0
      let totalCotacoes = 0
      if (preview.bidsPermitidos.length > 0) {
        const res = await exclusoesBidFreteApi.confirmarBids(
          preview.bidsPermitidos.map(b => b.id_bid_bid_frete_internacional),
        )
        totalBids = res.total_excluidos
      }
      if (preview.cotacoesPermitidas.length > 0) {
        const res = await exclusoesBidFreteApi.confirmarCotacoes(
          preview.cotacoesPermitidas.map(c => c.id_cotacao_bid_frete_internacional),
        )
        totalCotacoes = res.total_excluidas
      }

      setExcluindo(false)
      setFeedbackBotao('sucesso')
      setTimeout(() => {
        setFeedbackBotao(null)
        aoExcluido({ bids: totalBids, cotacoes: totalCotacoes })
        aoFechar()
      }, 1200)
    } catch (e: unknown) {
      setExcluindo(false)
      setFeedbackBotao('erro')
      setErro(e instanceof Error ? e.message : t('bidfrete.excluir.erro_confirmar', 'Falha ao excluir. Tente novamente.'))
      setTimeout(() => { setFeedbackBotao(null) }, 1500)
    }
  }, [preview, podeExcluir, aoExcluido, aoFechar, t])

  if (!aberto) return null

  return (
    <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-labelledby="bf-excluir-titulo">
      <div className="modal-excluir__container">
        <div className="modal-excluir__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} aria-hidden="true" />
              <h2 id="bf-excluir-titulo" className="modal-excluir__titulo">
                {t('bidfrete.excluir.titulo', { defaultValue: 'Excluir {{contagem}}', contagem: tituloContagem })}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
              {t('bidfrete.excluir.subtitulo', 'Revise os registros antes de confirmar a exclusão')}
            </p>
          </div>
          <button
            type="button"
            className="modal-excluir__fechar"
            onClick={aoFechar}
            disabled={excluindo}
            aria-label={t('comum.fechar', 'Fechar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-excluir__body">
          {carregandoPreview && (
            <div className="modal-excluir__carregando" aria-live="polite">
              <Spinner size={24} className="modal-excluir__spinner" aria-hidden="true" />
              <span>{t('bidfrete.excluir.verificando', 'Verificando o que pode ser excluído...')}</span>
            </div>
          )}

          {erro && !carregandoPreview && (
            <div className="modal-excluir__erro" role="alert">
              {erro}
            </div>
          )}

          {!carregandoPreview && preview && (
            <>
              <div className="modal-excluir__aviso">
                <Warning size={20} weight="fill" className="modal-excluir__aviso-icone" aria-hidden="true" />
                <p className="modal-excluir__aviso-texto">
                  <strong>{t('bidfrete.excluir.aviso_irreversivel', 'Esta ação é irreversível.')}</strong>{' '}
                  {t(
                    'bidfrete.excluir.aviso_regra',
                    'Apenas rascunhos ou itens nunca enviados ao fornecedor podem ser excluídos permanentemente.',
                  )}
                </p>
              </div>

              {preview.bidsPermitidos.length > 0 && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {t('bidfrete.excluir.secao_bids_permitidos', {
                      defaultValue: '{{count}} BID(s) serão excluídos',
                      count: preview.bidsPermitidos.length,
                    }).toUpperCase()}
                  </p>
                  <table className="modal-excluir__tabela" aria-label={t('bidfrete.excluir.tabela_bids_aria', 'BIDs que serão excluídos')}>
                    <thead>
                      <tr>
                        <th className="modal-excluir__th">{t('bidfrete.excluir.col_numero', 'Número')}</th>
                        <th className="modal-excluir__th">{t('bidfrete.excluir.col_cotacoes', 'Cotações')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.bidsPermitidos.map(bid => (
                        <tr key={bid.id_bid_bid_frete_internacional} className="modal-excluir__linha">
                          <td className="modal-excluir__td modal-excluir__td--numero">
                            {bid.numero_bid_bid_frete_internacional}
                          </td>
                          <td className="modal-excluir__td modal-excluir__td--itens">
                            {t('bidfrete.excluir.celula_cotacoes', {
                              defaultValue: '{{count}} cotação(ões)',
                              count: bid.total_cotacoes,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {preview.cotacoesPermitidas.length > 0 && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {t('bidfrete.excluir.secao_cotacoes_permitidas', {
                      defaultValue: '{{count}} cotação(ões) serão excluídas',
                      count: preview.cotacoesPermitidas.length,
                    }).toUpperCase()}
                  </p>
                  <table className="modal-excluir__tabela" aria-label={t('bidfrete.excluir.tabela_cotacoes_aria', 'Cotações que serão excluídas')}>
                    <thead>
                      <tr>
                        <th className="modal-excluir__th">{t('bidfrete.excluir.col_numero', 'Número')}</th>
                        <th className="modal-excluir__th">{t('bidfrete.excluir.col_status', 'Status')}</th>
                        <th className="modal-excluir__th">{t('bidfrete.excluir.col_propostas', 'Propostas')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.cotacoesPermitidas.map(cotacao => (
                        <tr key={cotacao.id_cotacao_bid_frete_internacional} className="modal-excluir__linha">
                          <td className="modal-excluir__td modal-excluir__td--numero">
                            {cotacao.numero_cotacao_bid_frete_internacional}
                          </td>
                          <td className="modal-excluir__td modal-excluir__td--itens">
                            {cotacao.status_cotacao_bid_frete_internacional}
                          </td>
                          <td className="modal-excluir__td modal-excluir__td--itens">
                            {cotacao.total_propostas > 0
                              ? t('bidfrete.excluir.celula_registros', {
                                  defaultValue: '{{count}} registro(s)',
                                  count: cotacao.total_propostas,
                                })
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalBloqueados > 0 && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {t('bidfrete.excluir.secao_bloqueados', {
                      defaultValue: '{{count}} bloqueado(s) — use cancelar em vez de excluir',
                      count: totalBloqueados,
                    }).toUpperCase()}
                  </p>
                  <ul className="modal-excluir__bloqueados">
                    {itensBloqueados.map(item => (
                      <li key={item.id} className="modal-excluir__item-bloqueado">
                        <span className="modal-excluir__item-bloqueado-numero">{item.numero}</span>
                        <span className="modal-excluir__item-bloqueado-motivo">{item.motivo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalPermitidos === 0 && (
                <div className="modal-excluir__erro" role="alert">
                  {t(
                    'bidfrete.excluir.nada_permitido',
                    'Nenhum item selecionado pode ser excluído. Cancele as cotações em andamento em vez de excluí-las.',
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-excluir__footer">
          <BotaoGlobal variante="secundario" onClick={aoFechar} disabled={excluindo || feedbackBotao !== null}>
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={() => void handleConfirmar()}
            disabled={!podeExcluir}
            carregando={excluindo}
            textoCarregando={t('bidfrete.excluir.excluindo', 'Excluindo...')}
            resultadoAcao={feedbackBotao}
            icone={<Trash size={14} weight="bold" />}
          >
            {feedbackBotao === 'sucesso'
              ? t('bidfrete.excluir.botao_excluido', 'Excluído')
              : feedbackBotao === 'erro'
                ? t('bidfrete.excluir.botao_falhou', 'Falhou')
                : t('bidfrete.excluir.botao_excluir', 'Excluir')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
