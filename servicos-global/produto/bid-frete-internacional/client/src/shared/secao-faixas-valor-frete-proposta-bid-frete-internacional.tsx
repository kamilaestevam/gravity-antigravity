/**
 * Seção de faixas de peso/m³ — proposta do fornecedor (modal Aéreo).
 */
import React from 'react'
import { Plus, Trash } from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoValorMonetarioResposta } from './campo-valor-monetario-resposta-bid-frete-internacional'
import {
  ROTULO_SELECT_UNIDADE_FAIXA_VALOR_FRETE_PENDENTE_BID_FRETE_INTERNACIONAL,
  opcoesSelectUnidadeFaixaValorFreteKgsBidFreteInternacional,
  unidadeFaixaValorFreteKgsFromSelectBidFreteInternacional,
  valorSelectUnidadeFaixaValorFreteKgsBidFreteInternacional,
} from '../../../shared/tipo-valor-frete-bid-frete-internacional'
import {
  criarLinhaFaixaValorFretePropostaVazia,
  rotuloOrdemFaixaValorFreteProposta,
  type LinhaFaixaValorFretePropostaFormBidFreteInternacional,
} from './faixas-valor-frete-proposta-bid-frete-internacional'

function LabelFaixaObrigatorio({ children }: { children: React.ReactNode }) {
  return (
    <label className="brc-label">
      {children}
      <span className="brc-label-obrigatorio" aria-hidden>*</span>
    </label>
  )
}

export interface SecaoFaixasValorFretePropostaBidFreteInternacionalProps {
  titulo: string
  rotuloAdicionarFaixa: string
  rotuloLimiteKg: string
  rotuloUnidade: string
  rotuloTarifa: string
  placeholderLimiteKg: string
  placeholderTarifa: string
  linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[]
  onChange: (linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[]) => void
}

export function SecaoFaixasValorFretePropostaBidFreteInternacional({
  titulo,
  rotuloAdicionarFaixa,
  rotuloUnidade,
  rotuloTarifa,
  placeholderLimiteKg,
  placeholderTarifa,
  linhas,
  onChange,
}: SecaoFaixasValorFretePropostaBidFreteInternacionalProps) {
  const opcoesUnidade = opcoesSelectUnidadeFaixaValorFreteKgsBidFreteInternacional()

  const atualizarLinha = (
    id: string,
    patch: Partial<LinhaFaixaValorFretePropostaFormBidFreteInternacional>,
  ) => {
    onChange(linhas.map((l) => (l.id_linha_faixa_valor_frete_proposta === id ? { ...l, ...patch } : l)))
  }

  const removerLinha = (id: string) => {
    if (linhas.length <= 1) return
    onChange(linhas.filter((l) => l.id_linha_faixa_valor_frete_proposta !== id))
  }

  const adicionarFaixa = () => {
    onChange([...linhas, criarLinhaFaixaValorFretePropostaVazia()])
  }

  return (
    <section className="brc-taxas-secao brc-faixas-secao" aria-labelledby="brc-faixas-frete-titulo">
      <div className="brc-faixas-secao-cabecalho">
        <h3 id="brc-faixas-frete-titulo" className="brc-taxas-secao-titulo">{titulo}</h3>
        <button type="button" className="brc-btn-adicionar-linha" onClick={adicionarFaixa}>
          <Plus size={14} weight="bold" aria-hidden />
          {rotuloAdicionarFaixa}
        </button>
      </div>
      <div className="brc-faixas-linhas">
        {linhas.map((linha, index) => {
          const ordem = index + 1
          const podeRemover = linhas.length > 1
          return (
            <div key={linha.id_linha_faixa_valor_frete_proposta} className="brc-armazenagem-linha brc-faixas-linha">
              <div className={`brc-faixas-linha-campos${podeRemover ? ' brc-faixas-linha-campos--multipla' : ''}`}>
                <div className="brc-field">
                  <LabelFaixaObrigatorio>{rotuloOrdemFaixaValorFreteProposta(ordem).toUpperCase()}</LabelFaixaObrigatorio>
                  <div className="brc-campo-decimal-wrap">
                    <input
                      className="brc-input"
                      type="text"
                      inputMode="decimal"
                      placeholder={placeholderLimiteKg}
                      value={linha.limite_inferior_kg_faixa_valor_frete_proposta}
                      onChange={(e) =>
                        atualizarLinha(linha.id_linha_faixa_valor_frete_proposta, {
                          limite_inferior_kg_faixa_valor_frete_proposta: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="brc-field">
                  <LabelFaixaObrigatorio>{rotuloUnidade}</LabelFaixaObrigatorio>
                  <SelectGlobal
                    opcoes={opcoesUnidade}
                    valor={valorSelectUnidadeFaixaValorFreteKgsBidFreteInternacional(
                      linha.unidade_faixa_valor_frete_proposta,
                    )}
                    aoMudarValor={(v) =>
                      atualizarLinha(linha.id_linha_faixa_valor_frete_proposta, {
                        unidade_faixa_valor_frete_proposta:
                          unidadeFaixaValorFreteKgsFromSelectBidFreteInternacional(v),
                      })
                    }
                    placeholder={ROTULO_SELECT_UNIDADE_FAIXA_VALOR_FRETE_PENDENTE_BID_FRETE_INTERNACIONAL}
                    posicao="auto"
                  />
                </div>
                <div className="brc-field">
                  <LabelFaixaObrigatorio>{rotuloTarifa}</LabelFaixaObrigatorio>
                  <CampoValorMonetarioResposta
                    id={`brc-tarifa-faixa-${linha.id_linha_faixa_valor_frete_proposta}`}
                    valor={linha.tarifa_faixa_valor_frete_proposta}
                    onChange={(v) =>
                      atualizarLinha(linha.id_linha_faixa_valor_frete_proposta, {
                        tarifa_faixa_valor_frete_proposta: v,
                      })
                    }
                    placeholder={placeholderTarifa}
                  />
                </div>
                {podeRemover ? (
                  <button
                    type="button"
                    className="brc-taxas-linha-remover brc-faixas-linha-remover"
                    onClick={() => removerLinha(linha.id_linha_faixa_valor_frete_proposta)}
                    aria-label={`Remover ${rotuloOrdemFaixaValorFreteProposta(ordem)}`}
                  >
                    <Trash size={16} weight="duotone" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
