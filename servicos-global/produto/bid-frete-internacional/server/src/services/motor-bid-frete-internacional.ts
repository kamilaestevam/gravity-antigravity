/**
 * motor-bid.ts — Motor de Disparo de BIDs
 * Responsável por:
 * 1. Criar disparos de cotação para cada fornecedor selecionado
 * 2. Disparar via Email (Resend) e/ou WhatsApp (Meta Cloud API)
 * 3. Gerar tokens públicos para resposta sem login
 * 4. Verificar tabelas de valor para cotação automática
 * 5. Despachar para connectors de APIs externas
 */

import { PrismaClient } from '../generated/client/index.js'
import { randomUUID } from 'crypto'
import axios from 'axios'
import {
  extrairMensagemErroDisparo,
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
  montarTextoPlanoEmailDisparo,
  type ParametrosEmailDisparoBidFreteInternacional,
} from './motor-bid-disparo-utils.js'
import {
  formatarCargaPerigosaEmailDisparoBidFrete,
  formatarDimensoesCubagemEmailDisparoBidFrete,
} from '../../../shared/formatar-email-disparo-bid-frete-internacional.js'
import { montarTextoLocalizacaoComplementarEmailDisparoBidFrete } from '../../../shared/localizacao-complementar-resumo-nova-cotacao-bid-frete-internacional.js'
import { parseCodigosOpcaoPortoAeroportoFromDb } from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'
import { calcularDataExpiracaoTokenDisparoBidFreteInternacional } from '../../../shared/calcular-data-expiracao-token-disparo-bid-frete-internacional.js'
import { enviarEmailDisparoCompradorBidFreteInternacional } from './enviar-emails-comprador-bid-frete-internacional.js'
import {
  montarTextoRotulosLocaisOpcionaisDisparoBidFrete,
  resolverRotulosLocaisOpcionaisDisparoBidFrete,
} from '../lib/resolver-rotulos-locais-opcionais-disparo-bid-frete-internacional.js'
import { snapshotPropostaFromCotacao } from '../lib/snapshot-proposta-bid-frete.js'
import { sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional } from '../lib/sincronizar-status-cotacao-apos-resposta-fornecedor-bid-frete-internacional.js'
import { buscarFornecedorCadastrosParaDisparo } from './buscar-fornecedor-cadastros-disparo.js'
import { garantirFornecedoresEspelhoDisparoBidFrete } from './garantir-fornecedores-espelho-disparo-bid-frete-internacional.js'
import { resolverNomeClienteOperacaoCotacaoDisparo } from '../lib/resolver-nome-cliente-cotacao-resposta-bid-frete-internacional.js'
import { lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional } from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'
import {
  resolverEmailsDisparoBidFrete,
  resolverWhatsappsDisparoBidFrete,
  type FornecedorEspelhoBidDisparo,
} from './resolver-contatos-disparo-bid-frete-internacional.js'
import { filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional } from './filtrar-fornecedores-disparo-bid-frete-internacional.js'
import type { ModalRotaCotacao } from '../../../shared/rota-cotacao-bid-frete-internacional.js'
import { REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL } from '../../../shared/remetente-email-bid-frete-internacional.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008'
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:8000'
const DISPARO_HTTP_TIMEOUT_MS = 30_000

/** Texto das alternativas de porto/aeroporto para o e-mail — nomes completos via Cadastros. */
async function montarTextoOpcoesLocaisEmailDisparo(
  modal: string | null | undefined,
  habilitado: boolean | null | undefined,
  codigosRaw: unknown,
): Promise<string | null> {
  if (!habilitado) return null
  const codigos = parseCodigosOpcaoPortoAeroportoFromDb(codigosRaw)
  if (codigos.length === 0) return null
  const rotulos = await resolverRotulosLocaisOpcionaisDisparoBidFrete(modal, codigos)
  return montarTextoRotulosLocaisOpcionaisDisparoBidFrete(rotulos)
}

/** Texto dos armazéns alfandegados de preferência (coluna Json) para o e-mail de disparo. */
function montarTextoNomesArmazensDisparo(nomesRaw: unknown): string | null {
  if (!Array.isArray(nomesRaw)) return null
  const nomes = nomesRaw
    .filter((nome): nome is string => typeof nome === 'string')
    .map((nome) => nome.trim())
    .filter(Boolean)
  return nomes.length > 0 ? nomes.join(', ') : null
}

