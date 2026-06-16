/**
 * Modal — enviar cotação aos fornecedores (disparo e-mail / WhatsApp).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PaperPlaneTilt, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { CanalDisparo, Cotacao, Fornecedor } from '../shared/types'
import {
  dispararCotacaoAbertaBidFreteInternacional,
  dispararCotacaoBidFreteInternacional,
  getFornecedores,
  type DisparoResultadoBidFreteInternacional,
} from '../shared/api'
import { formatarFeedbackDisparoBidFrete } from '../shared/formatar-resultado-disparo-bid-frete-internacional'
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
  const addNotification = useShellStore(s => s.addNotification)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregandoFornecedores, setCarregandoFornecedores] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [canais, setCanais] = useState<CanalDisparo[]>(['EMAIL'])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [emailsPorFornecedor, setEmailsPorFornecedor] = useState<Record<string, string>>({})

  const carregarFornecedores = useCallback(async () => {
    setCarregandoFornecedores(true)
    try {
      const res = await getFornecedores({ limit: 200 })
      const ativos = res.fornecedores.filter(f => f.status_fornecedor_bid_frete_internacional === 'ATIVO')
      setFornecedores(ativos)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('bidfrete.disparo.erro_carregar_fornecedores', 'Erro ao carregar fornecedores')
      setErro(msg)
      addNotification({ type: 'error', message: msg, duration: 4000 })
    } finally {
      setCarregandoFornecedores(false)
    }
  }, [t, addNotification])

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    setCanais(['EMAIL'])
    setSelecionados([])
    setEmailsPorFornecedor({})
    void carregarFornecedores()
  }, [aberto, carregarFornecedores])

  useEffect(() => {
    if (!aberto || carregandoFornecedores || fornecedores.length === 0) return
    if (cotacao.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA') {
      setSelecionados(fornecedores.map(f => f.id_fornecedor_bid_frete_internacional))
    }
  }, [aberto, carregandoFornecedores, fornecedores, cotacao.visibilidade_cotacao_bid_frete_internacional])

  const notificarErro = useCallback((msg: string) => {
    setErro(msg)
    addNotification({ type: 'error', message: msg, duration: 4000 })
  }, [addNotification])

  const notificarResultadoDisparo = useCallback((resultado: DisparoResultadoBidFreteInternacional) => {
    const feedback = formatarFeedbackDisparoBidFrete(resultado)
    addNotification({
      type: feedback.tipo === 'sucesso' ? 'success' : feedback.tipo === 'parcial' ? 'warning' : 'error',
      message: `${feedback.titulo} — ${feedback.detalhe}`,
      duration: feedback.tipo === 'erro' ? 8000 : 6000,
    })
    setErro(feedback.tipo === 'sucesso' ? null : `${feedback.titulo} — ${feedback.detalhe}`)
    onEnviado()
    if (feedback.tipo === 'sucesso') {
      onFechar()
    }
  }, [addNotification, onEnviado, onFechar])

  const handleEnviar = async () => {
    if (canais.length === 0) {
      notificarErro(t('bidfrete.disparo.erro_sem_canal', 'Selecione ao menos um canal de envio.'))
      return
    }
    if (
      cotacao.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA' &&
      selecionados.length === 0
    ) {
      notificarErro(t('bidfrete.disparo.erro_sem_fornecedor', 'Selecione ao menos um fornecedor.'))
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const id = cotacao.id_cotacao_bid_frete_internacional
      let resultado
      if (cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') {
        resultado = await dispararCotacaoAbertaBidFreteInternacional(id, canais)
      } else {
        resultado = await dispararCotacaoBidFreteInternacional(id, selecionados, canais, emailsPorFornecedor)
      }
      notificarResultadoDisparo(resultado)
    } catch (e: unknown) {
      notificarErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_envio', 'Erro ao enviar cotação'))
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
          emailsPorFornecedor={emailsPorFornecedor}
          onEmailFornecedorChange={(id_fornecedor, email) => {
            setEmailsPorFornecedor(prev => ({ ...prev, [id_fornecedor]: email }))
          }}
          onContatosFornecedorAtualizados={() => void carregarFornecedores()}
        />

        {erro && <p className="bf-disparo-erro" role="alert">{erro}</p>}

        <div className="bf-disparo-acoes">
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={onFechar}
            disabled={enviando}
          >
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            icone={<PaperPlaneTilt weight="bold" size={14} />}
            carregando={enviando}
            textoCarregando={t('bidfrete.disparo.enviando', 'Enviando...')}
            onClick={() => void handleEnviar()}
          >
            {t('bidfrete.disparo.enviar', 'Enviar agora')}
          </BotaoGlobal>
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
        .bf-disparo-acoes { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
      `}</style>
    </div>
  )
}
