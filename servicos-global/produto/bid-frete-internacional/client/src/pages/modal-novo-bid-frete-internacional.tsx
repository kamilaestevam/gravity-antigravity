/**
 * modal-novo-bid-frete-internacional.tsx — Criação de BID (conjunto de cotações).
 * Aberto pelo menu Novo → Buscar Frete → BID na Lista.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Spinner, Stack, WarningCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { useShellStore } from '@gravity/shell'

import { criarBidFreteInternacional, getCotacoes } from '../shared/api'
import {
  resolverIdsWorkspacesParaApi,
  useEscopoWorkspacesBidFreteInternacional,
} from '../shared/useEscopoWorkspacesBidFreteInternacional'
import type { BidFreteInternacional, Cotacao } from '../shared/types'
import './modal-novo-bid-frete-internacional.css'

export interface ModalNovoBidFreteInternacionalProps {
  aberto: boolean
  aoFechar: () => void
  aoCriarBid?: () => void
}

function rotuloCotacaoAvulsa(cotacao: Cotacao): string {
  const ref = cotacao.referencia_interna_cotacao_bid_frete_internacional?.trim()
  const origem = cotacao.origem_nome_cotacao_bid_frete_internacional
  const destino = cotacao.destino_nome_cotacao_bid_frete_internacional
  const trecho = origem && destino ? `${origem} → ${destino}` : ''
  if (ref && trecho) return `${cotacao.numero_cotacao_bid_frete_internacional} · ${ref} · ${trecho}`
  if (ref) return `${cotacao.numero_cotacao_bid_frete_internacional} · ${ref}`
  if (trecho) return `${cotacao.numero_cotacao_bid_frete_internacional} · ${trecho}`
  return cotacao.numero_cotacao_bid_frete_internacional
}

function CorpoSucessoNovoBid({
  bid,
  totalCotacoesVinculadas,
}: {
  bid: BidFreteInternacional
  totalCotacoesVinculadas: number
}) {
  const { t } = useTranslation()
  const referencia = bid.referencia_interna_bid_bid_frete_internacional?.trim()

  return (
    <div className="bf-novo-bid-sucesso" role="status">
      <div className="bf-novo-bid-sucesso-icone" aria-hidden>
        <CheckCircle weight="duotone" size={56} />
      </div>
      <h3 className="bf-novo-bid-sucesso-titulo">
        {t('bidfrete.novo_bid.titulo_sucesso')}
      </h3>
      <div className="bf-novo-bid-card-resumo">
        <span className="bf-novo-bid-card-resumo-label">
          {t('bidfrete.novo_bid.bid_criado', 'BID criado')}
        </span>
        <p className="bf-novo-bid-card-resumo-valor">
          {bid.numero_bid_bid_frete_internacional}
          {referencia ? ` · ${referencia}` : ''}
        </p>
      </div>
      <p className="bf-novo-bid-sucesso-sub">
        {totalCotacoesVinculadas > 0
          ? t('bidfrete.novo_bid.sucesso_posicao_lista_com_cotacoes', {
            defaultValue: 'O BID foi criado na primeira linha da Lista, com todas as {{count}} cotações vinculadas agrupadas nele.',
            count: totalCotacoesVinculadas,
          })
          : t('bidfrete.novo_bid.sucesso_posicao_lista', {
            defaultValue: 'O BID foi criado na primeira linha da Lista.',
          })}
      </p>
    </div>
  )
}

export function ModalNovoBidFreteInternacional({
  aberto,
  aoFechar,
  aoCriarBid,
}: ModalNovoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const addNotification = useShellStore(s => s.addNotification)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const idsWorkspacesEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesBidFreteInternacional(s => s.hidratado)

  const idsWorkspacesFiltro = useMemo(
    () => resolverIdsWorkspacesParaApi(idsWorkspacesEscopo, idWorkspaceAtivo ?? ''),
    [idsWorkspacesEscopo, idWorkspaceAtivo],
  )

  const [referenciaInterna, setReferenciaInterna] = useState('')
  const [cotacoesAvulsas, setCotacoesAvulsas] = useState<Cotacao[]>([])
  const [idsCotacaoSelecionadas, setIdsCotacaoSelecionadas] = useState<string[]>([])
  const [carregandoAvulsas, setCarregandoAvulsas] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [bidCriado, setBidCriado] = useState<BidFreteInternacional | null>(null)

  const resetFormulario = useCallback(() => {
    setReferenciaInterna('')
    setIdsCotacaoSelecionadas([])
    setErro(null)
    setBidCriado(null)
  }, [])

  const fecharModal = useCallback(() => {
    if (salvando) return
    resetFormulario()
    aoFechar()
  }, [aoFechar, resetFormulario, salvando])

  const carregarAvulsas = useCallback(async () => {
    if (!escopoHidratado) return
    setCarregandoAvulsas(true)
    try {
      const res = await getCotacoes({
        limit: 200,
        apenas_avulsas: true,
        idsWorkspacesFiltro: idsWorkspacesFiltro,
      })
      setCotacoesAvulsas(res.cotacoes)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('bidfrete.novo_bid.erro_carregar_avulsas')
      setErro(msg)
    } finally {
      setCarregandoAvulsas(false)
    }
  }, [escopoHidratado, idsWorkspacesFiltro, t])

  useEffect(() => {
    if (!aberto) return
    resetFormulario()
    void carregarAvulsas()
  }, [aberto, carregarAvulsas, resetFormulario])

  const toggleCotacao = (id: string) => {
    setIdsCotacaoSelecionadas(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    )
  }

  const handleCriarBid = async () => {
    setSalvando(true)
    setErro(null)
    try {
      const bid = await criarBidFreteInternacional({
        referencia_interna_bid_bid_frete_internacional: referenciaInterna.trim() || undefined,
        ids_cotacao_bid_frete_internacional: idsCotacaoSelecionadas.length > 0 ? idsCotacaoSelecionadas : undefined,
      })
      setBidCriado(bid)
      aoCriarBid?.()
      addNotification({
        type: 'success',
        message: t('bidfrete.novo_bid.toast_sucesso', { numero: bid.numero_bid_bid_frete_internacional }),
        duration: 4000,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('bidfrete.novo_bid.erro_criar')
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  const exibirSucesso = bidCriado != null
  const bloquearFechar = salvando

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={fecharModal}
      titulo=""
      tamanho="md"
      zIndex={1300}
      semFechar={bloquearFechar}
      fecharAoClicarOverlay={!bloquearFechar}
      fecharPorESC={!bloquearFechar}
      cabecalhoPersonalizado={
        exibirSucesso
          ? <div className="bf-novo-bid-modal-header bf-novo-bid-modal-header--sucesso" aria-hidden />
          : (
            <div className="modal-header bf-novo-bid-modal-header">
              <div className="bf-novo-bid-modal-header-texto">
                <div className="bf-novo-bid-modal-titulo-row">
                  <Stack
                    weight="duotone"
                    size={22}
                    className="bf-novo-bid-modal-icone-titulo"
                    aria-hidden
                  />
                  <h2 id="bf-novo-bid-titulo" className="mg-titulo text-h3">
                    {t('bidfrete.novo_bid.titulo')}
                  </h2>
                </div>
                <p className="mg-subtitulo text-sm">
                  {t('bidfrete.novo_bid.subtitulo')}
                </p>
              </div>
            </div>
          )
      }
      renderizarFooter={() => (
        exibirSucesso ? (
          <BotaoGlobal variante="primario" tamanho="medio" onClick={fecharModal}>
            {t('bidfrete.novo_bid.voltar_lista')}
          </BotaoGlobal>
        ) : (
          <>
            <BotaoGlobal variante="secundario" tamanho="medio" onClick={fecharModal} disabled={salvando}>
              {t('comum.cancelar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="medio"
              icone={<Stack size={14} weight="bold" />}
              carregando={salvando}
              textoCarregando={t('bidfrete.novo_bid.criando')}
              onClick={() => void handleCriarBid()}
            >
              {t('bidfrete.novo_bid.criar')}
            </BotaoGlobal>
          </>
        )
      )}
    >
      {exibirSucesso && bidCriado ? (
        <CorpoSucessoNovoBid bid={bidCriado} totalCotacoesVinculadas={idsCotacaoSelecionadas.length} />
      ) : (
        <div className="bf-novo-bid-corpo">
          {erro ? (
            <div className="bf-novo-bid-erro" role="alert">
              <WarningCircle weight="duotone" size={20} className="bf-novo-bid-erro-icone" aria-hidden />
              <p>{erro}</p>
            </div>
          ) : null}

          <label className="bf-novo-bid-campo" htmlFor="bf-novo-bid-referencia">
            <span className="bf-novo-bid-campo-label">{t('bidfrete.novo_bid.referencia')}</span>
            <input
              id="bf-novo-bid-referencia"
              className="bf-novo-bid-input"
              type="text"
              value={referenciaInterna}
              onChange={e => setReferenciaInterna(e.target.value)}
              placeholder={t('bidfrete.novo_bid.referencia_placeholder')}
              disabled={salvando}
            />
          </label>

          <div className="bf-novo-bid-secao">
            <span className="bf-novo-bid-secao-titulo">
              {t('bidfrete.novo_bid.vincular_avulsas')}
            </span>
            {carregandoAvulsas ? (
              <div className="bf-novo-bid-carregando" aria-live="polite">
                <Spinner size={18} aria-hidden />
                <span>{t('comum.carregando')}</span>
              </div>
            ) : cotacoesAvulsas.length === 0 ? (
              <p className="bf-novo-bid-campo-ajuda">
                {t('bidfrete.novo_bid.sem_avulsas')}
              </p>
            ) : (
              <div className="bf-novo-bid-lista" role="group" aria-label={t('bidfrete.novo_bid.vincular_avulsas')}>
                {cotacoesAvulsas.map(cotacao => (
                  <label
                    key={cotacao.id_cotacao_bid_frete_internacional}
                    className="bf-novo-bid-item"
                  >
                    <input
                      type="checkbox"
                      checked={idsCotacaoSelecionadas.includes(cotacao.id_cotacao_bid_frete_internacional)}
                      onChange={() => toggleCotacao(cotacao.id_cotacao_bid_frete_internacional)}
                      disabled={salvando}
                    />
                    <span className="bf-novo-bid-item-texto">{rotuloCotacaoAvulsa(cotacao)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ModalOverlay>
  )
}
