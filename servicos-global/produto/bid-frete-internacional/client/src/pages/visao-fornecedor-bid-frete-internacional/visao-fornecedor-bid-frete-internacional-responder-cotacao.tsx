/**
 * Portal do Fornecedor — formulário de resposta (autenticado).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import { PencilSimple, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import {
  BidFreteApiError,
  getVisaoFornecedorBidFreteInternacionalCotacoesPendentes,
  enviarVisaoFornecedorBidFreteInternacionalProposta,
} from '../../shared/api'
import type { DisparoCotacaoBidFreteInternacional } from '../../shared/types'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from '../../shared/rotas-bid-frete-internacional'
import { montarPayloadPropostaRespostaBidFreteInternacional } from '../../shared/montar-payload-proposta-resposta-bid-frete-internacional'
import { estadoInicialFormularioRespostaFromCotacao } from '../../shared/faixas-valor-frete-proposta-bid-frete-internacional'
import {
  ESTADO_INICIAL_FORMULARIO_RESPOSTA,
  EstadoMensagemRespostaCotacao,
  FormPropostaRespostaCotacao,
  SecaoDetalhesCotacaoResposta,
  ShellPaginaRespostaCotacao,
  AvisoEdicaoPropostaResposta,
  CabecalhoFormularioRespostaCotacao,
  estadoFormularioFromProposta,
  criarRotulosFormularioResposta,
  obterErroValidacaoFormularioRespostaCotacao,
  type DetalhesCotacaoResposta,
  type EstadoFormularioRespostaCotacao,
} from '../../shared/formulario-resposta-cotacao-bid-frete-internacional'

export default function ResponderCotacao() {
  const { id_disparo_cotacao_bid_frete_internacional: idDisparo } = useParams<{
    id_disparo_cotacao_bid_frete_internacional: string
  }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [bid, setBid] = useState<DisparoCotacaoBidFreteInternacional | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<EstadoFormularioRespostaCotacao>(ESTADO_INICIAL_FORMULARIO_RESPOSTA)

  const rotulos = useMemo(
    () => criarRotulosFormularioResposta(t, 'bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao'),
    [t],
  )

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const pendentes = await getVisaoFornecedorBidFreteInternacionalCotacoesPendentes()
      const found = pendentes.find((b) => b.id_disparo_cotacao_bid_frete_internacional === idDisparo)
      if (found) {
        setBid(found)
        if (found.proposta) {
          setModoEdicao(true)
          setForm(estadoFormularioFromProposta(found.proposta))
        } else {
          setModoEdicao(false)
          const cotacaoInicial = (found as unknown as { cotacao?: DetalhesCotacaoResposta }).cotacao
          setForm({
            ...ESTADO_INICIAL_FORMULARIO_RESPOSTA,
            ...estadoInicialFormularioRespostaFromCotacao(cotacaoInicial),
          })
        }
      }
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [idDisparo])

  useEffect(() => { carregar() }, [carregar])

  const cotacao = bid
    ? (bid as unknown as { cotacao: DetalhesCotacaoResposta }).cotacao
    : null

  const nomeAgente = bid?.fornecedor?.nome_fornecedor_bid_frete_internacional ?? ''

  useSincronizarTituloPaginaTopo(useMemo(() => {
    if (sucesso) {
      return {
        label: t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.titulo_enviada'),
        icone: <CheckCircle weight="duotone" size={22} />,
      }
    }
    if (carregando) {
      return criarTituloCarregandoTopo(<PencilSimple weight="duotone" size={22} />, t)
    }
    return {
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.titulo'),
      icone: <PencilSimple weight="duotone" size={22} />,
      subtitulo: cotacao?.numero_cotacao_bid_frete_internacional,
    }
  }, [sucesso, carregando, cotacao, t]))


  function handleChange(field: keyof EstadoFormularioRespostaCotacao, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idDisparo) return

    const erroValidacao = obterErroValidacaoFormularioRespostaCotacao(form, {
      modal: cotacao?.modal_cotacao_bid_frete_internacional,
      modalidade: cotacao?.modalidade_cotacao_bid_frete_internacional,
      incluirArmazenagem: cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional,
      cotacao,
      mensagemCamposObrigatorios: t('bidfrete.visao_fornecedor_bid_frete_internacional_publico.campos_obrigatorios'),
      mensagemArmazenagemInvalida: t('bidfrete.visao_fornecedor_bid_frete_internacional_publico.armazenagem_invalida'),
      mensagemLocalObrigatorio: t('bidfrete.portal.publico.local_obrigatorio', {
        defaultValue: 'Selecione o porto/aeroporto utilizado na proposta',
      }),
    })
    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const payload = montarPayloadPropostaRespostaBidFreteInternacional(
        form,
        cotacao?.modal_cotacao_bid_frete_internacional,
        cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional,
        cotacao?.modalidade_cotacao_bid_frete_internacional,
      )
      await enviarVisaoFornecedorBidFreteInternacionalProposta(idDisparo, payload)
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof BidFreteApiError || err instanceof Error ? err.message : 'Erro ao enviar resposta')
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <PaginaGlobal className="brc-page brc-page--logado bid-frete-page-shell">
        <ShellPaginaRespostaCotacao modo="logado">
          <EstadoMensagemRespostaCotacao
            variante="sucesso"
            titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.sucesso')}
            descricao={t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.sucesso_desc')}
            acao={(
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                type="button"
                onClick={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes)}
              >
                {t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.voltar_pendentes')}
              </BotaoGlobal>
            )}
          />
        </ShellPaginaRespostaCotacao>
      </PaginaGlobal>
    )
  }

  return (
    <PaginaGlobal className="brc-page brc-page--logado bid-frete-page-shell">
      <div className="brc-toolbar-logado">
        <BotaoGlobal
          variante="secundario"
          tamanho="medio"
          type="button"
          icone={<ArrowLeft weight="bold" size={14} />}
          onClick={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes)}
        >
          {t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.voltar')}
        </BotaoGlobal>
      </div>

      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <div className="brc-shell">
          <div className="brc-card brc-card--form">
            <CabecalhoFormularioRespostaCotacao
              titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao.titulo')}
              contextoCabecalho={{
                nomeAgente,
                tipoOperacao: cotacao?.tipo_operacao_cotacao_bid_frete_internacional,
                anonima: cotacao?.anonima_cotacao_bid_frete_internacional,
                nomeCliente: cotacao?.nome_cliente_operacao_cotacao_bid_frete_internacional,
              }}
              t={t}
            />
            <div className="brc-layout-logado">
              {modoEdicao ? (
                <AvisoEdicaoPropostaResposta texto={t('bidfrete.portal.publico.aviso_edicao')} />
              ) : null}
              <SecaoDetalhesCotacaoResposta
                cotacao={cotacao}
                tituloSecao={rotulos.detalhes}
                rotuloNumero={rotulos.numero}
                rotuloRota={rotulos.rota}
                rotuloModal={rotulos.modal}
                rotuloIncoterm={rotulos.incoterm}
                rotuloCarga={rotulos.carga}
                numeroFallback={bid?.id_cotacao_bid_frete_internacional.slice(0, 8).toUpperCase()}
              />
              <FormPropostaRespostaCotacao
                form={form}
                cotacaoLocais={cotacao}
                modalCotacao={cotacao?.modal_cotacao_bid_frete_internacional}
                modalidadeCotacao={cotacao?.modalidade_cotacao_bid_frete_internacional}
                incluirArmazenagemCotacao={cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional === true}
                onChange={handleChange}
                onLinhasOrigemChange={(linhas) => setForm((prev) => ({ ...prev, linhas_taxa_origem: linhas }))}
                onLinhasDestinoChange={(linhas) => setForm((prev) => ({ ...prev, linhas_taxa_destino: linhas }))}
                onLinhasPeriodoArmazenagemChange={(linhas) =>
                  setForm((prev) => ({ ...prev, linhas_periodo_armazenagem: linhas }))
                }
                onLinhasFaixaValorFreteChange={(linhas) =>
                  setForm((prev) => ({ ...prev, linhas_faixa_valor_frete_proposta: linhas }))
                }
                onSubmit={handleSubmit}
                tituloSecao={rotulos.proposta}
                rotulos={rotulos}
                erro={erro}
                enviando={enviando}
                textoEnviar={modoEdicao ? t('bidfrete.portal.publico.atualizar_proposta') : rotulos.enviar}
                textoEnviando={modoEdicao ? t('bidfrete.portal.publico.atualizando') : rotulos.enviando}
              />
            </div>
          </div>
        </div>
      )}
    </PaginaGlobal>
  )
}
