/**
 * DetalheRiscoCorpoNovaLeituraSmartRead — painel unificado: Risco, Análise e Correção (dt-secao)
 */

import { useEffect, useState } from 'react'
import { CaretDown, CircleNotch, ShieldWarning } from '@phosphor-icons/react'
import {
  aplicarCorrecaoSugeridaPadraoRisco,
  type RiscoAduaneiroLeitura,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { ehRiscoClassificacaoFiscal } from '../../../../shared/texto-analise-riscos-leitura-smart-read'

type Props = {
  risco: RiscoAduaneiroLeitura
  aguardandoClassificacao?: boolean
}

export function DetalheRiscoCorpoNovaLeituraSmartRead({
  risco: riscoBruto,
  aguardandoClassificacao = false,
}: Props) {
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)
  const [colapsado, setColapsado] = useState(false)

  useEffect(() => {
    setColapsado(false)
  }, [risco.id])

  const exibirCorrecao = Boolean(risco.correcao_sugerida)
  const exibirClassificacaoPendente =
    !exibirCorrecao &&
    aguardandoClassificacao &&
    ehRiscoClassificacaoFiscal(risco.titulo, risco.categoria)

  return (
    <section
      className={`dt-secao sr-conf-risco-painel-secao${colapsado ? ' dt-secao--colapsada' : ''}`}
      aria-label="Risco, análise e correção"
    >
      <button
        type="button"
        className="dt-secao-header"
        onClick={() => setColapsado((prev) => !prev)}
        aria-expanded={!colapsado}
        aria-controls="sr-risco-painel-corpo"
      >
        <div className="dt-secao-title">
          <CaretDown
            weight="bold"
            size={14}
            className={`dt-caret${colapsado ? ' dt-caret--colapsado' : ''}`}
            aria-hidden
          />
          <span className="dt-secao-icon">
            <ShieldWarning weight="duotone" size={18} />
          </span>
          <h2>Risco, análise e correção</h2>
        </div>
      </button>

      {!colapsado && (
        <div id="sr-risco-painel-corpo" className="sr-conf-risco-painel-corpo">
          <div className="sr-conf-risco-painel-principal">
            <div className="sr-conf-risco-campo">
              <span className="sr-conf-risco-campo-rotulo">Risco</span>
              <p>{risco.motivo}</p>
            </div>

            <div className="sr-conf-risco-campo">
              <span className="sr-conf-risco-campo-rotulo">Análise</span>
              <p>{risco.analise}</p>
            </div>

            {(exibirCorrecao || exibirClassificacaoPendente) && (
              <>
                <div className="sr-conf-risco-painel-divisor" role="presentation" />

                {exibirCorrecao ? (
                  <div className="sr-conf-risco-campo sr-conf-risco-campo--correcao">
                    <span className="sr-conf-risco-campo-rotulo">Correção</span>
                    <p>{risco.correcao_sugerida}</p>
                  </div>
                ) : (
                  <div className="sr-conf-risco-campo sr-conf-risco-campo--correcao sr-conf-risco-campo--pendente">
                    <span className="sr-conf-risco-campo-rotulo">Classificação fiscal</span>
                    <p>
                      <CircleNotch size={14} className="sr-wizard-analise-arquivo-spin" aria-hidden />{' '}
                      IA analisando descrição do item para sugerir NCM/HS…
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {risco.citacoes_normativas && risco.citacoes_normativas.length > 0 && (
            <div className="sr-conf-risco-painel-normativas">
              <strong>Referências normativas</strong>
              <ul>
                {risco.citacoes_normativas.map((cit, idx) => (
                  <li key={`${risco.id}-cit-${idx}`}>
                    <span className="sr-conf-risco-ev-campo">{cit.referencia}</span>
                    {cit.trecho && <span className="sr-conf-risco-ev-valor">{cit.trecho}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
