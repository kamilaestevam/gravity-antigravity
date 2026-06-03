/**
 * Agrega disparos do fornecedor em pinos e rotas para o mapa da visão fornecedor.
 * Coordenadas resolvidas via Cadastros (porto ou aeroporto).
 */

import { fetchCadastrosJson } from './cadastros-client.js'

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
  latitude_porto?: number | null
  longitude_porto?: number | null
}

type AeroportoCadastros = {
  codigo_unlocode_aeroporto: string
  codigo_iata_aeroporto?: string | null
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  latitude_aeroporto?: number | null
  longitude_aeroporto?: number | null
}

export type PinoMapaVisaoFornecedorBidFreteInternacional = {
  codigo_local_mapa_visao_fornecedor_bid_frete_internacional: string
  nome_local_mapa_visao_fornecedor_bid_frete_internacional: string
  pais_codigo_mapa_visao_fornecedor_bid_frete_internacional: string
  latitude_mapa_visao_fornecedor_bid_frete_internacional: number
  longitude_mapa_visao_fornecedor_bid_frete_internacional: number
  quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: number
  modal_predominante_mapa_visao_fornecedor_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
}

export type RotaMapaVisaoFornecedorBidFreteInternacional = {
  codigo_origem_mapa_visao_fornecedor_bid_frete_internacional: string
  codigo_destino_mapa_visao_fornecedor_bid_frete_internacional: string
  modal_mapa_visao_fornecedor_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional: number
  melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: number | null
  dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: number | null
}

type DisparoComCotacao = {
  cotacao: {
    origem_codigo_cotacao_bid_frete_internacional: string
    origem_nome_cotacao_bid_frete_internacional: string
    origem_pais_cotacao_bid_frete_internacional: string
    destino_codigo_cotacao_bid_frete_internacional: string
    destino_nome_cotacao_bid_frete_internacional: string
    destino_pais_cotacao_bid_frete_internacional: string
    modal_cotacao_bid_frete_internacional: string
  }
  proposta?: {
    valor_total_proposta_bid_frete_internacional?: number | null
    dias_transito_proposta_bid_frete_internacional?: number | null
  } | null
}

type LocalAcumulado = {
  codigo: string
  nome: string
  pais: string
  quantidade: number
  modais: Record<string, number>
}

type RotaAcumulada = {
  origem: string
  destino: string
  modal: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  quantidade: number
  valoresProposta: number[]
  diasTransito: number[]
}

function normalizarModal(modal: string): 'MARITIMO' | 'AEREO' | 'RODOVIARIO' {
  if (modal === 'AEREO' || modal === 'RODOVIARIO') return modal
  return 'MARITIMO'
}

