/**
 * Períodos de armazenagem — leitura no detalhe da proposta (comprador).
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Warehouse } from '@phosphor-icons/react'
import type { PropostaBidFreteInternacional } from './types'
import {
  formatarMinimoReaisPeriodoArmazenagem,
  formatarValorTarifaPeriodoArmazenagem,
  periodosArmazenagemExibicaoFromProposta,
  rotuloOrdemPeriodoArmazenagem,
  rotuloTipoTarifaPeriodoArmazenagem,
} from './periodos-armazenagem-proposta-bid-frete-internacional'

export interface SecaoPeriodosArmazenagemReadonlyPropostaBidFreteInternacionalProps {
  proposta: PropostaBidFreteInternacional
  className?: string
}

export function SecaoPeriodosArmazenagemReadonlyPropostaBidFreteInternacional({
  proposta,
  className,
}: SecaoPeriodosArmazenagemReadonlyPropostaBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const periodos = useMemo(
    () => periodosArmazenagemExibicaoFromProposta(proposta),
    [proposta],
  )

  if (periodos.length === 0) return null

  const titulo = t('bidfrete.portal.responder.armazenagem', {
    defaultValue: 'Armazenagem Marítimo LCL',
  })
  const rotuloDias = t('bidfrete.portal.responder.armazenagem_dias', { defaultValue: 'Dias' })
  const rotuloTipo = t('bidfrete.portal.responder.armazenagem_tipo_tarifa', {
    defaultValue: 'Tipo de tarifa',
  })
  const rotuloValor = t('bidfrete.detalhe_cotacao.armazenagem_valor_tarifa', {
    defaultValue: 'Valor da tarifa',
  })
  const rotuloMinimo = t('bidfrete.portal.responder.armazenagem_minimo_reais', {
    defaultValue: 'Mínimo (R$)',
  })
  const legenda = t('bidfrete.detalhe_cotacao.armazenagem_legenda', {
    defaultValue: 'Informado pelo fornecedor — não compõe o Frete Total da proposta.',
  })

  return (
    <section
      className={['dc-prop-armazenagem', className].filter(Boolean).join(' ')}
      aria-label={titulo}
    >
      <div className="dc-prop-armazenagem-cabecalho">
        <span className="dc-info-icon-badge dc-prop-icon-badge" aria-hidden>
          <Warehouse weight="duotone" size={14} />
        </span>
        <h4 className="dc-prop-armazenagem-titulo">{titulo}</h4>
      </div>

      <ul className="dc-prop-armazenagem-lista">
        {periodos.map((periodo) => {
          const ordem = periodo.ordem_periodo_armazenagem_proposta_bid_frete_internacional
          const minimo = formatarMinimoReaisPeriodoArmazenagem(periodo)
          return (
            <li
              key={`arm-${ordem}-${periodo.dias_periodo_armazenagem_proposta_bid_frete_internacional}`}
              className="dc-prop-armazenagem-item"
            >
              <span className="dc-prop-armazenagem-ordem">
                {rotuloOrdemPeriodoArmazenagem(ordem)}
              </span>
              <dl className="dc-prop-armazenagem-campos">
                <div className="dc-prop-armazenagem-campo">
                  <dt>{rotuloDias}</dt>
                  <dd>{periodo.dias_periodo_armazenagem_proposta_bid_frete_internacional}</dd>
                </div>
                <div className="dc-prop-armazenagem-campo">
                  <dt>{rotuloTipo}</dt>
                  <dd>
                    {rotuloTipoTarifaPeriodoArmazenagem(
                      periodo.tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional,
                    )}
                  </dd>
                </div>
                <div className="dc-prop-armazenagem-campo">
                  <dt>{rotuloValor}</dt>
                  <dd>{formatarValorTarifaPeriodoArmazenagem(periodo)}</dd>
                </div>
                {minimo && (
                  <div className="dc-prop-armazenagem-campo">
                    <dt>{rotuloMinimo}</dt>
                    <dd>{minimo}</dd>
                  </div>
                )}
              </dl>
            </li>
          )
        })}
      </ul>

      <p className="dc-prop-armazenagem-legenda">{legenda}</p>
    </section>
  )
}