function montarLocalizacaoComplementarEmailDisparoFromCotacao(
  cotacao: Record<string, unknown>,
  lado: 'origem' | 'destino',
): string | null {
  if (lado === 'origem') {
    return montarTextoLocalizacaoComplementarEmailDisparoBidFrete({
      paisCodigo: cotacao.origem_pais_cotacao_bid_frete_internacional as string | null | undefined,
      estadoProvincia:
        cotacao.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional as string | null | undefined,
      cidade: cotacao.cidade_origem_rodoviario_cotacao_bid_frete_internacional as string | null | undefined,
      endereco: cotacao.endereco_origem_cotacao_bid_frete_internacional as string | null | undefined,
    })
  }
  return montarTextoLocalizacaoComplementarEmailDisparoBidFrete({
    paisCodigo: cotacao.destino_pais_cotacao_bid_frete_internacional as string | null | undefined,
    estadoProvincia:
      cotacao.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional as string | null | undefined,
    cidade: cotacao.cidade_destino_rodoviario_cotacao_bid_frete_internacional as string | null | undefined,
    endereco: cotacao.endereco_destino_cotacao_bid_frete_internacional as string | null | undefined,
  })
}

type CanalDisparoMotor = 'EMAIL' | 'WHATSAPP'
type TipoFornecedorMotor = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'

function espelhoDisparoFromFornecedor(fornecedor: Record<string, unknown>): FornecedorEspelhoBidDisparo {
  return {
    id_fornecedor_bid_frete_internacional: String(fornecedor.id_fornecedor_bid_frete_internacional),
    nome_fornecedor_bid_frete_internacional: fornecedor.nome_fornecedor_bid_frete_internacional as string | undefined,
    email_fornecedor_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional as string | undefined,
    whatsapp_fornecedor_bid_frete_internacional: fornecedor.whatsapp_fornecedor_bid_frete_internacional as string | null | undefined,
  }
}

interface DispararBidOptions {
  id_cotacao_bid_frete_internacional: string
  fornecedor_ids: string[]
  canais: CanalDisparoMotor[]
  id_usuario: string
  id_organizacao: string
  /** E-mails escolhidos no modal de disparo (Cadastros SSOT). */
  emails_por_fornecedor?: Record<string, string[]>
}

interface DispararCotacaoAbertaOptions {
  id_cotacao_bid_frete_internacional: string
  canais: CanalDisparoMotor[]
  id_usuario: string
  id_organizacao: string
  tipos_fornecedor?: TipoFornecedorMotor[]
}

