/**
 * Catálogo Cadastros (portos + aeroportos) para derivação de snapshot de rota no server.
 */

import { extrairCodigoDeRotuloImportacao } from '../../../shared/rotulo-cadastro-importacao-bid-frete-internacional.js'
import { fetchCadastrosJson } from './cadastros-client.js'
import { resolverMetadadosLocalCadastrosBidFreteInternacional } from './resolver-local-cadastros-bid-frete-internacional.js'
import type { CamposRotaModalCotacao, ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional.js'

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}

type AeroportoCadastros = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  ativo_aeroporto?: boolean
}

type ListaCadastros<T> = { itens: T[]; total: number }

const LIMITE_PORTOS = 500
const LIMITE_AEROPORTOS = 10_000

export async function carregarContextoCatalogoRotaBidFreteInternacional(
  idOrganizacao: string,
): Promise<ContextoCatalogoRota> {
  const [portosResp, aeroportosResp] = await Promise.all([
    fetchCadastrosJson<ListaCadastros<PortoCadastros>>(
      '/api/v1/cadastros/portos',
      { limit: String(LIMITE_PORTOS), apenas_ativos: 'true' },
      { idOrganizacao },
    ),
    fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
      '/api/v1/cadastros/aeroportos',
      { limit: String(LIMITE_AEROPORTOS), apenas_ativos: 'true' },
      { idOrganizacao },
    ),
  ])

  return {
    portos: portosResp.itens.map((p) => ({
      codigo_unlocode_porto: p.codigo_unlocode_porto,
      nome_porto: p.nome_porto,
      codigo_pais_porto: p.codigo_pais_porto ?? null,
    })),
    aeroportos: aeroportosResp.itens
      .filter((a) => a.ativo_aeroporto !== false)
      .map((a) => ({
        codigo_unlocode_aeroporto: a.codigo_unlocode_aeroporto,
        codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? null,
        nome_aeroporto: a.nome_aeroporto,
        codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? null,
      })),
  }
}

function codigoTerminal(valor: string | null | undefined): string {
  return extrairCodigoDeRotuloImportacao(valor ?? '').toUpperCase()
}

function portoNoContexto(ctx: ContextoCatalogoRota, codigo: string): boolean {
  return (ctx.portos ?? []).some((p) => p.codigo_unlocode_porto.toUpperCase() === codigo)
}

function aeroportoNoContexto(ctx: ContextoCatalogoRota, codigo: string): boolean {
  return (ctx.aeroportos ?? []).some(
    (a) =>
      (a.codigo_iata_aeroporto ?? '').toUpperCase() === codigo
      || a.codigo_unlocode_aeroporto.toUpperCase() === codigo,
  )
}

/**
 * Garante que os terminais da rota (origem/destino) estejam no contexto do catálogo.
 *
 * O catálogo é paginado (LIMITE_PORTOS/LIMITE_AEROPORTOS) e o Cadastros tem mais
 * itens ativos que o limite — um porto fora da primeira página faria a derivação
 * do snapshot cair no fallback "nome = código" e reprovar na validação contra o
 * Cadastros. Aqui cada código usado na rota é resolvido individualmente
 * (GET /portos/:codigo, /aeroportos/:codigo) e injetado no contexto quando ausente.
 */
export async function garantirTerminaisRotaNoContextoCatalogo(
  ctx: ContextoCatalogoRota,
  input: CamposRotaModalCotacao,
  idOrganizacao: string,
): Promise<void> {
  const modal = input.modal_cotacao_bid_frete_internacional
  if (modal === 'RODOVIARIO') return

  if (modal === 'MARITIMO') {
    const codigos = [
      codigoTerminal(input.porto_origem_cotacao_bid_frete_internacional),
      codigoTerminal(input.porto_destino_cotacao_bid_frete_internacional),
    ].filter((c) => c && !portoNoContexto(ctx, c))

    for (const codigo of [...new Set(codigos)]) {
      const local = await resolverMetadadosLocalCadastrosBidFreteInternacional(codigo, {
        id_organizacao: idOrganizacao,
        modal,
      })
      if (!local) continue
      ctx.portos = ctx.portos ?? []
      ctx.portos.push({
        codigo_unlocode_porto: local.codigo,
        nome_porto: local.nome,
        codigo_pais_porto: local.pais || null,
      })
    }
    return
  }

  const codigos = [
    codigoTerminal(input.aeroporto_origem_cotacao_bid_frete_internacional),
    codigoTerminal(input.aeroporto_destino_cotacao_bid_frete_internacional),
  ].filter((c) => c && !aeroportoNoContexto(ctx, c))

  for (const codigo of [...new Set(codigos)]) {
    const local = await resolverMetadadosLocalCadastrosBidFreteInternacional(codigo, {
      id_organizacao: idOrganizacao,
      modal,
    })
    if (!local) continue
    ctx.aeroportos = ctx.aeroportos ?? []
    ctx.aeroportos.push({
      codigo_unlocode_aeroporto: local.codigo,
      codigo_iata_aeroporto: codigo.length === 3 ? codigo : null,
      nome_aeroporto: local.nome,
      codigo_pais_aeroporto: local.pais || null,
    })
  }
}
