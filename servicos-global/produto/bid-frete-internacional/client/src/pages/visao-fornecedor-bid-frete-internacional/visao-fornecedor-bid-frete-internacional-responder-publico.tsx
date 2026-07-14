/**

 * Formulário público de resposta (sem login) — token na URL.

 */



import React, { useState, useEffect, useCallback, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { ConteudoCarregandoBidFreteInternacional } from '../../shared/pagina-carregando-bid-frete-internacional'

import {

  BidFreteApiError,

  getVisaoFornecedorBidFreteInternacionalPublicoDisparo,

  enviarVisaoFornecedorBidFreteInternacionalPropostaPublico as enviarPropostaPublicoApi,

} from '../../shared/api'

import type { CodigoBloqueioRespostaDisparoBidFreteInternacional } from '../../shared/visao-fornecedor-bid-frete-internacional-schemas'

import { montarPayloadPropostaRespostaBidFreteInternacional } from '../../shared/montar-payload-proposta-resposta-bid-frete-internacional'
import { estadoInicialFormularioRespostaFromCotacao } from '../../shared/faixas-valor-frete-proposta-bid-frete-internacional'
import type { DisparoCotacaoBidFreteInternacional } from '../../shared/types'

import {

  CabecalhoFormularioRespostaCotacao,

  ESTADO_INICIAL_FORMULARIO_RESPOSTA,

  EstadoMensagemRespostaCotacao,

  FormPropostaRespostaCotacao,

  SecaoDetalhesCotacaoResposta,

  ShellPaginaRespostaCotacao,

  AvisoEdicaoPropostaResposta,

  FaixaUltimaAlteracaoPropostaResposta,

  chaveDescricaoBloqueioRespostaPublico,

  chaveTituloBloqueioRespostaPublico,

  criarRotulosFormularioResposta,

  obterErroValidacaoFormularioRespostaCotacao,

  estadoFormularioFromProposta,

  type DetalhesCotacaoResposta,

  type EstadoFormularioRespostaCotacao,

} from '../../shared/formulario-resposta-cotacao-bid-frete-internacional'



type PageState = 'loading' | 'invalid' | 'blocked' | 'form' | 'success'



export default function ResponderPublico() {

  const { token_resposta_disparo_cotacao_bid_frete_internacional: token } = useParams<{

    token_resposta_disparo_cotacao_bid_frete_internacional: string

  }>()

  const { t } = useTranslation()



  const [pageState, setPageState] = useState<PageState>('loading')

  const [disparo, setDisparo] = useState<DisparoCotacaoBidFreteInternacional | null>(null)

  const [modoEdicao, setModoEdicao] = useState(false)

  const [codigoBloqueio, setCodigoBloqueio] = useState<CodigoBloqueioRespostaDisparoBidFreteInternacional>(null)

  const [enviando, setEnviando] = useState(false)

  const [erro, setErro] = useState('')

  const [form, setForm] = useState<EstadoFormularioRespostaCotacao>(ESTADO_INICIAL_FORMULARIO_RESPOSTA)



  const rotulos = useMemo(

    () => criarRotulosFormularioResposta(t, 'bidfrete.portal.responder'),

    [t],

  )



  const cotacao = disparo?.cotacao as DetalhesCotacaoResposta | undefined

  const nomeFornecedor =

    disparo?.fornecedor?.nome_fornecedor_bid_frete_internacional ?? ''



  const carregar = useCallback(async () => {

    if (!token) {

      setPageState('invalid')

      return

    }

    try {

      const data = await getVisaoFornecedorBidFreteInternacionalPublicoDisparo(token)

      setDisparo(data.disparo)



      if (data.modo_acesso_resposta_disparo_bid_frete_internacional === 'bloqueado') {

        setCodigoBloqueio(data.codigo_bloqueio_resposta_disparo_bid_frete_internacional)

        setPageState('blocked')

        return

      }



      const editando = data.modo_acesso_resposta_disparo_bid_frete_internacional === 'editar'

      setModoEdicao(editando)

      if (editando && data.disparo.proposta) {
        const formEdicao = estadoFormularioFromProposta(data.disparo.proposta)
        setForm(formEdicao)
      } else {
        setForm({
          ...ESTADO_INICIAL_FORMULARIO_RESPOSTA,
          ...estadoInicialFormularioRespostaFromCotacao(data.disparo.cotacao),
        })
      }

      setPageState('form')

    } catch (err) {

      if (err instanceof BidFreteApiError && err.code === 'TOKEN_INVALID') {

        setPageState('invalid')

        return

      }

      setPageState('invalid')

    }

  }, [token])



  useEffect(() => { carregar() }, [carregar])





  function handleChange(field: keyof EstadoFormularioRespostaCotacao, value: string) {

    setForm((prev) => ({ ...prev, [field]: value }))

    setErro('')

  }



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    if (!token) return



    const erroValidacao = obterErroValidacaoFormularioRespostaCotacao(form, {
      modal: cotacao?.modal_cotacao_bid_frete_internacional,
      modalidade: cotacao?.modalidade_cotacao_bid_frete_internacional,
      incluirArmazenagem: cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional,
      cotacao,
      mensagemCamposObrigatorios: t('bidfrete.portal.publico.campos_obrigatorios'),
      mensagemArmazenagemInvalida: t('bidfrete.portal.publico.armazenagem_invalida'),
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

      await enviarPropostaPublicoApi(token, payload)

      setPageState('success')

    } catch (err) {

      if (err instanceof BidFreteApiError) {

        const codigo = err.code as CodigoBloqueioRespostaDisparoBidFreteInternacional

        if (

          codigo === 'COTACAO_APROVADA'

          || codigo === 'COTACAO_REPROVADA'

          || codigo === 'PROPOSTA_APROVADA'

          || codigo === 'PROPOSTA_REPROVADA'

          || codigo === 'COTACAO_CANCELADA'

          || codigo === 'COTACAO_EXPIRADA'

          || codigo === 'PRAZO_RESPOSTA_ENCERRADO'

          || codigo === 'TOKEN_EXPIRED'

        ) {

          setCodigoBloqueio(codigo)

          setPageState('blocked')

          return

        }

      }

      setErro(err instanceof Error ? err.message : t('bidfrete.portal.publico.erro_envio'))

    } finally {

      setEnviando(false)

    }

  }



  if (pageState === 'loading') {

    return (

      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">

        <EstadoMensagemRespostaCotacao variante="carregando" titulo="">

          <ConteudoCarregandoBidFreteInternacional />

        </EstadoMensagemRespostaCotacao>

      </ShellPaginaRespostaCotacao>

    )

  }



  if (pageState === 'invalid') {

    return (

      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">

        <EstadoMensagemRespostaCotacao

          variante="invalido"

          titulo={t('bidfrete.portal.publico.invalido_titulo')}

          descricao={t('bidfrete.portal.publico.invalido_desc')}

          descricaoExtra={t('bidfrete.portal.publico.invalido_contato')}

        />

      </ShellPaginaRespostaCotacao>

    )

  }



  if (pageState === 'blocked') {

    const tituloKey = chaveTituloBloqueioRespostaPublico(codigoBloqueio)

    const descKey = chaveDescricaoBloqueioRespostaPublico(codigoBloqueio)

    return (

      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">

        <EstadoMensagemRespostaCotacao

          variante="bloqueado"

          titulo={t(tituloKey, { defaultValue: t('bidfrete.portal.publico.invalido_titulo') })}

          descricao={t(descKey, { defaultValue: t('bidfrete.portal.publico.invalido_desc') })}

          descricaoExtra={t('bidfrete.portal.publico.invalido_contato')}

        />

      </ShellPaginaRespostaCotacao>

    )

  }



  if (pageState === 'success') {

    return (

      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">

        <EstadoMensagemRespostaCotacao

          variante="sucesso"

          titulo={

            modoEdicao

              ? t('bidfrete.portal.publico.obrigado_atualizacao_titulo')

              : t('bidfrete.portal.publico.obrigado_titulo')

          }

          descricao={

            modoEdicao

              ? t('bidfrete.portal.publico.obrigado_atualizacao_desc')

              : t('bidfrete.portal.publico.obrigado_desc')

          }

        />

      </ShellPaginaRespostaCotacao>

    )

  }



  return (

    <ShellPaginaRespostaCotacao modo="publico">

        <div className="brc-card brc-card--form">

          <CabecalhoFormularioRespostaCotacao
            titulo={`BID Frete Internacional — ${t('bidfrete.portal.responder.titulo')}`}
            contextoCabecalho={{
              nomeAgente: nomeFornecedor,
              tipoOperacao: cotacao?.tipo_operacao_cotacao_bid_frete_internacional,
              anonima: cotacao?.anonima_cotacao_bid_frete_internacional,
              nomeCliente: cotacao?.nome_cliente_operacao_cotacao_bid_frete_internacional,
            }}
            t={t}
          />

          {modoEdicao ? (

            <AvisoEdicaoPropostaResposta texto={t('bidfrete.portal.publico.aviso_edicao')} />

          ) : null}

          <FaixaUltimaAlteracaoPropostaResposta
            registro={disparo?.proposta?.ultimo_registro_alteracao_proposta_bid_frete_internacional}
            t={t}
          />

          <SecaoDetalhesCotacaoResposta

            cotacao={cotacao}

            tituloSecao={rotulos.detalhes}

            rotuloNumero={rotulos.numero}

            rotuloRota={rotulos.rota}

            rotuloModal={rotulos.modal}

            rotuloIncoterm={rotulos.incoterm}

            rotuloCarga={rotulos.carga}

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

    </ShellPaginaRespostaCotacao>

  )

}