export const motorBid = {
  /**
   * Dispara BIDs para fornecedores selecionados
   */
  async disparar(prisma: PrismaClient, options: DispararBidOptions) {
    const {
      id_cotacao_bid_frete_internacional,
      fornecedor_ids,
      canais,
      id_usuario,
      id_organizacao,
      emails_por_fornecedor,
    } = options

    // Buscar cotacao
    const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional } })
    if (!cotacao) throw new Error('Cotacao nao encontrada')

    const modal = cotacao.modal_cotacao_bid_frete_internacional as ModalRotaCotacao
    const fornecedor_ids_elegiveis = await filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional(
      id_organizacao,
      modal,
      fornecedor_ids,
    )

    if (fornecedor_ids_elegiveis.length === 0) {
      return {
        disparos: 0,
        enviados: false,
        results: [],
        message: 'Nenhum fornecedor elegivel para o modal da cotacao',
      }
    }

    await garantirFornecedoresEspelhoDisparoBidFrete(prisma, id_organizacao, fornecedor_ids_elegiveis)

    // Buscar fornecedores
    const fornecedores = await (prisma as any).fornecedorBidFreteInternacional.findMany({
      where: {
        id_fornecedor_bid_frete_internacional: { in: fornecedor_ids_elegiveis },
        status_fornecedor_bid_frete_internacional: 'ATIVO',
      },
    })

    if (fornecedores.length === 0) {
      return {
        disparos: 0,
        enviados: false,
        results: [],
        message: 'Nenhum fornecedor ativo encontrado no espelho BID para os IDs selecionados',
      }
    }

    const cadastrosPorFornecedor = new Map<string, Awaited<ReturnType<typeof buscarFornecedorCadastrosParaDisparo>>>()
    await Promise.all(
      (fornecedores as Array<{ id_fornecedor_bid_frete_internacional: string }>).map(async (f) => {
        const cadastros = await buscarFornecedorCadastrosParaDisparo(
          f.id_fornecedor_bid_frete_internacional,
          id_organizacao,
        )
        cadastrosPorFornecedor.set(f.id_fornecedor_bid_frete_internacional, cadastros)
      }),
    )

    const results: Array<{
      id_fornecedor_bid_frete_internacional: string
      nome_fornecedor_bid_frete_internacional: string
      canal_disparo_cotacao_bid_frete_internacional: string
      id_disparo_cotacao_bid_frete_internacional: string
      status_disparo_cotacao_bid_frete_internacional: 'ENVIADO' | 'ERRO_ENVIO'
      data_envio_disparo_cotacao_bid_frete_internacional?: Date
      erro_envio_disparo_cotacao_bid_frete_internacional?: string
    }> = []
    let algumDisparoEnviado = false

    const processarFornecedor = async (fornecedor: Record<string, unknown>) => {
      const fornecedorResults: typeof results = []
      let fornecedorEnviou = false
      const espelhoDisparo = espelhoDisparoFromFornecedor(fornecedor)
      const idFornecedor = String(fornecedor.id_fornecedor_bid_frete_internacional)
      const cadastrosDisparo = cadastrosPorFornecedor.get(idFornecedor) ?? null
      const tabelaMatch = await this.verificarTabelaPadrao(prisma, cotacao, fornecedor)

      for (const canal_disparo_cotacao_bid_frete_internacional of canais) {
        const token = randomUUID()
        const tokenExpira = calcularDataExpiracaoTokenDisparoBidFreteInternacional(
          cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
        )

        const disparo_cotacao = await (prisma as any).disparoCotacaoBidFreteInternacional.create({
          data: {
            id_produto_gravity: 'bid-frete-internacional',
            id_usuario,
            id_organizacao,
            id_cotacao_bid_frete_internacional,
            id_fornecedor_bid_frete_internacional: idFornecedor,
            canal_disparo_cotacao_bid_frete_internacional,
            status_disparo_cotacao_bid_frete_internacional: 'PENDENTE',
            token_resposta_disparo_cotacao_bid_frete_internacional: token,
            data_expiracao_token_disparo_cotacao_bid_frete_internacional: tokenExpira,
          },
        })

        let statusDisparo: 'ENVIADO' | 'ERRO_ENVIO' = 'ENVIADO'
        let erroDisparo: string | undefined
        let dataEnvioDisparo: Date | undefined
        try {
          let idMensagem: string | null = null
          if (canal_disparo_cotacao_bid_frete_internacional === 'EMAIL') {
            const overrideEmails = emails_por_fornecedor?.[idFornecedor]
              ?.map(e => e.trim().toLowerCase())
              .filter(e => e.length > 0)
            const emails = overrideEmails && overrideEmails.length > 0
              ? [...new Set(overrideEmails)]
              : resolverEmailsDisparoBidFrete(espelhoDisparo, cadastrosDisparo)
            if (emails.length === 0) {
              throw new Error(
                `Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem e-mail cadastrado`,
              )
            }
            for (const email of emails) {
              idMensagem = await this.dispararEmail(
                cotacao,
                fornecedor,
                token,
                tokenExpira,
                id_organizacao,
                id_usuario,
                email,
              )
            }
          } else if (canal_disparo_cotacao_bid_frete_internacional === 'WHATSAPP') {
            const whatsapps = resolverWhatsappsDisparoBidFrete(espelhoDisparo, cadastrosDisparo)
            if (whatsapps.length === 0) {
              throw new Error(
                `Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem WhatsApp cadastrado`,
              )
            }
            await this.dispararWhatsApp(cotacao, fornecedor, token, id_organizacao, whatsapps[0])
          }

          await (prisma as any).disparoCotacaoBidFreteInternacional.update({
            where: { id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional },
            data: {
              status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
              data_envio_disparo_cotacao_bid_frete_internacional: new Date(),
              ...(idMensagem ? { id_mensagem_disparo_cotacao_bid_frete_internacional: idMensagem } : {}),
            },
          })
          dataEnvioDisparo = new Date()
          fornecedorEnviou = true
        } catch (err: unknown) {
          statusDisparo = 'ERRO_ENVIO'
          const errorMessage = extrairMensagemErroDisparo(err, EMAIL_SERVICE_URL)
          erroDisparo = errorMessage
          try {
            await (prisma as any).disparoCotacaoBidFreteInternacional.update({
              where: { id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional },
              data: {
                status_disparo_cotacao_bid_frete_internacional: 'ERRO_ENVIO',
                erro_envio_disparo_cotacao_bid_frete_internacional: errorMessage,
              },
            })
          } catch (updateErr: unknown) {
            console.error('[motor-bid] falha ao registrar erro_envio do disparo:', updateErr)
            await (prisma as any).disparoCotacaoBidFreteInternacional.update({
              where: { id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional },
              data: { status_disparo_cotacao_bid_frete_internacional: 'ERRO_ENVIO' },
            })
          }
        }

        fornecedorResults.push({
          id_fornecedor_bid_frete_internacional: idFornecedor,
          nome_fornecedor_bid_frete_internacional: String(fornecedor.nome_fornecedor_bid_frete_internacional ?? ''),
          canal_disparo_cotacao_bid_frete_internacional,
          id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional,
          status_disparo_cotacao_bid_frete_internacional: statusDisparo,
          ...(dataEnvioDisparo ? { data_envio_disparo_cotacao_bid_frete_internacional: dataEnvioDisparo } : {}),
          ...(erroDisparo ? { erro_envio_disparo_cotacao_bid_frete_internacional: erroDisparo } : {}),
        })
      }

      if (tabelaMatch && fornecedor.cotacao_automatica_fornecedor_bid_frete_internacional) {
        try {
          await this.gerarPropostaAutomatica(prisma, cotacao, fornecedor, tabelaMatch)
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          console.error('[motor-bid] proposta automatica falhou:', errorMessage)
        }
      }

      return { fornecedorResults, fornecedorEnviou }
    }

    const batches = await Promise.all(fornecedores.map(f => processarFornecedor(f as Record<string, unknown>)))
    for (const batch of batches) {
      results.push(...batch.fornecedorResults)
      if (batch.fornecedorEnviou) algumDisparoEnviado = true
    }

    if (algumDisparoEnviado) {
      await (prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES' },
      })

      const fornecedoresEnviados = new Set(
        results
          .filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO')
          .map(r => r.id_fornecedor_bid_frete_internacional),
      ).size

      const datasEnvio = results
        .map(r => r.data_envio_disparo_cotacao_bid_frete_internacional)
        .filter((data): data is Date => data instanceof Date)
      const dataHoraDisparo = datasEnvio.length > 0
        ? new Date(Math.min(...datasEnvio.map(d => d.getTime())))
        : new Date()

      await enviarEmailDisparoCompradorBidFreteInternacional(prisma, {
        id_organizacao,
        id_usuario,
        id_cotacao_bid_frete_internacional,
        quantidadeFornecedores: fornecedoresEnviados,
        parametros: {
          numeroCotacao: String(cotacao.numero_cotacao_bid_frete_internacional ?? id_cotacao_bid_frete_internacional),
          referenciaInterna: cotacao.referencia_interna_cotacao_bid_frete_internacional,
          modal: String(cotacao.modal_cotacao_bid_frete_internacional ?? ''),
          modalidade: cotacao.modalidade_cotacao_bid_frete_internacional,
          origemNome: String(cotacao.origem_nome_cotacao_bid_frete_internacional ?? ''),
          origemPais: String(cotacao.origem_pais_cotacao_bid_frete_internacional ?? ''),
          destinoNome: String(cotacao.destino_nome_cotacao_bid_frete_internacional ?? ''),
          destinoPais: String(cotacao.destino_pais_cotacao_bid_frete_internacional ?? ''),
          incoterm: String(cotacao.incoterm_cotacao_bid_frete_internacional ?? ''),
          mercadoria: String(cotacao.descricao_mercadoria_cotacao_bid_frete_internacional ?? ''),
          data_limite_resposta_cotacao_bid_frete_internacional:
            cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
          dataHoraDisparo,
          fornecedoresDisparo: results.map(r => ({
            nomeFornecedor: r.nome_fornecedor_bid_frete_internacional,
            canal: r.canal_disparo_cotacao_bid_frete_internacional,
            dataHoraEnvio: r.data_envio_disparo_cotacao_bid_frete_internacional ?? null,
            status: r.status_disparo_cotacao_bid_frete_internacional,
          })),
        },
      })
    }

    const enviadosOk = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO').length
    const errosEnvio = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ERRO_ENVIO').length

    return {
      disparos: results.length,
      enviados: algumDisparoEnviado,
      enviados_ok: enviadosOk,
      erros_envio: errosEnvio,
      results,
    }
  },

  async dispararCotacaoAberta(prisma: PrismaClient, options: DispararCotacaoAbertaOptions) {
    const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
      where: { id_cotacao_bid_frete_internacional: options.id_cotacao_bid_frete_internacional },
      select: { modal_cotacao_bid_frete_internacional: true },
    })
    if (!cotacao) throw new Error('Cotacao nao encontrada')

    const modal = cotacao.modal_cotacao_bid_frete_internacional as ModalRotaCotacao

    const where: Record<string, unknown> = {
      id_produto_gravity: 'bid-frete-internacional',
      status_fornecedor_bid_frete_internacional: 'ATIVO',
      aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    }
    if (options.tipos_fornecedor?.length) {
      where.tipo_fornecedor_bid_frete_internacional = { in: options.tipos_fornecedor }
    }

    const fornecedores = await (prisma as any).fornecedorBidFreteInternacional.findMany({
      where,
      select: {
        id_fornecedor_bid_frete_internacional: true,
        tipo_fornecedor_bid_frete_internacional: true,
      },
    })

    const fornecedor_ids = await filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional(
      options.id_organizacao,
      modal,
      (fornecedores as Array<{ id_fornecedor_bid_frete_internacional: string }>).map(
        (f) => f.id_fornecedor_bid_frete_internacional,
      ),
      {
        tiposEspelhoPorId: new Map(
          (fornecedores as Array<{
            id_fornecedor_bid_frete_internacional: string
            tipo_fornecedor_bid_frete_internacional: TipoFornecedorMotor
          }>).map(f => [f.id_fornecedor_bid_frete_internacional, f.tipo_fornecedor_bid_frete_internacional]),
        ),
      },
    )

    if (fornecedor_ids.length === 0) {
      return { disparos: 0, results: [], message: 'Nenhum fornecedor ativo aceita cotacao aberta para este modal' }
    }

    return this.disparar(prisma, {
      id_cotacao_bid_frete_internacional: options.id_cotacao_bid_frete_internacional,
      fornecedor_ids,
      canais: options.canais,
      id_usuario: options.id_usuario,
      id_organizacao: options.id_organizacao,
    })
  },

  /**
   * Verifica se fornecedor tem tabela de precos compativel com a cotacao
   */
  async verificarTabelaPadrao(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const agora = new Date()

    const tabela = await (prisma as any).tabelaBidFreteInternacional.findFirst({
      where: {
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        origem_codigo_tabela_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
        destino_codigo_tabela_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
        modal_tabela_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
        modalidade_tabela_bid_frete_internacional: cotacao.modalidade_cotacao_bid_frete_internacional,
        ativa_tabela_bid_frete_internacional: true,
        validade_inicio_tabela_bid_frete_internacional: { lte: agora },
        validade_fim_tabela_bid_frete_internacional: { gte: agora },
      },
      orderBy: { valor_total_tabela_bid_frete_internacional: 'asc' },
    })

    return tabela
  },

  /**
   * Gera proposta automática a partir da tabela de valor
   */
  async gerarPropostaAutomatica(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>, _tabela: Record<string, unknown>) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const tabela = _tabela as any

    // Buscar disparo correspondente
    const disparo_cotacao = await (prisma as any).disparoCotacaoBidFreteInternacional.findFirst({
      where: {
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
      },
      orderBy: { data_criacao_disparo_cotacao_bid_frete_internacional: 'desc' },
    })

    if (!disparo_cotacao) return null

    const snapshotProposta = snapshotPropostaFromCotacao(cotacao)

    const proposta = await (prisma as any).propostaBidFreteInternacional.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_organizacao: cotacao.id_organizacao,
        ...snapshotProposta,
        id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional,
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        moeda_proposta_bid_frete_internacional: tabela.moeda_tabela_bid_frete_internacional,
        valor_frete_proposta_bid_frete_internacional: tabela.valor_frete_tabela_bid_frete_internacional,
        taxas_origem_proposta_bid_frete_internacional: tabela.taxas_origem_tabela_bid_frete_internacional,
        taxas_destino_proposta_bid_frete_internacional: tabela.taxas_destino_tabela_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: tabela.valor_total_tabela_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: tabela.dias_transito_tabela_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: tabela.dias_free_time_tabela_bid_frete_internacional,
        dias_prazo_pagamento_proposta_bid_frete_internacional: tabela.dias_prazo_pagamento_tabela_bid_frete_internacional ?? undefined,
        validade_proposta_bid_frete_internacional: tabela.validade_fim_tabela_bid_frete_internacional,
        via_tabela_proposta_bid_frete_internacional: true,
      },
    })

    // Atualizar disparo como respondido
    await (prisma as any).disparoCotacaoBidFreteInternacional.update({
      where: { id_disparo_cotacao_bid_frete_internacional: disparo_cotacao.id_disparo_cotacao_bid_frete_internacional },
      data: {
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_resposta_disparo_cotacao_bid_frete_internacional: new Date(),
      },
    })

    await sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional(
      prisma,
      cotacao.id_cotacao_bid_frete_internacional,
      cotacao.status_cotacao_bid_frete_internacional,
    )

    return proposta
  },

  async dispararEmail(
    _cotacao: Record<string, unknown>,
    _fornecedor: Record<string, unknown>,
    token: string,
    dataExpiracaoToken: Date | null,
    id_organizacao: string,
    id_usuario: string,
    emailDestino: string,
  ): Promise<string | null> {
    const cotacao = _cotacao as Record<string, any>
    const fornecedor = _fornecedor as Record<string, any>
    const email = emailDestino.trim()
    if (!email) {
      throw new Error(`Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem e-mail cadastrado`)
    }

    const linkResposta = montarLinkRespostaDisparo(APP_URL, token)
    const [opcoesOrigemTexto, opcoesDestinoTexto, nomeClienteOperacao] = await Promise.all([
      montarTextoOpcoesLocaisEmailDisparo(
        cotacao.modal_cotacao_bid_frete_internacional,
        cotacao.habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
        cotacao.codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional,
      ),
      montarTextoOpcoesLocaisEmailDisparo(
        cotacao.modal_cotacao_bid_frete_internacional,
        cotacao.habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
        cotacao.codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional,
      ),
      resolverNomeClienteOperacaoCotacaoDisparo({
        id_workspace: cotacao.id_workspace,
        anonima_cotacao_bid_frete_internacional: cotacao.anonima_cotacao_bid_frete_internacional,
      }),
    ])
    const parametrosEmail: ParametrosEmailDisparoBidFreteInternacional = {
      nomeFornecedor: fornecedor.nome_fornecedor_bid_frete_internacional ?? '',
      numeroCotacao: cotacao.numero_cotacao_bid_frete_internacional,
      referenciaInterna: cotacao.referencia_interna_cotacao_bid_frete_internacional,
      modal: cotacao.modal_cotacao_bid_frete_internacional,
      modalidade: cotacao.modalidade_cotacao_bid_frete_internacional,
      origemNome: cotacao.origem_nome_cotacao_bid_frete_internacional,
      origemPais: cotacao.origem_pais_cotacao_bid_frete_internacional,
      destinoNome: cotacao.destino_nome_cotacao_bid_frete_internacional,
      destinoPais: cotacao.destino_pais_cotacao_bid_frete_internacional,
      opcoesOrigemTexto,
      opcoesDestinoTexto,
      localizacaoOrigemTexto: montarLocalizacaoComplementarEmailDisparoFromCotacao(cotacao, 'origem'),
      localizacaoDestinoTexto: montarLocalizacaoComplementarEmailDisparoFromCotacao(cotacao, 'destino'),
      mercadoria: cotacao.descricao_mercadoria_cotacao_bid_frete_internacional,
      ncm: cotacao.ncm_cotacao_bid_frete_internacional,
      hsCode: cotacao.hs_code_cotacao_bid_frete_internacional,
      incoterm: cotacao.incoterm_cotacao_bid_frete_internacional,
      tipoContainer: cotacao.tipo_container_cotacao_bid_frete_internacional,
      quantidade: cotacao.quantidade_volume_cotacao_bid_frete_internacional,
      pesoKg: cotacao.peso_kg_cotacao_bid_frete_internacional,
      pesoTon: cotacao.peso_ton_cotacao_bid_frete_internacional,
      cubagemM3: cotacao.cubagem_m3_cotacao_bid_frete_internacional,
      dimensoesCubagemTexto: formatarDimensoesCubagemEmailDisparoBidFrete({
        comprimento: cotacao.comprimento_cubagem_cotacao_bid_frete_internacional,
        largura: cotacao.largura_cubagem_cotacao_bid_frete_internacional,
        altura: cotacao.altura_cubagem_cotacao_bid_frete_internacional,
        codigoUnidade: cotacao.codigo_unidade_cubagem_cotacao_bid_frete_internacional,
      }),
      cargaPerigosaTexto: formatarCargaPerigosaEmailDisparoBidFrete({
        ehCargaPerigosa: cotacao.eh_carga_perigosa_cotacao_bid_frete_internacional,
        numeroOnu: cotacao.numero_onu_cotacao_bid_frete_internacional,
        nomeTecnicoEmbarque: cotacao.nome_tecnico_embarque_cotacao_bid_frete_internacional,
        classe: cotacao.classe_carga_perigosa_cotacao_bid_frete_internacional,
        divisao: cotacao.divisao_carga_perigosa_cotacao_bid_frete_internacional,
        grupoEmbalagem: cotacao.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional,
        observacoes: cotacao.observacoes_carga_perigosa_cotacao_bid_frete_internacional,
      }),
      incluirArmazenagem: cotacao.incluir_armazenagem_cotacao_bid_frete_internacional === true,
      nomesArmazensTexto: montarTextoNomesArmazensDisparo(
        cotacao.nomes_armazem_alfandegado_cotacao_bid_frete_internacional,
      ),
      dataLimiteResposta: cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
      dataExpiracaoToken,
      nomeClienteOperacao,
      anonimaCotacao: cotacao.anonima_cotacao_bid_frete_internacional === true,
      tipoOperacao: cotacao.tipo_operacao_cotacao_bid_frete_internacional,
      linkResposta,
      empresaPagadoraTaxaFechamentoPlataformaGravity: lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
        cotacao.id_cotacao_bid_frete_internacional,
      ),
    }

    const response = await axios.post(
      `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
      {
        to: email,
        subject: montarAssuntoEmailDisparo(parametrosEmail),
        body_html: montarHtmlEmailDisparo(parametrosEmail),
        body: montarTextoPlanoEmailDisparo(parametrosEmail),
        product_id: 'bid-frete-internacional',
        from: REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL,
      },
      {
        headers: {
          'x-chave-interna-servico': INTERNAL_KEY,
          'x-id-organizacao': id_organizacao,
          'x-id-usuario': id_usuario,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
        timeout: DISPARO_HTTP_TIMEOUT_MS,
      },
    )

    if (response.status < 200 || response.status >= 300) {
      const msg = (response.data as { error?: { message?: string }; message?: string })?.error?.message
        ?? (response.data as { message?: string })?.message
        ?? `HTTP ${response.status}`
      throw new Error(`Falha ao enviar e-mail: ${msg}`)
    }

    return (response.data as { resend_id?: string | null })?.resend_id ?? null
  },

  async dispararWhatsApp(
    _cotacao: Record<string, unknown>,
    _fornecedor: Record<string, unknown>,
    token: string,
    id_organizacao: string,
    whatsappDestino: string,
  ) {
    const cotacao = _cotacao as Record<string, any>
    const fornecedor = _fornecedor as Record<string, any>
    const whatsapp = whatsappDestino.trim()
    if (!whatsapp) {
      throw new Error(`Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem WhatsApp cadastrado`)
    }

    const linkResposta = montarLinkRespostaDisparo(APP_URL, token)

    const response = await axios.post(
      `${WHATSAPP_SERVICE_URL}/api/v1/whatsapp/send`,
      {
        phone_number: whatsapp,
        text:
          `*Solicitação de Cotação — ${cotacao.numero_cotacao_bid_frete_internacional}*\n\n` +
          `Modal: ${cotacao.modal_cotacao_bid_frete_internacional}\n` +
          `Origem: ${cotacao.origem_nome_cotacao_bid_frete_internacional}\n` +
          `Destino: ${cotacao.destino_nome_cotacao_bid_frete_internacional}\n` +
          `Mercadoria: ${cotacao.descricao_mercadoria_cotacao_bid_frete_internacional}\n` +
          `Incoterm: ${cotacao.incoterm_cotacao_bid_frete_internacional}\n\n` +
          `Responda pelo link: ${linkResposta}`,
      },
      {
        headers: {
          'x-chave-interna-servico': INTERNAL_KEY,
          'x-id-organizacao': id_organizacao,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
        timeout: DISPARO_HTTP_TIMEOUT_MS,
      },
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Falha ao enviar WhatsApp: HTTP ${response.status}`)
    }
  },
}
