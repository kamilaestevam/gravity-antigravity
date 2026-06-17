/**
 * Seção de períodos de armazenagem — fornecedor (Marítimo LCL + incluir armazenagem).
 */
import React from 'react'
import { Plus, Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoValorMonetarioResposta } from './campo-valor-monetario-resposta-bid-frete-internacional'
import {
  OPCOES_TIPO_TARIFA_PERIODO_ARMAZENAGEM,
  criarLinhaPeriodoArmazenagemVazia,
  rotuloOrdemPeriodoArmazenagem,
  type LinhaPeriodoArmazenagemFormBidFreteInternacional,
  type TipoTarifaPeriodoArmazenagemProposta,
} from './periodos-armazenagem-proposta-bid-frete-internacional'

export interface SecaoPeriodosArmazenagemPropostaBidFreteInternacionalProps {
  titulo: string
  rotuloAdicionarPeriodo: string
  rotuloDias: string
  rotuloTipoTarifa: string
  rotuloValorTarifa: string
  rotuloValorPercentual: string
  rotuloMinimoReais: string
  placeholderDias: string
  placeholderValorReais: string
  placeholderValorPercentual: string
  placeholderMinimo: string
  linhas: LinhaPeriodoArmazenagemFormBidFreteInternacional[]
  onChange: (linhas: LinhaPeriodoArmazenagemFormBidFreteInternacional[]) => void
}

