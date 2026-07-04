/**
 * Snapshots iniciais NCM/Moeda/Unidade — best-effort (espelha POST /pedidos FASE 06E).
 */
import { randomUUID } from 'node:crypto'
import {
  buscarMoedaPorCodigo,
  buscarNcmPorCodigo,
  buscarUnidadePorCodigo,
  type CadastrosRequestContext,
} from '../../../../processos-core/src/services/cadastrosClient.js'
import {
  montarSnapshotMoeda,
  montarSnapshotNcm,
  montarSnapshotUnidade,
  type SnapshotMoedaData,
  type SnapshotNcmData,
  type SnapshotUnidadeData,
} from '../../../../processos-core/src/services/pedidoSnapshots.js'

export type EntradaSnapshotsCadastrosPedido = {
  moedaPedido?: string | null
  unidadePedido?: string | null
  itens: Array<{
    ncm_item?: string | null
    moeda_item?: string | null
    unidade_comercializada_item?: string | null
  }>
}

async function buscarSeguro<T>(
  label: string,
  codigo: string,
  fn: () => Promise<T | null>,
): Promise<T | null> {
  try {
    const r = await fn()
    if (r === null) {
      console.warn(
        `[snapshots-cadastros] ${label}: registro nao encontrado (codigo=${codigo}); seguindo sem snapshot`,
      )
    }
    return r
  } catch (err) {
    console.warn(
      `[snapshots-cadastros] ${label}: falha Cadastros (codigo=${codigo}); seguindo sem snapshot`,
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

export async function buscarSnapshotsCadastrosIniciaisPedido(params: {
  idOrganizacao: string
  idWorkspace: string
  correlationId?: string
  entrada: EntradaSnapshotsCadastrosPedido
}): Promise<{
  snapshotsNcm: SnapshotNcmData[]
  snapshotsMoeda: SnapshotMoedaData[]
  snapshotsUnidade: SnapshotUnidadeData[]
}> {
  const { idOrganizacao, idWorkspace, entrada } = params
  const ctxCadastros: CadastrosRequestContext = {
    id_organizacao: idOrganizacao,
    correlation_id: params.correlationId ?? randomUUID(),
  }

  const ncmsDistintos = Array.from(
    new Set(
      entrada.itens
        .map((i) => i.ncm_item)
        .filter((c): c is string => !!c && c.length > 0),
    ),
  )
  const moedasDistintas = Array.from(
    new Set(
      [
        entrada.moedaPedido,
        ...entrada.itens.map((i) => i.moeda_item),
      ].filter((c): c is string => !!c && c.length > 0),
    ),
  )
  const unidadesDistintas = Array.from(
    new Set(
      [
        entrada.unidadePedido,
        ...entrada.itens.map((i) => i.unidade_comercializada_item),
      ].filter((c): c is string => !!c && c.length > 0),
    ),
  )

  const [ncmsBuscados, moedasBuscadas, unidadesBuscadas] = await Promise.all([
    Promise.all(
      ncmsDistintos.map(async (codigo) => ({
        codigo,
        ncm: await buscarSeguro('NCM', codigo, () => buscarNcmPorCodigo(codigo, ctxCadastros)),
      })),
    ),
    Promise.all(
      moedasDistintas.map(async (codigo) => ({
        codigo,
        moeda: await buscarSeguro('Moeda', codigo, () => buscarMoedaPorCodigo(codigo, ctxCadastros)),
      })),
    ),
    Promise.all(
      unidadesDistintas.map(async (codigo) => ({
        codigo,
        unidade: await buscarSeguro('Unidade', codigo, () =>
          buscarUnidadePorCodigo(codigo, ctxCadastros),
        ),
      })),
    ),
  ])

  const snapshotsNcm = ncmsBuscados
    .map(({ ncm }) => {
      if (!ncm) return null
      try {
        return montarSnapshotNcm(ncm, idOrganizacao, idWorkspace)
      } catch (err) {
        console.warn(
          `[snapshots-cadastros] NCM contrato invalido (codigo=${ncm.codigo_ncm})`,
          err instanceof Error ? err.message : err,
        )
        return null
      }
    })
    .filter((s): s is SnapshotNcmData => s !== null)

  const snapshotsMoeda = moedasBuscadas
    .map(({ moeda }) => {
      if (!moeda) return null
      try {
        return montarSnapshotMoeda(moeda, idOrganizacao, idWorkspace)
      } catch (err) {
        console.warn(
          `[snapshots-cadastros] Moeda contrato invalido (codigo=${moeda.codigo_moeda})`,
          err instanceof Error ? err.message : err,
        )
        return null
      }
    })
    .filter((s): s is SnapshotMoedaData => s !== null)

  const snapshotsUnidade = unidadesBuscadas
    .map(({ unidade }) => {
      if (!unidade) return null
      try {
        return montarSnapshotUnidade(unidade, idOrganizacao, idWorkspace)
      } catch (err) {
        console.warn(
          `[snapshots-cadastros] Unidade contrato invalido (codigo=${unidade.codigo_unidade})`,
          err instanceof Error ? err.message : err,
        )
        return null
      }
    })
    .filter((s): s is SnapshotUnidadeData => s !== null)

  return { snapshotsNcm, snapshotsMoeda, snapshotsUnidade }
}
