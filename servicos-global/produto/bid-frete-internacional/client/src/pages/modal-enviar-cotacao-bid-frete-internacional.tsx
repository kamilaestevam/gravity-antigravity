/**
 * Modal — enviar cotação aos fornecedores (disparo e-mail / WhatsApp).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PaperPlaneTilt, X } from '@phosphor-icons/react'
import type { CanalDisparo, Cotacao, Fornecedor } from '../shared/types'
import {
  dispararCotacaoAbertaBidFreteInternacional,
  dispararCotacaoBidFreteInternacional,
  getFornecedores,
} from '../shared/api'
import { SelecaoFornecedoresDisparo } from './selecao-fornecedores-disparo-bid-frete-internacional'

export interface ModalEnviarCotacaoBidFreteInternacionalProps {
  cotacao: Cotacao
  aberto: boolean
  onFechar: () => void
  onEnviado: () => void
}

export function ModalEnviarCotacaoBidFreteInternacional({
  cotacao,
  aberto,
  onFechar,
  onEnviado,
}: ModalEnviarCotacaoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregandoFornecedores, setCarregandoFornecedores] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [canais, setCanais] = useState<CanalDisparo[]>(['EMAIL'])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregarFornecedores = useCallback(async () => {
    setCarregandoFornecedores(true)
    try {
      const res = await getFornecedores({ limit: 200 })
      const ativos = res.fornecedores.filter(f => f.status_fornecedor_bid_frete_internacional === 'ATIVO')
      setFornecedores(ativos)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_carregar_fornecedores', 'Erro ao carregar fornecedores'))
    } finally {
      setCarregandoFornecedores(false)
    }
  }, [t])

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    setCanais(['EMAIL'])
    setSelecionados([])
    if (cotacao.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA') {
      void carregarFornecedores()
    }
  }, [aberto, cotacao.visibilidade_cotacao_bid_frete_internacional, carregarFornecedores])

  const handleEnviar = async () => {
    if (canais.length === 0) {
      setErro(t('bidfrete.disparo.erro_sem_canal', 'Selecione ao menos um canal de envio.'))
      return
    }
    if (
      cotacao.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA' &&
      selecionados.length === 0
    ) {
      setErro(t('bidfrete.disparo.erro_sem_fornecedor', 'Selecione ao menos um fornecedor.'))
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const id = cotacao.id_cotacao_bid_frete_internacional
      if (cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') {
        await dispararCotacaoAbertaBidFreteInternacional(id, canais)
      } else {
        await dispararCotacaoBidFreteInternacional(id, selecionados, canais)
      }
      onEnviado()
      onFechar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_envio', 'Erro ao enviar cotação'))
    } finally {
      setEnviando(false)
    }
  }

  if (!aberto) return null

  return (
    <div className="bf-disparo-overlay" role="dialog" aria-modal="true" aria-labelledby="bf-disparo-titulo">
      <div className="bf-disparo-modal">
        <div className="bf-disparo-modal-header">
          <h2 id="bf-disparo-titulo">{t('bidfrete.disparo.titulo', 'Enviar cotação aos fornecedores')}</h2>
          <button type="button" className="bf-disparo-fechar" onClick={onFechar} aria-label={t('comum.fechar', 'Fechar')}>
            <X weight="bold" size={18} />
          </button>
        </div>
        <p className="bf-disparo-subtitulo">
          {cotacao.numero_cotacao_bid_frete_internacional} — {cotacao.origem_nome_cotacao_bid_frete_internacional} → {cotacao.destino_nome_cotacao_bid_frete_internacional}
        </p>

        <SelecaoFornecedoresDisparo
          visibilidade={cotacao.visibilidade_cotacao_bid_frete_internacional}
          fornecedores={fornecedores}
          carregando={carregandoFornecedores}
          selecionados={selecionados}
          onChangeSelecionados={setSelecionados}
          canais={canais}
          onChangeCanais={setCanais}
        />

        {erro && <p className="bf-disparo-erro" role="alert">{erro}</p>}

        <div className="bf-disparo-acoes">
          <button type="button" className="bf-disparo-btn bf-disparo-btn--sec" onClick={onFechar} disabled={enviando}>
            {t('comum.cancelar', 'Cancelar')}
          </button>
          <button type="button" className="bf-disparo-btn bf-disparo-btn--pri" onClick={() => void handleEnviar()} disabled={enviando}>
            <PaperPlaneTilt weight="bold" size={16} />
            {enviando ? t('bidfrete.disparo.enviando', 'Enviando...') : t('bidfrete.disparo.enviar', 'Enviar agora')}
          </button>
        </div>
      </div>

      <style>{`
        .bf-disparo-overlay {
          position: fixed; inset: 0; z-index: 1200; background: rgba(15, 23, 42, 0.72);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .bf-disparo-modal {
          width: min(560px, 100%); max-height: 90vh; overflow-y: auto;
          background: var(--bg-surface, #334155); border-radius: 12px; padding: 1.5rem;
          border: 1px solid var(--bg-elevated, #475569); display: flex; flex-direction: column; gap: 1rem;
        }
        .bf-disparo-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .bf-disparo-modal-header h2 { margin: 0; font-size: 1.125rem; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-fechar { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; }
        .bf-disparo-subtitulo { margin: 0; font-size: 0.8125rem; color: var(--text-secondary, #94a3b8); }
        .bf-disparo-erro { margin: 0; font-size: 0.875rem; color: var(--danger, #ef4444); }
        .bf-disparo-acoes { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
        .bf-disparo-btn {
          display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem;
          border-radius: 9999px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; font-family: inherit;
        }
        .bf-disparo-btn--sec { background: var(--bg-base, #1e293b); color: var(--text-secondary, #94a3b8); border: 1px solid var(--bg-elevated, #475569); }
        .bf-disparo-btn--pri { background: var(--accent, #6366f1); color: #fff; }
        .bf-disparo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
