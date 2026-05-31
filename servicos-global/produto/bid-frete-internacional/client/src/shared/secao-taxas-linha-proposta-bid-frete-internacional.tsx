/**
 * Seção de taxas (origem ou destino) — uma linha por taxa, moeda própria, catálogo + manual.
 */
import React, { useEffect, useState } from 'react'
import { Plus, Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { cadastrosApi, type TaxaOrigemDestinoCadastro } from './cadastrosApi'
import {
  filtrarTaxasCatalogoNaoLegado,
  criarLinhaTaxaManual,
  criarLinhasIniciaisDoCatalogo,
  MOEDAS_LINHA_TAXA,
  agruparValoresPorMoedaLinhas,
  type LinhaTaxaPropostaBidFreteInternacional,
  type SecaoTaxaLinhaProposta,
} from './taxas-linha-proposta-bid-frete-internacional'
import { ResumoMoedasTotalBidFreteInternacional } from './resumo-moedas-total-bid-frete-internacional'

export interface SecaoTaxasLinhaPropostaBidFreteInternacionalProps {
  secao: SecaoTaxaLinhaProposta
  titulo: string
  rotuloAdicionarManual: string
  rotuloNome: string
  rotuloValor: string
  rotuloMoeda: string
  rotuloSubtotal: string
  rotuloTotaisPorMoeda: string
  rotuloSomenteTaxasSecao: string
  placeholderNomeManual: string
  linhas: LinhaTaxaPropostaBidFreteInternacional[]
  onChange: (linhas: LinhaTaxaPropostaBidFreteInternacional[]) => void
  moedaPadrao: string
  inicializado: boolean
  onInicializado: () => void
}

export function SecaoTaxasLinhaPropostaBidFreteInternacional({
  secao,
  titulo,
  rotuloAdicionarManual,
  rotuloNome,
  rotuloValor,
  rotuloMoeda,
  rotuloSubtotal,
  rotuloTotaisPorMoeda,
  rotuloSomenteTaxasSecao,
  placeholderNomeManual,
  linhas,
  onChange,
  moedaPadrao,
  inicializado,
  onInicializado,
}: SecaoTaxasLinhaPropostaBidFreteInternacionalProps) {
  const [catalogo, setCatalogo] = useState<TaxaOrigemDestinoCadastro[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)

  useEffect(() => {
    let cancelado = false
    setCarregandoCatalogo(true)
    cadastrosApi
      .listarTaxasOrigemDestino({ limit: 500 })
      .then((resp) => {
        if (!cancelado) setCatalogo(filtrarTaxasCatalogoNaoLegado(resp.itens))
      })
      .catch(() => {
        if (!cancelado) setCatalogo([])
      })
      .finally(() => {
        if (!cancelado) setCarregandoCatalogo(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (inicializado || carregandoCatalogo) return
    if (linhas.length > 0) {
      onInicializado()
      return
    }
    const iniciais = criarLinhasIniciaisDoCatalogo(catalogo, secao, moedaPadrao)
    if (iniciais.length > 0) {
      onChange(iniciais)
    }
    onInicializado()
  }, [inicializado, carregandoCatalogo, catalogo, secao, moedaPadrao, linhas.length, onChange, onInicializado])

  function atualizarLinha(
    id: string,
    patch: Partial<LinhaTaxaPropostaBidFreteInternacional>,
  ) {
    onChange(
      linhas.map((l) =>
        l.id_linha_taxa_proposta_bid_frete_internacional === id ? { ...l, ...patch } : l,
      ),
    )
  }

  function removerLinha(id: string) {
    onChange(linhas.filter((l) => l.id_linha_taxa_proposta_bid_frete_internacional !== id))
  }

  function adicionarManual() {
    onChange([...linhas, criarLinhaTaxaManual(moedaPadrao)])
  }

  const totaisPorMoeda = agruparValoresPorMoedaLinhas(linhas, moedaPadrao)

  return (
    <div className="brc-taxas-secao">
      <h3 className="brc-taxas-secao-titulo">{titulo}</h3>

      {carregandoCatalogo && linhas.length === 0 ? (
        <p className="brc-taxas-aviso" role="status">Carregando taxas do cadastro…</p>
      ) : null}

      {!carregandoCatalogo && linhas.length === 0 && catalogo.length === 0 ? (
        <p className="brc-taxas-aviso" role="status">
          Nenhuma taxa do cadastro disponível. Use &quot;Adicionar taxa manual&quot; abaixo.
        </p>
      ) : null}

      <div className="brc-taxas-linhas">
        {linhas.map((linha) => (
          <div
            key={linha.id_linha_taxa_proposta_bid_frete_internacional}
            className="brc-taxas-linha"
          >
            <div className="brc-taxas-linha-nome">
              <label className="brc-label">{rotuloNome}</label>
              {linha.manual ? (
                <input
                  className="brc-input"
                  type="text"
                  placeholder={placeholderNomeManual}
                  value={linha.nome_taxa_bid_frete_internacional}
                  onChange={(e) =>
                    atualizarLinha(linha.id_linha_taxa_proposta_bid_frete_internacional, {
                      nome_taxa_bid_frete_internacional: e.target.value,
                    })
                  }
                />
              ) : (
                <input
                  className="brc-input brc-input--readonly"
                  type="text"
                  readOnly
                  value={linha.nome_taxa_bid_frete_internacional}
                  title={linha.nome_taxa_bid_frete_internacional}
                />
              )}
            </div>
            <div className="brc-taxas-linha-moeda">
              <label className="brc-label">{rotuloMoeda}</label>
              <select
                className="brc-input"
                value={linha.moeda_taxa_bid_frete_internacional}
                onChange={(e) =>
                  atualizarLinha(linha.id_linha_taxa_proposta_bid_frete_internacional, {
                    moeda_taxa_bid_frete_internacional: e.target.value,
                  })
                }
              >
                {MOEDAS_LINHA_TAXA.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="brc-taxas-linha-valor">
              <label className="brc-label">{rotuloValor}</label>
              <input
                className="brc-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={linha.valor_taxa_bid_frete_internacional}
                onChange={(e) =>
                  atualizarLinha(linha.id_linha_taxa_proposta_bid_frete_internacional, {
                    valor_taxa_bid_frete_internacional: e.target.value,
                  })
                }
              />
            </div>
            <button
              type="button"
              className="brc-taxas-linha-remover"
              aria-label="Remover taxa"
              onClick={() => removerLinha(linha.id_linha_taxa_proposta_bid_frete_internacional)}
            >
              <Trash weight="bold" size={16} />
            </button>
          </div>
        ))}
      </div>

      {totaisPorMoeda.length > 0 ? (
        <div className="brc-total brc-total--secao" aria-live="polite">
          <div className="brc-total-secao-linha">
            <span className="brc-total-rotulo">{rotuloSubtotal}</span>
            <ResumoMoedasTotalBidFreteInternacional
              totais={totaisPorMoeda}
              variante="secao"
              rotuloAcessibilidade={rotuloTotaisPorMoeda}
              moedaFallback={moedaPadrao}
            />
          </div>
          <p className="brc-total-secao-dica">{rotuloSomenteTaxasSecao}</p>
        </div>
      ) : null}

      <BotaoGlobal
        type="button"
        variante="secundario"
        tamanho="pequeno"
        icone={<Plus weight="bold" size={14} />}
        onClick={adicionarManual}
      >
        {rotuloAdicionarManual}
      </BotaoGlobal>
    </div>
  )
}
