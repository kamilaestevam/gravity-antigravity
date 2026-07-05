/**
 * Carrega catálogo Cadastros para resolução de rota na importação — paridade modal manual.
 */
import { carregarCatalogoAeroportosCadastros } from '@nucleo/catalogo-aeroportos-cadastros'
import {
  resolverAeroportoNoCatalogoImportacao,
  resolverPortoNoCatalogoImportacao,
} from '../../../shared/resolver-cadastro-rota-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from '../../../shared/rota-cotacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from '../../../shared/tipos-importacao-bid-frete-internacional'
import { cadastrosApi } from './cadastrosApi'

export async function carregarContextoCatalogoRotaImportacaoBid(): Promise<ContextoCatalogoRota> {
  const [portosResp, aeroportosItens] = await Promise.all([
    cadastrosApi.listarPortos({ limit: 500 }),
    carregarCatalogoAeroportosCadastros(p => cadastrosApi.listarAeroportos(p)),
  ])

  return {
    portos: portosResp.itens.map(p => ({
      codigo_unlocode_porto: p.codigo_unlocode_porto,
      nome_porto: p.nome_porto,
      codigo_pais_porto: p.codigo_pais_porto ?? null,
    })),
    aeroportos: aeroportosItens.map(a => ({
      codigo_unlocode_aeroporto: a.codigo_unlocode_aeroporto,
      codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? null,
      nome_aeroporto: a.nome_aeroporto,
      codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? null,
    })),
  }
}

const LIMITE_BUSCA_LOCAL_IMPORTACAO = 25

function coletarValoresLocaisLinhas(
  linhas: LinhaImportacaoBidFreteInternacional[],
): { portos: string[]; aeroportos: string[] } {
  const portos = new Set<string>()
  const aeroportos = new Set<string>()

  for (const linha of linhas) {
    const modal = linha.modal_cotacao_bid_frete_internacional?.trim().toUpperCase()
    if (modal === 'MARITIMO') {
      const origem = linha.porto_origem_cotacao_bid_frete_internacional?.trim()
      const destino = linha.porto_destino_cotacao_bid_frete_internacional?.trim()
      if (origem) portos.add(origem)
      if (destino) portos.add(destino)
    } else if (modal === 'AEREO') {
      const origem = linha.aeroporto_origem_cotacao_bid_frete_internacional?.trim()
      const destino = linha.aeroporto_destino_cotacao_bid_frete_internacional?.trim()
      if (origem) aeroportos.add(origem)
      if (destino) aeroportos.add(destino)
    }
  }

  return { portos: [...portos], aeroportos: [...aeroportos] }
}

/**
 * Enriquece o contexto do catálogo com os locais citados na planilha que não
 * resolvem contra a página carregada.
 *
 * O catálogo base da importação é uma página do Cadastros (500 portos), mas o
 * banco tem ~17k portos ativos — um porto citado por nome ou código fora da
 * página seria marcado como inválido no preview (ponto cego, TASK-000415).
 * Cada valor não resolvido é buscado remotamente (`?q=`) no catálogo completo
 * e os resultados são anexados ao contexto.
 *
 * Retorna o contexto enriquecido, ou `null` quando nada novo foi encontrado.
 * `valoresJaBuscados` evita repetir a busca remota de valores irresolvíveis.
 */
export async function enriquecerContextoCatalogoLocaisImportacaoBid(
  ctx: ContextoCatalogoRota,
  linhas: LinhaImportacaoBidFreteInternacional[],
  valoresJaBuscados: Set<string>,
): Promise<ContextoCatalogoRota | null> {
  const { portos: valoresPorto, aeroportos: valoresAeroporto } = coletarValoresLocaisLinhas(linhas)

  const portosAtuais = ctx.portos ?? []
  const aeroportosAtuais = ctx.aeroportos ?? []

  const pendentesPorto = valoresPorto.filter(valor => {
    const chave = `porto:${valor.toLowerCase()}`
    if (valoresJaBuscados.has(chave)) return false
    const res = resolverPortoNoCatalogoImportacao(valor, portosAtuais)
    return !res.porto && !res.ambiguo
  })
  const pendentesAeroporto = valoresAeroporto.filter(valor => {
    const chave = `aeroporto:${valor.toLowerCase()}`
    if (valoresJaBuscados.has(chave)) return false
    const res = resolverAeroportoNoCatalogoImportacao(valor, aeroportosAtuais)
    return !res.aeroporto && !res.ambiguo
  })

  if (pendentesPorto.length === 0 && pendentesAeroporto.length === 0) return null

  const codigosPorto = new Set(portosAtuais.map(p => p.codigo_unlocode_porto.toUpperCase()))
  const codigosAeroporto = new Set(
    aeroportosAtuais.map(a => a.codigo_unlocode_aeroporto.toUpperCase()),
  )
  const novosPortos: NonNullable<ContextoCatalogoRota['portos']> = []
  const novosAeroportos: NonNullable<ContextoCatalogoRota['aeroportos']> = []

  const buscasPorto = pendentesPorto.map(async valor => {
    valoresJaBuscados.add(`porto:${valor.toLowerCase()}`)
    try {
      const resp = await cadastrosApi.listarPortos({ q: valor, limit: LIMITE_BUSCA_LOCAL_IMPORTACAO })
      for (const p of resp.itens) {
        const codigo = p.codigo_unlocode_porto.toUpperCase()
        if (codigosPorto.has(codigo)) continue
        codigosPorto.add(codigo)
        novosPortos.push({
          codigo_unlocode_porto: p.codigo_unlocode_porto,
          nome_porto: p.nome_porto,
          codigo_pais_porto: p.codigo_pais_porto ?? null,
        })
      }
    } catch {
      // Falha de rede não invalida o preview — o valor permanece não resolvido.
    }
  })

  const buscasAeroporto = pendentesAeroporto.map(async valor => {
    valoresJaBuscados.add(`aeroporto:${valor.toLowerCase()}`)
    try {
      const resp = await cadastrosApi.listarAeroportos({ q: valor, limit: LIMITE_BUSCA_LOCAL_IMPORTACAO })
      for (const a of resp.itens) {
        const codigo = a.codigo_unlocode_aeroporto.toUpperCase()
        if (codigosAeroporto.has(codigo)) continue
        codigosAeroporto.add(codigo)
        novosAeroportos.push({
          codigo_unlocode_aeroporto: a.codigo_unlocode_aeroporto,
          codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? null,
          nome_aeroporto: a.nome_aeroporto,
          codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? null,
        })
      }
    } catch {
      // Falha de rede não invalida o preview — o valor permanece não resolvido.
    }
  })

  await Promise.all([...buscasPorto, ...buscasAeroporto])

  if (novosPortos.length === 0 && novosAeroportos.length === 0) return null

  return {
    ...ctx,
    portos: [...portosAtuais, ...novosPortos],
    aeroportos: [...aeroportosAtuais, ...novosAeroportos],
  }
}
