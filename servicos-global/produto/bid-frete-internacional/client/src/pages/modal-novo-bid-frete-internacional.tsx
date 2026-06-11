/**
 * modal-novo-bid-frete-internacional.tsx — Criação de BID (conjunto de cotações).
 * Aberto pelo menu Novo → Buscar Frete → BID na Lista.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Stack, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'

import { criarBidFreteInternacional, getCotacoes } from '../shared/api'
import {
  resolverIdsWorkspacesParaApi,
  useEscopoWorkspacesBidFreteInternacional,
} from '../shared/useEscopoWorkspacesBidFreteInternacional'
import { buildRotaNovaCotacaoComBid } from '../shared/novo-bid-frete-internacional-utils'
import type { BidFreteInternacional, Cotacao } from '../shared/types'

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

export function ModalNovoBidFreteInternacional({
  aberto,
  aoFechar,
  aoCriarBid,
}: ModalNovoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    resetFormulario()
    aoFechar()
  }, [aoFechar, resetFormulario])

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
      const msg = e instanceof Error ? e.message : t('bidfrete.novo_bid.erro_carregar_avulsas', 'Erro ao carregar cotações avulsas')
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
        message: t('bidfrete.novo_bid.toast_sucesso', {
          defaultValue: 'BID {{numero}} criado com sucesso.',
          numero: bid.numero_bid_bid_frete_internacional,
        }),
        duration: 4000,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('bidfrete.novo_bid.erro_criar', 'Erro ao criar BID')
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  const handleIrParaNovaCotacao = () => {
    if (!bidCriado) return
    navigate(buildRotaNovaCotacaoComBid(bidCriado.id_bid_bid_frete_internacional))
    fecharModal()
  }

  if (!aberto) return null

  return (
    <div className="bf-novo-bid-overlay" role="dialog" aria-modal="true" aria-labelledby="bf-novo-bid-titulo">
      <div className="bf-novo-bid-modal">
        <div className="bf-novo-bid-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span className="bf-novo-bid-icone">
              <Stack weight="duotone" size={18} />
            </span>
            <div>
              <h2 id="bf-novo-bid-titulo">
                {bidCriado
                  ? t('bidfrete.novo_bid.titulo_sucesso', { defaultValue: 'BID criado' })
                  : t('bidfrete.novo_bid.titulo', { defaultValue: 'Novo BID' })}
              </h2>
              <p className="bf-novo-bid-subtitulo">
                {bidCriado
                  ? t('bidfrete.novo_bid.subtitulo_sucesso', {
                      defaultValue: 'Agora adicione cotações ao conjunto ou volte para a lista.',
                    })
                  : t('bidfrete.novo_bid.subtitulo', {
                      defaultValue: 'Agrupe várias cotações em um único processo de licitação.',
                    })}
              </p>
            </div>
          </div>
          <button type="button" className="bf-novo-bid-fechar" onClick={fecharModal} aria-label={t('comum.fechar', 'Fechar')}>
            <X weight="bold" size={18} />
          </button>
        </div>

        {bidCriado ? (
          <>
            <div className="bf-novo-bid-sucesso">
              <CheckCircle weight="fill" size={22} color="var(--success, #22c55e)" />
              <div>
                <strong>{bidCriado.numero_bid_bid_frete_internacional}</strong>
                {bidCriado.referencia_interna_bid_bid_frete_internacional && (
                  <span> · {bidCriado.referencia_interna_bid_bid_frete_internacional}</span>
                )}
              </div>
            </div>
            <div className="bf-novo-bid-acoes">
              <BotaoGlobal variante="secundario" tamanho="medio" onClick={fecharModal}>
                {t('bidfrete.novo_bid.voltar_lista', { defaultValue: 'Voltar para a lista' })}
              </BotaoGlobal>
              <BotaoGlobal variante="primario" tamanho="medio" onClick={handleIrParaNovaCotacao}>
                {t('bidfrete.novo_bid.criar_cotacao', { defaultValue: 'Criar cotação para o BID' })}
              </BotaoGlobal>
            </div>
          </>
        ) : (
          <>
            <label className="bf-novo-bid-campo">
              <span>{t('bidfrete.novo_bid.referencia', { defaultValue: 'Referência interna (opcional)' })}</span>
              <input
                type="text"
                value={referenciaInterna}
                onChange={e => setReferenciaInterna(e.target.value)}
                placeholder={t('bidfrete.novo_bid.referencia_placeholder', { defaultValue: 'Ex.: Licitação Q2 / Projeto Alpha' })}
              />
            </label>

            <div className="bf-novo-bid-secao">
              <div className="bf-novo-bid-secao-titulo">
                {t('bidfrete.novo_bid.vincular_avulsas', { defaultValue: 'Vincular cotações avulsas existentes (opcional)' })}
              </div>
              {carregandoAvulsas ? (
                <p className="bf-novo-bid-ajuda">{t('comum.carregando', 'Carregando...')}</p>
              ) : cotacoesAvulsas.length === 0 ? (
                <p className="bf-novo-bid-ajuda">
                  {t('bidfrete.novo_bid.sem_avulsas', { defaultValue: 'Nenhuma cotação avulsa disponível no escopo atual.' })}
                </p>
              ) : (
                <div className="bf-novo-bid-lista">
                  {cotacoesAvulsas.map(cotacao => (
                    <label key={cotacao.id_cotacao_bid_frete_internacional} className="bf-novo-bid-item">
                      <input
                        type="checkbox"
                        checked={idsCotacaoSelecionadas.includes(cotacao.id_cotacao_bid_frete_internacional)}
                        onChange={() => toggleCotacao(cotacao.id_cotacao_bid_frete_internacional)}
                      />
                      <span>{rotuloCotacaoAvulsa(cotacao)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {erro && <p className="bf-novo-bid-erro" role="alert">{erro}</p>}

            <div className="bf-novo-bid-acoes">
              <BotaoGlobal variante="secundario" tamanho="medio" onClick={fecharModal} disabled={salvando}>
                {t('comum.cancelar', 'Cancelar')}
              </BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                carregando={salvando}
                textoCarregando={t('bidfrete.novo_bid.criando', { defaultValue: 'Criando BID...' })}
                onClick={() => void handleCriarBid()}
              >
                {t('bidfrete.novo_bid.criar', { defaultValue: 'Criar BID' })}
              </BotaoGlobal>
            </div>
          </>
        )}
      </div>

      <style>{`
        .bf-novo-bid-overlay {
          position: fixed; inset: 0; z-index: 1200; background: rgba(15, 23, 42, 0.72);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .bf-novo-bid-modal {
          width: min(560px, 100%); max-height: 90vh; overflow-y: auto;
          background: var(--bg-surface, #334155); border-radius: 12px; padding: 1.5rem;
          border: 1px solid var(--bg-elevated, #475569); display: flex; flex-direction: column; gap: 1rem;
        }
        .bf-novo-bid-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .bf-novo-bid-header h2 { margin: 0; font-size: 1.125rem; color: var(--text-primary, #f1f5f9); }
        .bf-novo-bid-subtitulo { margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--text-secondary, #94a3b8); }
        .bf-novo-bid-icone {
          display: inline-flex; align-items: center; justify-content: center;
          width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(139, 92, 246, 0.12); color: #a78bfa;
        }
        .bf-novo-bid-fechar { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; }
        .bf-novo-bid-campo { display: flex; flex-direction: column; gap: 0.375rem; }
        .bf-novo-bid-campo span { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .bf-novo-bid-campo input {
          width: 100%; padding: 0.625rem 0.75rem; border-radius: 0.5rem;
          border: 1px solid var(--border-subtle, #475569); background: var(--bg-elevated, #1e293b);
          color: var(--text-primary, #f1f5f9); font: inherit;
        }
        .bf-novo-bid-secao { display: flex; flex-direction: column; gap: 0.5rem; }
        .bf-novo-bid-secao-titulo { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .bf-novo-bid-ajuda { margin: 0; font-size: 0.8125rem; color: var(--text-secondary, #94a3b8); }
        .bf-novo-bid-lista {
          max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.375rem;
          border: 1px solid var(--border-subtle, #475569); border-radius: 0.5rem; padding: 0.5rem;
        }
        .bf-novo-bid-item {
          display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8125rem;
          color: var(--text-primary, #f1f5f9); cursor: pointer;
        }
        .bf-novo-bid-item input { margin-top: 0.125rem; }
        .bf-novo-bid-erro { margin: 0; font-size: 0.875rem; color: var(--danger, #ef4444); }
        .bf-novo-bid-sucesso {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem;
          border-radius: 0.625rem; background: rgba(34, 197, 94, 0.08); color: var(--text-primary, #f1f5f9);
        }
        .bf-novo-bid-acoes { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; flex-wrap: wrap; }
      `}</style>
    </div>
  )
}
