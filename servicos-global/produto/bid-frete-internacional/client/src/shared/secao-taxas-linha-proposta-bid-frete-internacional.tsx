/**
 * Seção de taxas (origem ou destino) — uma linha por taxa, moeda própria, catálogo + manual.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { cadastrosApi, type TaxaOrigemDestinoCadastro } from './cadastrosApi'
import {
  filtrarTaxasCatalogoNaoLegado,
  criarLinhaTaxaManual,
  linhaUsaInputManualTaxa,
  opcoesSelectTaxasPorSecao,
  patchLinhaAoSelecionarTaxaCatalogo,
  taxasCatalogoPorSecao,
  agruparValoresPorMoedaLinhas,
  type LinhaTaxaPropostaBidFreteInternacional,
  type SecaoTaxaLinhaProposta,
} from './taxas-linha-proposta-bid-frete-internacional'
import { ResumoMoedasTotalBidFreteInternacional } from './resumo-moedas-total-bid-frete-internacional'
import { CampoValorMonetarioResposta } from './campo-valor-monetario-resposta-bid-frete-internacional'
import { useOpcoesMoedaCadastrosBidFreteInternacional } from './use-opcoes-moeda-cadastros-bid-frete-internacional'

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
}: SecaoTaxasLinhaPropostaBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const {
    opcoes: opcoesMoeda,
    loading: carregandoMoedas,
    erro: erroMoedas,
    indisponivel: moedasIndisponiveis,
  } = useOpcoesMoedaCadastrosBidFreteInternacional()

  const placeholderMoeda = erroMoedas
    ? t('bidfrete.portal.responder.moeda_erro', {
      erro: erroMoedas,
      defaultValue: 'Erro ao carregar moedas: {{erro}}',
    })
    : (!carregandoMoedas && opcoesMoeda.length === 0)
      ? t('bidfrete.portal.responder.moeda_sem_cadastro', {
        defaultValue: 'Nenhuma moeda cadastrada',
      })
      : t('bidfrete.portal.responder.moeda_selecionar', {
        defaultValue: 'Selecionar moeda',
      })

  const [catalogo, setCatalogo] = useState<TaxaOrigemDestinoCadastro[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false)
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar(tentativa: number) {
      setCarregandoCatalogo(true)
      if (tentativa === 0) setErroCatalogo(null)
      try {
        const resp = await cadastrosApi.listarTaxasOrigemDestino({ limit: 500 })
        if (!cancelado) {
          setCatalogo(filtrarTaxasCatalogoNaoLegado(resp.itens))
          setErroCatalogo(null)
        }
      } catch (err: unknown) {
        if (cancelado) return
        if (tentativa < 1) {
          await new Promise((resolve) => setTimeout(resolve, 1200))
          if (!cancelado) await carregar(tentativa + 1)
          return
        }
        setCatalogo([])
        setErroCatalogo(
          err instanceof Error ? err.message : 'Catálogo de taxas temporariamente indisponível',
        )
      } finally {
        if (!cancelado) setCarregandoCatalogo(false)
      }
    }

    void carregar(0)
    return () => {
      cancelado = true
    }
  }, [secao])

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

  const catalogoSecao = useMemo(
    () => taxasCatalogoPorSecao(catalogo, secao),
    [catalogo, secao],
  )
  const catalogoDisponivel = !erroCatalogo && catalogoSecao.length > 0

  return (
    <div className="brc-taxas-secao">
      <h3 className="brc-taxas-secao-titulo">{titulo}</h3>

      {erroCatalogo && linhas.length > 0 ? (
        <p className="brc-taxas-aviso brc-taxas-aviso--erro" role="alert">
          Não foi possível carregar as taxas do cadastro. Você pode digitar o nome da taxa manualmente.
        </p>
      ) : null}

      {!carregandoCatalogo && !erroCatalogo && linhas.length === 0 && catalogoSecao.length === 0 ? (
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
              {linhaUsaInputManualTaxa(linha, catalogoDisponivel) ? (
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
                <SelectGlobal
                  opcoes={opcoesSelectTaxasPorSecao(catalogo, secao, linha)}
                  valor={linha.id_taxa_origem_destino}
                  aoMudarValor={(v) =>
                    atualizarLinha(
                      linha.id_linha_taxa_proposta_bid_frete_internacional,
                      patchLinhaAoSelecionarTaxaCatalogo(catalogo, v == null ? null : String(v)),
                    )
                  }
                  buscavel
                  placeholder="Selecione a taxa..."
                  posicao="baixo"
                  carregando={carregandoCatalogo}
                />
              )}
            </div>
            <div className="brc-taxas-linha-moeda">
              <label className="brc-label">{rotuloMoeda}</label>
              <SelectGlobal
                opcoes={opcoesMoeda}
                valor={linha.moeda_taxa_bid_frete_internacional || null}
                aoMudarValor={(v) =>
                  atualizarLinha(linha.id_linha_taxa_proposta_bid_frete_internacional, {
                    moeda_taxa_bid_frete_internacional: v == null ? '' : String(v),
                  })
                }
                buscavel
                placeholder={placeholderMoeda}
                carregando={carregandoMoedas}
                desabilitado={moedasIndisponiveis}
                posicao="auto"
              />
            </div>
            <div className="brc-taxas-linha-valor">
              <label className="brc-label">{rotuloValor}</label>
              <CampoValorMonetarioResposta
                valor={linha.valor_taxa_bid_frete_internacional}
                onChange={(v) =>
                  atualizarLinha(linha.id_linha_taxa_proposta_bid_frete_internacional, {
                    valor_taxa_bid_frete_internacional: v,
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
