/**
 * Agrega disparos do fornecedor em pinos e rotas para o mapa da visão fornecedor.
 * Coordenadas resolvidas via Cadastros (porto ou aeroporto).
 */

import { montarAlertaDivergenciaCadastrosMapa } from '../../../shared/divergencia-cadastros-rota-bid-frete-internacional.js'
import { resolverLocalCadastrosBidFreteInternacional } from './resolver-local-cadastros-bid-frete-internacional.js'

export type PinoMapaVisaoFornecedorBidFreteInternacional = {
  codigo_local_mapa_visao_fornecedor_bid_frete_internacional: string
  nome_local_mapa_visao_fornecedor_bid_frete_internacional: string
  nome_cotacao_local_mapa_visao_fornecedor_bid_frete_internacional: string
  pais_codigo_mapa_visao_fornecedor_bid_frete_internacional: string
  alerta_divergencia_cadastros_mapa_visao_fornecedor_bid_frete_internacional: string | null
  latitude_mapa_visao_fornecedor_bid_frete_internacional: number
  longitude_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: number
  melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: number | null
  modal_predominante_mapa_visao_fornecedor_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
}

export type RotaMapaVisaoFornecedorBidFreteInternacional = {
  codigo_origem_mapa_visao_fornecedor_bid_frete_internacional: string
  codigo_destino_mapa_visao_fornecedor_bid_frete_internacional: string
  modal_mapa_visao_fornecedor_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO' | 'EXPORTACAO' | null
  quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: number
  melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: number | null
  id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: string | null
  numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: string | null
  numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: string | null
  dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: number | null
  dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional: number | null
}

type DisparoComCotacao = {
  cotacao: {
    id_cotacao_bid_frete_internacional?: string
    numero_cotacao_bid_frete_internacional?: string
    id_bid_bid_frete_internacional?: string | null
    numero_bid_bid_frete_internacional?: string | null
    origem_codigo_cotacao_bid_frete_internacional: string
    origem_nome_cotacao_bid_frete_internacional: string
    origem_pais_cotacao_bid_frete_internacional: string
    destino_codigo_cotacao_bid_frete_internacional: string
    destino_nome_cotacao_bid_frete_internacional: string
    destino_pais_cotacao_bid_frete_internacional: string
    modal_cotacao_bid_frete_internacional: string
    tipo_operacao_cotacao_bid_frete_internacional?: string
  }
  proposta?: {
    valor_total_proposta_bid_frete_internacional?: number | null
    dias_transito_proposta_bid_frete_internacional?: number | null
  } | null
}

type LocalAcumulado = {
  codigo: string
  nomeCotacao: string
  paisCotacao: string
  quantidade: number
  quantidadeCotacoesAvulsas: number
  quantidadeBids: number
  valoresProposta: number[]
  modais: Record<string, number>
}

type MelhorPropostaRota = {
  valor: number
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  numero_bid_bid_frete_internacional: string | null
}

type RotaAcumulada = {
  origem: string
  destino: string
  modal: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  tipo_operacao: 'IMPORTACAO' | 'EXPORTACAO' | null
  quantidade: number
  quantidadeCotacoesAvulsas: number
  quantidadeBids: number
  valoresProposta: number[]
  diasTransito: number[]
  melhorProposta: MelhorPropostaRota | null
}

function normalizarTipoOperacao(tipo: string | undefined): 'IMPORTACAO' | 'EXPORTACAO' | null {
  if (tipo === 'IMPORTACAO' || tipo === 'EXPORTACAO') return tipo
  return null
}

function normalizarModal(modal: string): 'MARITIMO' | 'AEREO' | 'RODOVIARIO' {
  if (modal === 'AEREO' || modal === 'RODOVIARIO') return modal
  return 'MARITIMO'
}

function modalPredominante(modais: Record<string, number>): 'MARITIMO' | 'AEREO' | 'RODOVIARIO' {
  let melhor: 'MARITIMO' | 'AEREO' | 'RODOVIARIO' = 'MARITIMO'
  let max = 0
  for (const [modal, qtd] of Object.entries(modais)) {
    if (qtd > max) {
      max = qtd
      melhor = normalizarModal(modal)
    }
  }
  return melhor
}