async function resolverCoordenadasLocal(
  codigo: string,
  idOrganizacao?: string,
): Promise<{ latitude: number; longitude: number; pais: string } | null> {
  const codigoUpper = codigo.trim().toUpperCase()
  if (!codigoUpper) return null

  try {
    const porto = await fetchCadastrosJson<PortoCadastros>(
      `/api/v1/cadastros/portos/${encodeURIComponent(codigoUpper)}`,
      { apenas_ativos: 'true' },
      { idOrganizacao },
    )
    if (
      porto.latitude_porto != null &&
      porto.longitude_porto != null &&
      Number.isFinite(porto.latitude_porto) &&
      Number.isFinite(porto.longitude_porto)
    ) {
      return {
        latitude: porto.latitude_porto,
        longitude: porto.longitude_porto,
        pais: porto.codigo_pais_porto ?? '',
      }
    }
  } catch {
    /* tenta aeroporto */
  }

  try {
    const aeroporto = await fetchCadastrosJson<AeroportoCadastros>(
      `/api/v1/cadastros/aeroportos/${encodeURIComponent(codigoUpper)}`,
      { apenas_ativos: 'true' },
      { idOrganizacao },
    )
    if (
      aeroporto.latitude_aeroporto != null &&
      aeroporto.longitude_aeroporto != null &&
      Number.isFinite(aeroporto.latitude_aeroporto) &&
      Number.isFinite(aeroporto.longitude_aeroporto)
    ) {
      return {
        latitude: aeroporto.latitude_aeroporto,
        longitude: aeroporto.longitude_aeroporto,
        pais: aeroporto.codigo_pais_aeroporto ?? '',
      }
    }
  } catch {
    return null
  }

  return null
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
}> {
  const locais = new Map<string, LocalAcumulado>()
  const rotas = new Map<string, RotaAcumulada>()

  const registrarLocal = (
    codigo: string,
    nome: string,
    pais: string,
    modal: string,
  ) => {
    const key = codigo.trim().toUpperCase()
    if (!key) return
    const atual = locais.get(key) ?? {
      codigo: key,
      nome,
      pais,
      quantidade: 0,
      modais: {},
    }
    atual.quantidade += 1
    atual.modais[modal] = (atual.modais[modal] ?? 0) + 1
    if (!atual.nome && nome) atual.nome = nome
    if (!atual.pais && pais) atual.pais = pais
    locais.set(key, atual)
  }

  for (const disparo of disparos) {
    const cotacao = disparo.cotacao
    if (!cotacao) continue

    const modal = normalizarModal(cotacao.modal_cotacao_bid_frete_internacional)
    registrarLocal(
      cotacao.origem_codigo_cotacao_bid_frete_internacional,
      cotacao.origem_nome_cotacao_bid_frete_internacional,
      cotacao.origem_pais_cotacao_bid_frete_internacional,
      modal,
    )
    registrarLocal(
      cotacao.destino_codigo_cotacao_bid_frete_internacional,
      cotacao.destino_nome_cotacao_bid_frete_internacional,
      cotacao.destino_pais_cotacao_bid_frete_internacional,
      modal,
    )

    const origem = cotacao.origem_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    const destino = cotacao.destino_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    if (!origem || !destino) continue

    const rotaKey = `${origem}|${destino}|${modal}`
    const rotaAtual = rotas.get(rotaKey) ?? {
      origem,
      destino,
      modal,
      quantidade: 0,
      valoresProposta: [],
      diasTransito: [],
    }
    rotaAtual.quantidade += 1
    const valor = disparo.proposta?.valor_total_proposta_bid_frete_internacional
    if (valor != null && Number.isFinite(valor)) {
      rotaAtual.valoresProposta.push(valor)
    }
    const dias = disparo.proposta?.dias_transito_proposta_bid_frete_internacional
    if (dias != null && Number.isFinite(dias)) {
      rotaAtual.diasTransito.push(dias)
    }
    rotas.set(rotaKey, rotaAtual)
  }

  const coordenadasPorCodigo = new Map<string, { latitude: number; longitude: number; pais: string }>()
  await Promise.all(
    [...locais.keys()].map(async (codigo) => {
      const coords = await resolverCoordenadasLocal(codigo, opcoes?.id_organizacao)
      if (coords) coordenadasPorCodigo.set(codigo, coords)
    }),
  )

  const pinos_mapa_visao_fornecedor_bid_frete_internacional: PinoMapaVisaoFornecedorBidFreteInternacional[] = []
  for (const local of locais.values()) {
    const coords = coordenadasPorCodigo.get(local.codigo)
    if (!coords) continue
    pinos_mapa_visao_fornecedor_bid_frete_internacional.push({
      codigo_local_mapa_visao_fornecedor_bid_frete_internacional: local.codigo,
      nome_local_mapa_visao_fornecedor_bid_frete_internacional: local.nome,
      pais_codigo_mapa_visao_fornecedor_bid_frete_internacional:
        local.pais || coords.pais,
      latitude_mapa_visao_fornecedor_bid_frete_internacional: coords.latitude,
      longitude_mapa_visao_fornecedor_bid_frete_internacional: coords.longitude,
      quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: local.quantidade,
      modal_predominante_mapa_visao_fornecedor_bid_frete_internacional: modalPredominante(local.modais),
    })
  }

  const rotas_mapa_visao_fornecedor_bid_frete_internacional: RotaMapaVisaoFornecedorBidFreteInternacional[] = []
  for (const rota of rotas.values()) {
    if (!coordenadasPorCodigo.has(rota.origem) || !coordenadasPorCodigo.has(rota.destino)) {
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
      quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional: rota.quantidade,
      melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: melhorValor,
      dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: diasMedio,
    })
  }

  return {
    pinos_mapa_visao_fornecedor_bid_frete_internacional,
    rotas_mapa_visao_fornecedor_bid_frete_internacional,
  }
}
