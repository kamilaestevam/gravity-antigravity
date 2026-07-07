/**
 * Banner de estado do aceite do ganhador no comparativo.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Clock, SealCheck } from '@phosphor-icons/react'
import {
  nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional,
  resolverEstadoAceiteGanhadorComparativoBidFreteInternacional,
  type PropostaGanhadoraEstadoAceiteBidFreteInternacional,
} from '../../../shared/estado-aceite-ganhador-comparativo-bid-frete-internacional'

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

type Props = {
  status_cotacao_bid_frete_internacional?: string | null
  proposta_ganhadora?: PropostaGanhadoraEstadoAceiteBidFreteInternacional | null
  data_fechamento_cotacao_bid_frete_internacional?: string | null
  acaoFechamento?: React.ReactNode
}

export function BannerEstadoAceiteComparativoBidFreteInternacional({
  status_cotacao_bid_frete_internacional,
  proposta_ganhadora,
  data_fechamento_cotacao_bid_frete_internacional,
  acaoFechamento,
}: Props) {
  const { t } = useTranslation()
  const estado = resolverEstadoAceiteGanhadorComparativoBidFreteInternacional({
    status_cotacao_bid_frete_internacional,
    proposta_ganhadora,
  })

  if (estado === 'nao_aplicavel') return null

  const fornecedor = nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional(proposta_ganhadora)

  if (estado === 'aguardando_aceite') {
    return (
      <div className="bf-aceite-banner bf-aceite-banner--aguardando" role="status">
        <Clock weight="duotone" size={22} aria-hidden />
        <div className="bf-aceite-banner-texto">
          <strong>
            {t('bidfrete.comparativo.aceite_aguardando_titulo', 'Aguardando aceite do ganhador')}
          </strong>
          <span>
            {t(
              'bidfrete.comparativo.aceite_aguardando_desc',
              '{{fornecedor}} recebeu a aprovação por e-mail e ainda não confirmou o recebimento.',
              { fornecedor },
            )}
          </span>
        </div>
      </div>
    )
  }

  if (estado === 'aceite_confirmado') {
    const dataAceite = proposta_ganhadora?.data_aceite_aprovacao_proposta_bid_frete_internacional
    return (
      <div className="bf-aceite-banner bf-aceite-banner--confirmado" role="status">
        <CheckCircle weight="duotone" size={22} aria-hidden />
        <div className="bf-aceite-banner-texto">
          <strong>
            {t('bidfrete.comparativo.aceite_confirmado_titulo', 'Aceite confirmado')}
          </strong>
          <span>
            {dataAceite
              ? t(
                  'bidfrete.comparativo.aceite_confirmado_data',
                  '{{fornecedor}} confirmou em {{data}}.',
                  { fornecedor, data: dataBR(String(dataAceite)) },
                )
              : t(
                  'bidfrete.comparativo.aceite_confirmado_sem_data',
                  '{{fornecedor}} confirmou o recebimento da aprovação.',
                  { fornecedor },
                )}
          </span>
        </div>
        {acaoFechamento ? <div className="bf-aceite-banner-acao">{acaoFechamento}</div> : null}
      </div>
    )
  }

  return (
    <div className="bf-aceite-banner bf-aceite-banner--fechada" role="status">
      <SealCheck weight="duotone" size={22} aria-hidden />
      <div className="bf-aceite-banner-texto">
        <strong>{t('bidfrete.comparativo.fechamento_titulo', 'Frete fechado na plataforma')}</strong>
        <span>
          {data_fechamento_cotacao_bid_frete_internacional
            ? t(
                'bidfrete.comparativo.fechamento_data',
                'Fechamento confirmado em {{data}}.',
                { data: dataBR(data_fechamento_cotacao_bid_frete_internacional) },
              )
            : t('bidfrete.comparativo.fechamento_confirmado', 'Fechamento confirmado.')}
        </span>
      </div>
    </div>
  )
}

export const BANNER_ESTADO_ACEITE_COMPARATIVO_STYLES = `
  .bf-aceite-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    border: 1px solid transparent;
  }
  .bf-aceite-banner-texto {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }
  .bf-aceite-banner-texto strong {
    font-size: 0.9375rem;
  }
  .bf-aceite-banner-texto span {
    font-size: 0.8125rem;
    color: var(--text-muted, #94a3b8);
    line-height: 1.45;
  }
  .bf-aceite-banner-acao {
    flex-shrink: 0;
    align-self: center;
  }
  .bf-aceite-banner--aguardando {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.35);
    color: #fbbf24;
  }
  .bf-aceite-banner--confirmado {
    background: rgba(52, 211, 153, 0.1);
    border-color: rgba(52, 211, 153, 0.35);
    color: #34d399;
  }
  .bf-aceite-banner--fechada {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.35);
    color: #818cf8;
  }
`