export async function montarMapaCotacoesVisaoFornecedorBidFreteInternacional(
  disparos: DisparoComCotacao[],
  opcoes?: { id_organizacao?: string },
): Promise<{
  pinos_mapa_visao_fornecedor_bid_frete_internacional: PinoMapaVisaoFornecedorBidFreteInternacional[]
  rotas_mapa_visao_fornecedor_bid_frete_internacional: RotaMapaVisaoFornecedorBidFreteInternacional[]
  resumo_cobertura_mapa_visao_fornecedor_bid_frete_internacional: {
    total_cotacoes_consultadas_mapa_visao_fornecedor_bid_frete_internacional: number
    total_cotacoes_exibidas_mapa_visao_fornecedor_bid_frete_internacional: number
    total_cotacoes_sem_origem_destino_mapa_visao_fornecedor_bid_frete_internacional: number
    total_cotacoes_sem_coordenadas_mapa_visao_fornecedor_bid_frete_internacional: number
  }
}> {
  const locais = new Map<string, LocalAcumulado>()
  const rotas = new Map<string, RotaAcumulada>()
  let totalCotacoesSemOrigemDestino = 0
  let totalCotacoesSemCoordenadas = 0

  const registrarLocal = (
    codigo: string,
    nome: string,
    pais: string,
    modal: string,
    opcoesLocal?: {
      vinculadoBid?: boolean
      valorProposta?: number | null
    },
  ) => {
    const key = codigo.trim().toUpperCase()
    if (!key) return
    const atual = locais.get(key) ?? {
      codigo: key,
      nomeCotacao: nome,
      paisCotacao: pais,
      quantidade: 0,
      quantidadeCotacoesAvulsas: 0,
      quantidadeBids: 0,
      valoresProposta: [],
      modais: {},
    }
    atual.quantidade += 1
    if (opcoesLocal?.vinculadoBid) {
      atual.quantidadeBids += 1
    } else {
      atual.quantidadeCotacoesAvulsas += 1
    }
    atual.modais[modal] = (atual.modais[modal] ?? 0) + 1
    const valor = opcoesLocal?.valorProposta
    if (valor != null && Number.isFinite(valor) && valor > 0) {
      atual.valoresProposta.push(valor)
    }
    if (!atual.nomeCotacao && nome) atual.nomeCotacao = nome
    if (!atual.paisCotacao && pais) atual.paisCotacao = pais
    locais.set(key, atual)
  }

  const registrarMelhorPropostaRota = (
    rotaAtual: RotaAcumulada,
    disparo: DisparoComCotacao,
    valor: number | null,
  ) => {
    const idCotacao = disparo.cotacao.id_cotacao_bid_frete_internacional
    const numeroCotacao = disparo.cotacao.numero_cotacao_bid_frete_internacional
    if (!idCotacao || !numeroCotacao) return

    const valorEfetivo = valor != null && Number.isFinite(valor) && valor > 0 ? valor : null
    const candidato: MelhorPropostaRota = {
      valor: valorEfetivo ?? Number.POSITIVE_INFINITY,
      id_cotacao_bid_frete_internacional: idCotacao,
      numero_cotacao_bid_frete_internacional: numeroCotacao,
      numero_bid_bid_frete_internacional:
        disparo.cotacao.numero_bid_bid_frete_internacional?.trim() || null,
    }

    if (!rotaAtual.melhorProposta) {
      rotaAtual.melhorProposta = candidato
      return
    }

    if (valorEfetivo != null && valorEfetivo < rotaAtual.melhorProposta.valor) {
      rotaAtual.melhorProposta = candidato
    }
  }

  for (const disparo of disparos) {
    const cotacao = disparo.cotacao
    if (!cotacao) continue

    const modal = normalizarModal(cotacao.modal_cotacao_bid_frete_internacional)
    const vinculadoBid = Boolean(cotacao.id_bid_bid_frete_internacional?.trim())
    const valorProposta = disparo.proposta?.valor_total_proposta_bid_frete_internacional ?? null

    registrarLocal(
      cotacao.origem_codigo_cotacao_bid_frete_internacional,
      cotacao.origem_nome_cotacao_bid_frete_internacional,
      cotacao.origem_pais_cotacao_bid_frete_internacional,
      modal,
      { vinculadoBid, valorProposta },
    )
    registrarLocal(
      cotacao.destino_codigo_cotacao_bid_frete_internacional,
      cotacao.destino_nome_cotacao_bid_frete_internacional,
      cotacao.destino_pais_cotacao_bid_frete_internacional,
      modal,
      { vinculadoBid, valorProposta },
    )

    const origem = cotacao.origem_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    const destino = cotacao.destino_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    if (!origem || !destino) {
      totalCotacoesSemOrigemDestino += 1
      continue
    }

    const tipoOperacao = normalizarTipoOperacao(
      cotacao.tipo_operacao_cotacao_bid_frete_internacional,
    )
    const rotaKey = `${origem}|${destino}|${modal}|${tipoOperacao ?? 'NA'}`
    const rotaAtual = rotas.get(rotaKey) ?? {
      origem,
      destino,
      modal,
      tipo_operacao: tipoOperacao,
      quantidade: 0,
      quantidadeCotacoesAvulsas: 0,
      quantidadeBids: 0,
      valoresProposta: [],
      diasTransito: [],
      melhorProposta: null,
    }
    rotaAtual.quantidade += 1
    if (vinculadoBid) {
      rotaAtual.quantidadeBids += 1
    } else {
      rotaAtual.quantidadeCotacoesAvulsas += 1
    }
    const valor = disparo.proposta?.valor_total_proposta_bid_frete_internacional ?? null
    if (valor != null && Number.isFinite(valor)) {
      rotaAtual.valoresProposta.push(valor)
    }
    registrarMelhorPropostaRota(rotaAtual, disparo, valor)
    const dias = disparo.proposta?.dias_transito_proposta_bid_frete_internacional
    if (dias != null && Number.isFinite(dias)) {
      rotaAtual.diasTransito.push(dias)
    }
    rotas.set(rotaKey, rotaAtual)
  }

  const coordenadasPorCodigo = new Map<
    string,
    Awaited<ReturnType<typeof resolverLocalCadastrosBidFreteInternacional>>
  >()
  await Promise.all(
    [...locais.entries()].map(async ([codigo, local]) => {
      const modal = modalPredominante(local.modais)
      const coords = await resolverLocalCadastrosBidFreteInternacional(codigo, {
        id_organizacao: opcoes?.id_organizacao,
        modal,
        nome_local: local.nomeCotacao,
        pais_local: local.paisCotacao,
      })
      if (coords) coordenadasPorCodigo.set(codigo, coords)
    }),
  )

  const pinos_mapa_visao_fornecedor_bid_frete_internacional: PinoMapaVisaoFornecedorBidFreteInternacional[] = []
  for (const local of locais.values()) {
    const coords = coordenadasPorCodigo.get(local.codigo)
    if (!coords) continue

    const alerta = montarAlertaDivergenciaCadastrosMapa({
      codigo: local.codigo,
      nomeCotacao: local.nomeCotacao,
      paisCotacao: local.paisCotacao,
      nomeCadastros: coords.nome,
      paisCadastros: coords.pais,
    })

    pinos_mapa_visao_fornecedor_bid_frete_internacional.push({
      codigo_local_mapa_visao_fornecedor_bid_frete_internacional: local.codigo,
      nome_local_mapa_visao_fornecedor_bid_frete_internacional: coords.nome,
      nome_cotacao_local_mapa_visao_fornecedor_bid_frete_internacional: local.nomeCotacao,
      pais_codigo_mapa_visao_fornecedor_bid_frete_internacional: coords.pais,
      alerta_divergencia_cadastros_mapa_visao_fornecedor_bid_frete_internacional: alerta,
      latitude_mapa_visao_fornecedor_bid_frete_internacional: coords.latitude,
      longitude_mapa_visao_fornecedor_bid_frete_internacional: coords.longitude,
      quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: local.quantidade,
      quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional:
        local.quantidadeCotacoesAvulsas,
      quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: local.quantidadeBids,
      melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
        local.valoresProposta.length > 0 ? Math.min(...local.valoresProposta) : null,
      modal_predominante_mapa_visao_fornecedor_bid_frete_internacional: modalPredominante(local.modais),
    })
  }

  const rotas_mapa_visao_fornecedor_bid_frete_internacional: RotaMapaVisaoFornecedorBidFreteInternacional[] = []
  let totalCotacoesExibidas = 0
  for (const rota of rotas.values()) {
    if (!coordenadasPorCodigo.has(rota.origem) || !coordenadasPorCodigo.has(rota.destino)) {
      totalCotacoesSemCoordenadas += rota.quantidade
      continue
    }
    const melhorValor =
      rota.valoresProposta.length > 0 ? Math.min(...rota.valoresProposta) : null
    const diasMedio =
      rota.diasTransito.length > 0
        ? Math.round(
            rota.diasTransito.reduce((acc, d) => acc + d, 0) / rota.diasTransito.length,
          )
        : null

    rotas_mapa_visao_fornecedor_bid_frete_internacional.push({
      codigo_origem_mapa_visao_fornecedor_bid_frete_internacional: rota.origem,
      codigo_destino_mapa_visao_fornecedor_bid_frete_internacional: rota.destino,
      modal_mapa_visao_fornecedor_bid_frete_internacional: rota.modal,
      tipo_operacao_cotacao_bid_frete_internacional: rota.tipo_operacao,
      quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional: rota.quantidade,
      quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional:
        rota.quantidadeCotacoesAvulsas,
      quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: rota.quantidadeBids,
      melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: melhorValor,
      id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
        rota.melhorProposta?.id_cotacao_bid_frete_internacional ?? null,
      numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
        rota.melhorProposta?.numero_cotacao_bid_frete_internacional ?? null,
      numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
        rota.melhorProposta?.numero_bid_bid_frete_internacional ?? null,
      dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: diasMedio,
      dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional: null,
    })
    totalCotacoesExibidas += rota.quantidade
  }

  return {
    pinos_mapa_visao_fornecedor_bid_frete_internacional,
    rotas_mapa_visao_fornecedor_bid_frete_internacional,
    resumo_cobertura_mapa_visao_fornecedor_bid_frete_internacional: {
      total_cotacoes_consultadas_mapa_visao_fornecedor_bid_frete_internacional: disparos.length,
      total_cotacoes_exibidas_mapa_visao_fornecedor_bid_frete_internacional: totalCotacoesExibidas,
      total_cotacoes_sem_origem_destino_mapa_visao_fornecedor_bid_frete_internacional:
        totalCotacoesSemOrigemDestino,
      total_cotacoes_sem_coordenadas_mapa_visao_fornecedor_bid_frete_internacional:
        totalCotacoesSemCoordenadas,
    },
  }
}
