/**
 * modal-excluir-lista-bid-frete-internacional.tsx — Exclusão em lote com preview.
 * Aberto pelo botão Excluir da Lista quando há BIDs e/ou cotações selecionados.
 *
 * Regra de negócio (dono, 2026-06-11): exclusão definitiva só para itens em
 * RASCUNHO ou nunca enviados a fornecedor e sem propostas. O preview do servidor
 * lista os bloqueados com o motivo — aqui só exibimos e confirmamos.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Prohibit, Trash, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

import {
  exclusoesBidFreteApi,
  type CotacaoPreviewExclusaoBidFrete,
  type BidPreviewExclusaoBidFrete,
} from '../shared/api'

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

function rotuloMotivoBloqueio(motivo: string | undefined, t: (k: string, d: string) => string): string {
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
    if (!aberto) return
    void carregarPreview()
  }, [aberto, carregarPreview])

  const handleConfirmar = useCallback(async () => {
    if (!preview || excluindo) return
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
      aoExcluido({ bids: totalBids, cotacoes: totalCotacoes })
      aoFechar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.excluir.erro_confirmar', 'Falha ao excluir. Tente novamente.'))
    } finally {
      setExcluindo(false)
    }
  }, [preview, excluindo, aoExcluido, aoFechar, t])

  if (!aberto) return null

  const totalPermitidos = preview
    ? preview.bidsPermitidos.length + preview.cotacoesPermitidas.length
    : 0
  const totalBloqueados = preview
    ? preview.bidsBloqueados.length + preview.cotacoesBloqueadas.length
    : 0

  return (
    <div className="bf-excluir-overlay" role="dialog" aria-modal="true" aria-labelledby="bf-excluir-titulo">
      <div className="bf-excluir-modal">
        <div className="bf-excluir-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span className="bf-excluir-icone">
              <Trash weight="duotone" size={18} />
            </span>
            <div>
              <h2 id="bf-excluir-titulo">{t('bidfrete.excluir.titulo', 'Excluir selecionados')}</h2>
              <p className="bf-excluir-subtitulo">
                {t('bidfrete.excluir.subtitulo', 'Exclusão definitiva — apenas rascunhos ou itens nunca enviados podem ser excluídos.')}
              </p>
            </div>
          </div>
          <button type="button" className="bf-excluir-fechar" onClick={aoFechar} aria-label={t('comum.fechar', 'Fechar')}>
            <X weight="bold" size={18} />
          </button>
        </div>

        {carregandoPreview && (
          <p className="bf-excluir-ajuda">{t('comum.carregando', 'Carregando...')}</p>
        )}

        {!carregandoPreview && preview && (
          <>
            {totalPermitidos > 0 && (
              <div className="bf-excluir-secao">
                <div className="bf-excluir-secao-titulo bf-excluir-secao-titulo--ok">
                  <CheckCircle weight="fill" size={15} />
                  {t('bidfrete.excluir.serao_excluidos', 'Serão excluídos')} ({totalPermitidos})
                </div>
                <ul className="bf-excluir-lista">
                  {preview.bidsPermitidos.map(bid => (
                    <li key={bid.id_bid_bid_frete_internacional}>
                      <strong>{bid.numero_bid_bid_frete_internacional}</strong>
                      {' · '}
                      {t('bidfrete.excluir.bid_com_cotacoes', 'BID com {{total}} cotação(ões)', )
                        .replace('{{total}}', String(bid.total_cotacoes))}
                    </li>
                  ))}
                  {preview.cotacoesPermitidas.map(cotacao => (
                    <li key={cotacao.id_cotacao_bid_frete_internacional}>
                      <strong>{cotacao.numero_cotacao_bid_frete_internacional}</strong>
                      {' · '}
                      {cotacao.status_cotacao_bid_frete_internacional}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {totalBloqueados > 0 && (
              <div className="bf-excluir-secao">
                <div className="bf-excluir-secao-titulo bf-excluir-secao-titulo--bloqueado">
                  <Prohibit weight="bold" size={15} />
                  {t('bidfrete.excluir.bloqueados', 'Bloqueados — devem ser cancelados, não excluídos')} ({totalBloqueados})
                </div>
                <ul className="bf-excluir-lista">
                  {preview.bidsBloqueados.map(bid => (
                    <li key={bid.id_bid_bid_frete_internacional}>
                      <strong>{bid.numero_bid_bid_frete_internacional}</strong>
                      {' · '}
                      {(bid.cotacoes_bloqueadas ?? [])
                        .map(c => `${c.numero_cotacao_bid_frete_internacional}: ${rotuloMotivoBloqueio(c.motivo_bloqueio, t)}`)
                        .join(' · ')}
                    </li>
                  ))}
                  {preview.cotacoesBloqueadas.map(cotacao => (
                    <li key={cotacao.id_cotacao_bid_frete_internacional}>
                      <strong>{cotacao.numero_cotacao_bid_frete_internacional}</strong>
                      {' · '}
                      {rotuloMotivoBloqueio(cotacao.motivo_bloqueio, t)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {totalPermitidos === 0 && (
              <div className="bf-excluir-aviso">
                <Warning weight="duotone" size={16} />
                {t('bidfrete.excluir.nada_permitido', 'Nenhum item selecionado pode ser excluído. Cancele as cotações em andamento em vez de excluí-las.')}
              </div>
            )}
          </>
        )}

        {erro && <p className="bf-excluir-erro" role="alert">{erro}</p>}

        <div className="bf-excluir-acoes">
          <BotaoGlobal variante="secundario" tamanho="padrao" onClick={aoFechar} disabled={excluindo}>
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            tamanho="padrao"
            carregando={excluindo}
            textoCarregando={t('bidfrete.excluir.excluindo', 'Excluindo...')}
            disabled={carregandoPreview || !preview || totalPermitidos === 0}
            onClick={() => void handleConfirmar()}
          >
            {t('bidfrete.excluir.confirmar', 'Excluir definitivamente')}
            {totalPermitidos > 0 ? ` (${totalPermitidos})` : ''}
          </BotaoGlobal>
        </div>
      </div>

      <style>{`
        .bf-excluir-overlay {
          position: fixed; inset: 0; z-index: 1200; background: rgba(15, 23, 42, 0.72);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .bf-excluir-modal {
          width: min(560px, 100%); max-height: 90vh; overflow-y: auto;
          background: var(--bg-surface, #334155); border-radius: 12px; padding: 1.5rem;
          border: 1px solid var(--bg-elevated, #475569); display: flex; flex-direction: column; gap: 1rem;
        }
        .bf-excluir-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .bf-excluir-header h2 { margin: 0; font-size: 1.125rem; color: var(--text-primary, #f1f5f9); }
        .bf-excluir-subtitulo { margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--text-secondary, #94a3b8); }
        .bf-excluir-icone {
          display: inline-flex; align-items: center; justify-content: center;
          width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(239, 68, 68, 0.12); color: #f87171;
        }
        .bf-excluir-fechar { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; }
        .bf-excluir-secao { display: flex; flex-direction: column; gap: 0.5rem; }
        .bf-excluir-secao-titulo {
          display: flex; align-items: center; gap: 0.375rem;
          font-size: 0.8125rem; font-weight: 600;
        }
        .bf-excluir-secao-titulo--ok { color: #34d399; }
        .bf-excluir-secao-titulo--bloqueado { color: #fbbf24; }
        .bf-excluir-lista {
          margin: 0; padding: 0.5rem; list-style: none; max-height: 200px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 0.375rem;
          border: 1px solid var(--border-subtle, #475569); border-radius: 0.5rem;
          font-size: 0.8125rem; color: var(--text-primary, #f1f5f9);
        }
        .bf-excluir-aviso {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem;
          border-radius: 0.625rem; background: rgba(251, 191, 36, 0.08);
          color: var(--text-primary, #f1f5f9); font-size: 0.8125rem;
        }
        .bf-excluir-ajuda { margin: 0; font-size: 0.8125rem; color: var(--text-secondary, #94a3b8); }
        .bf-excluir-erro { margin: 0; font-size: 0.875rem; color: var(--danger, #ef4444); }
        .bf-excluir-acoes { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; flex-wrap: wrap; }
      `}</style>
    </div>
  )
}