export function SecaoPeriodosArmazenagemPropostaBidFreteInternacional({
  titulo,
  rotuloAdicionarPeriodo,
  rotuloDias,
  rotuloTipoTarifa,
  rotuloValorTarifa,
  rotuloValorPercentual,
  rotuloMinimoReais,
  placeholderDias,
  placeholderValorReais,
  placeholderValorPercentual,
  placeholderMinimo,
  linhas,
  onChange,
}: SecaoPeriodosArmazenagemPropostaBidFreteInternacionalProps) {
  const atualizarLinha = (
    id: string,
    patch: Partial<LinhaPeriodoArmazenagemFormBidFreteInternacional>,
  ) => {
    onChange(linhas.map((l) => (l.id_linha_periodo_armazenagem === id ? { ...l, ...patch } : l)))
  }

  const removerLinha = (id: string) => {
    if (linhas.length <= 1) return
    onChange(linhas.filter((l) => l.id_linha_periodo_armazenagem !== id))
  }

  const adicionarPeriodo = () => {
    onChange([...linhas, criarLinhaPeriodoArmazenagemVazia()])
  }

  return (
    <section className="brc-taxas-secao" aria-labelledby="brc-armazenagem-titulo">
      <h3 id="brc-armazenagem-titulo" className="brc-taxas-secao-titulo">{titulo}</h3>
      <div className="brc-taxas-linhas">
        {linhas.map((linha, index) => {
          const ordem = index + 1
          const ehPercentual = linha.tipo_tarifa_periodo_armazenagem === 'PERCENTUAL_MERCADORIA'
          return (
            <div
              key={linha.id_linha_periodo_armazenagem}
              className="brc-taxas-linha brc-armazenagem-linha"
            >
              <div className="brc-armazenagem-linha-cabecalho">
                <span className="brc-armazenagem-ordem">{rotuloOrdemPeriodoArmazenagem(ordem)}</span>
                {linhas.length > 1 && (
                  <button
                    type="button"
                    className="brc-taxas-linha-remover"
                    onClick={() => removerLinha(linha.id_linha_periodo_armazenagem)}
                    aria-label={`Remover ${rotuloOrdemPeriodoArmazenagem(ordem)}`}
                  >
                    <Trash size={16} weight="duotone" aria-hidden />
                  </button>
                )}
              </div>
              <div className="brc-armazenagem-linha-campos">
                <div className="brc-field">
                  <label className="brc-label" htmlFor={`brc-arm-dias-${linha.id_linha_periodo_armazenagem}`}>
                    {rotuloDias}
                    <span className="brc-label-obrigatorio" aria-hidden>*</span>
                  </label>
                  <input
                    id={`brc-arm-dias-${linha.id_linha_periodo_armazenagem}`}
                    className="brc-input"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={linha.dias_periodo_armazenagem}
                    onChange={(e) =>
                      atualizarLinha(linha.id_linha_periodo_armazenagem, {
                        dias_periodo_armazenagem: e.target.value,
                      })
                    }
                    placeholder={placeholderDias}
                  />
                </div>
                <div className="brc-field brc-armazenagem-tipo">
                  <label className="brc-label" htmlFor={`brc-arm-tipo-${linha.id_linha_periodo_armazenagem}`}>
                    {rotuloTipoTarifa}
                    <span className="brc-label-obrigatorio" aria-hidden>*</span>
                  </label>
                  <SelectGlobal
                    id={`brc-arm-tipo-${linha.id_linha_periodo_armazenagem}`}
                    opcoes={[...OPCOES_TIPO_TARIFA_PERIODO_ARMAZENAGEM]}
                    valor={linha.tipo_tarifa_periodo_armazenagem || null}
                    aoMudarValor={(v) =>
                      atualizarLinha(linha.id_linha_periodo_armazenagem, {
                        tipo_tarifa_periodo_armazenagem: v == null
                          ? ''
                          : String(v) as TipoTarifaPeriodoArmazenagemProposta,
                        valor_tarifa_periodo_armazenagem: '',
                      })
                    }
                    placeholder="Selecionar"
                    posicao="auto"
                  />
                </div>
                <div className="brc-field">
                  <label className="brc-label" htmlFor={`brc-arm-valor-${linha.id_linha_periodo_armazenagem}`}>
                    {ehPercentual ? rotuloValorPercentual : rotuloValorTarifa}
                    <span className="brc-label-obrigatorio" aria-hidden>*</span>
                  </label>
                  {ehPercentual ? (
                    <input
                      id={`brc-arm-valor-${linha.id_linha_periodo_armazenagem}`}
                      className="brc-input"
                      type="number"
                      min={0.01}
                      max={100}
                      step={0.01}
                      inputMode="decimal"
                      value={linha.valor_tarifa_periodo_armazenagem}
                      onChange={(e) =>
                        atualizarLinha(linha.id_linha_periodo_armazenagem, {
                          valor_tarifa_periodo_armazenagem: e.target.value,
                        })
                      }
                      placeholder={placeholderValorPercentual}
                    />
                  ) : (
                    <CampoValorMonetarioResposta
                      id={`brc-arm-valor-${linha.id_linha_periodo_armazenagem}`}
                      valor={linha.valor_tarifa_periodo_armazenagem}
                      onChange={(v) =>
                        atualizarLinha(linha.id_linha_periodo_armazenagem, {
                          valor_tarifa_periodo_armazenagem: v,
                        })
                      }
                      placeholder={placeholderValorReais}
                    />
                  )}
                </div>
                <div className="brc-field">
                  <label className="brc-label" htmlFor={`brc-arm-min-${linha.id_linha_periodo_armazenagem}`}>
                    {rotuloMinimoReais}
                    <span className="brc-label-obrigatorio" aria-hidden>*</span>
                  </label>
                  <CampoValorMonetarioResposta
                    id={`brc-arm-min-${linha.id_linha_periodo_armazenagem}`}
                    valor={linha.minimo_reais_periodo_armazenagem}
                    onChange={(v) =>
                      atualizarLinha(linha.id_linha_periodo_armazenagem, {
                        minimo_reais_periodo_armazenagem: v,
                      })
                    }
                    placeholder={placeholderMinimo}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <BotaoGlobal
        type="button"
        variante="secundario"
        tamanho="compacto"
        iconeEsquerda={<Plus weight="bold" size={14} />}
        onClick={adicionarPeriodo}
      >
        {rotuloAdicionarPeriodo}
      </BotaoGlobal>
    </section>
  )
}
