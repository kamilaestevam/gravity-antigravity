import {
  obterMapaNomesWorkspacePorIds,
  resolverNomeClienteOperacaoCotacaoResposta,
} from './resolver-nome-cliente-cotacao-resposta-bid-frete-internacional.js'
import { resolverNomeUsuarioOrganizacaoBidFreteInternacional } from './resolver-nome-usuario-organizacao-bid-frete-internacional.js'

type DisparoComCotacao = {
  id_organizacao?: string
  cotacao?: {
    id_organizacao?: string | null
    id_usuario?: string | null
    id_workspace?: string | null
    anonima_cotacao_bid_frete_internacional?: boolean | null
    nome_cliente_operacao_cotacao_bid_frete_internacional?: string | null
    nome_usuario_solicitante_bid_frete_internacional?: string | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export const COTACAO_SELECT_RESPOSTA_FORNECEDOR = {
  id_cotacao_bid_frete_internacional: true,
  id_organizacao: true,
  id_usuario: true,
  numero_cotacao_bid_frete_internacional: true,
  referencia_interna_cotacao_bid_frete_internacional: true,
  tipo_operacao_cotacao_bid_frete_internacional: true,
  id_workspace: true,
  modal_cotacao_bid_frete_internacional: true,
  modalidade_cotacao_bid_frete_internacional: true,
  origem_nome_cotacao_bid_frete_internacional: true,
  origem_pais_cotacao_bid_frete_internacional: true,
  destino_nome_cotacao_bid_frete_internacional: true,
  destino_pais_cotacao_bid_frete_internacional: true,
  descricao_mercadoria_cotacao_bid_frete_internacional: true,
  ncm_cotacao_bid_frete_internacional: true,
  incoterm_cotacao_bid_frete_internacional: true,
  quantidade_volume_cotacao_bid_frete_internacional: true,
  tipo_container_cotacao_bid_frete_internacional: true,
  peso_kg_cotacao_bid_frete_internacional: true,
  cubagem_m3_cotacao_bid_frete_internacional: true,
  data_criacao_cotacao_bid_frete_internacional: true,
  data_limite_resposta_cotacao_bid_frete_internacional: true,
  anonima_cotacao_bid_frete_internacional: true,
  incluir_armazenagem_cotacao_bid_frete_internacional: true,
  status_cotacao_bid_frete_internacional: true,
} as const

async function obterMapaNomesUsuarioSolicitantePorIds(
  pares: Array<{ id_organizacao: string; id_usuario: string }>,
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  const unicos = new Map<string, { id_organizacao: string; id_usuario: string }>()
  for (const par of pares) {
    const chave = `${par.id_organizacao}:${par.id_usuario}`
    if (!unicos.has(chave)) unicos.set(chave, par)
  }
  await Promise.all(
    [...unicos.values()].map(async (par) => {
      const nome = await resolverNomeUsuarioOrganizacaoBidFreteInternacional(
        par.id_organizacao,
        par.id_usuario,
      )
      if (nome) mapa.set(`${par.id_organizacao}:${par.id_usuario}`, nome)
    }),
  )
  return mapa
}

function enriquecerCotacaoComMapa(
  cotacao: NonNullable<DisparoComCotacao['cotacao']>,
  mapaNomesWorkspace: Map<string, string>,
  mapaNomesUsuario: Map<string, string>,
  idOrganizacaoDisparo?: string,
) {
  const idOrganizacao = cotacao.id_organizacao ?? idOrganizacaoDisparo ?? ''
  const anonima = !!cotacao.anonima_cotacao_bid_frete_internacional
  const nomeCliente = resolverNomeClienteOperacaoCotacaoResposta({
    id_workspace: cotacao.id_workspace,
    anonima_cotacao_bid_frete_internacional: cotacao.anonima_cotacao_bid_frete_internacional,
    mapaNomesWorkspace,
  })
  let nomeUsuarioSolicitante: string | null = null
  if (!anonima && cotacao.id_usuario && idOrganizacao) {
    nomeUsuarioSolicitante =
      mapaNomesUsuario.get(`${idOrganizacao}:${cotacao.id_usuario}`) ?? null
  }
  return {
    ...cotacao,
    nome_cliente_operacao_cotacao_bid_frete_internacional: nomeCliente,
    nome_usuario_solicitante_bid_frete_internacional: nomeUsuarioSolicitante,
  }
}

export async function enriquecerDisparoRespostaFornecedor<T extends DisparoComCotacao>(
  disparo: T,
): Promise<T> {
  if (!disparo.cotacao) return disparo
  const mapaWorkspace = await obterMapaNomesWorkspacePorIds(
    disparo.cotacao.id_workspace ? [disparo.cotacao.id_workspace] : [],
  )
  const idOrganizacao = disparo.cotacao.id_organizacao ?? disparo.id_organizacao ?? ''
  const idUsuario = disparo.cotacao.id_usuario
  const mapaUsuario =
    !disparo.cotacao.anonima_cotacao_bid_frete_internacional && idOrganizacao && idUsuario
      ? await obterMapaNomesUsuarioSolicitantePorIds([
          { id_organizacao: idOrganizacao, id_usuario: idUsuario },
        ])
      : new Map<string, string>()
  return {
    ...disparo,
    cotacao: enriquecerCotacaoComMapa(
      disparo.cotacao,
      mapaWorkspace,
      mapaUsuario,
      disparo.id_organizacao,
    ),
  }
}

export async function enriquecerDisparosRespostaFornecedor<T extends DisparoComCotacao>(
  disparos: T[],
): Promise<T[]> {
  const idsWorkspace = disparos
    .map((d) => d.cotacao?.id_workspace)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  const mapaWorkspace = await obterMapaNomesWorkspacePorIds(idsWorkspace)

  const paresUsuario: Array<{ id_organizacao: string; id_usuario: string }> = []
  for (const disparo of disparos) {
    const cotacao = disparo.cotacao
    if (!cotacao || cotacao.anonima_cotacao_bid_frete_internacional) continue
    const idOrganizacao = cotacao.id_organizacao ?? disparo.id_organizacao
    const idUsuario = cotacao.id_usuario
    if (typeof idOrganizacao === 'string' && idOrganizacao && typeof idUsuario === 'string' && idUsuario) {
      paresUsuario.push({ id_organizacao: idOrganizacao, id_usuario: idUsuario })
    }
  }
  const mapaUsuario = await obterMapaNomesUsuarioSolicitantePorIds(paresUsuario)

  return disparos.map((disparo) => {
    if (!disparo.cotacao) return disparo
    return {
      ...disparo,
      cotacao: enriquecerCotacaoComMapa(
        disparo.cotacao,
        mapaWorkspace,
        mapaUsuario,
        disparo.id_organizacao,
      ),
    }
  })
}
