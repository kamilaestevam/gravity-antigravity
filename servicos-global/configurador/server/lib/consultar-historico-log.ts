/**
 * Consulta historico_log no banco da organização — SSOT para rotas workspace e admin.
 */
import type { Prisma } from '../../../servicos-plataforma/generated/index.js'
import {
  montarFiltroVisibilidadeHistoricoLog,
  type UsuarioAutenticado,
} from '../../../servicos-plataforma/historico-global/server/lib/visibility.js'
import { getPrismaOrganizacao } from './prisma-organizacao.js'

export interface ConsultarHistoricoLogParams {
  usuario: UsuarioAutenticado
  limit: number
  cursor?: string
  search?: string
  fromDate?: string
  toDate?: string
  /** Filtro explícito por produto (URL). Omitir = escopo padrão por patente. */
  idProdutoHistoricoLog?: string
  bypassPermissao: boolean
}

export interface HistoricoLogSerializado {
  id_historico_log: string
  id_ator_historico_log: string
  data_criacao_historico_log: string
  acao_historico_log: string
  detalhe_acao_historico_log: string | null
  tipo_recurso_historico_log: string
  id_recurso_historico_log: string | null
  nome_ator_historico_log: string | null
  tipo_ator_historico_log: string | null
  status_historico_log: string | null
  modulo_historico_log: string | null
  metadata_ator_historico_log: Record<string, unknown> | null
  email_ator_historico_log: string | null
}

export interface ConsultarHistoricoLogResultado {
  logs: HistoricoLogSerializado[]
  hasMore: boolean
  nextCursor: string | null
}

function montarFiltroProduto(
  idProdutoUrl: string | undefined,
  bypassPermissao: boolean,
): Prisma.HistoricoLogWhereInput | undefined {
  if (idProdutoUrl) {
    return { id_produto_historico_log: idProdutoUrl }
  }
  if (bypassPermissao) {
    return undefined
  }
  return {
    OR: [
      { id_produto_historico_log: 'configurador' },
      { id_produto_historico_log: null },
    ],
  }
}

/** Monta filtro Prisma com AND explícito (evita sobrescrever OR de visibilidade). */
export function montarWhereHistoricoLog(params: ConsultarHistoricoLogParams): Prisma.HistoricoLogWhereInput {
  const visibility = montarFiltroVisibilidadeHistoricoLog(params.usuario)
  const filtroProduto = montarFiltroProduto(params.idProdutoHistoricoLog, params.bypassPermissao)

  const createdAt: Prisma.DateTimeFilter = {}
  if (params.cursor) createdAt.lt = new Date(params.cursor)
  if (params.fromDate) createdAt.gte = new Date(params.fromDate)
  if (params.toDate) createdAt.lte = new Date(params.toDate)

  const partes: Prisma.HistoricoLogWhereInput[] = [visibility]
  if (filtroProduto) partes.push(filtroProduto)
  if (Object.keys(createdAt).length > 0) {
    partes.push({ data_criacao_historico_log: createdAt })
  }
  if (params.search) {
    partes.push({
      OR: [
        { detalhe_acao_historico_log: { contains: params.search, mode: 'insensitive' } },
        { nome_ator_historico_log:    { contains: params.search, mode: 'insensitive' } },
        { tipo_recurso_historico_log: { contains: params.search, mode: 'insensitive' } },
      ],
    })
  }

  return partes.length === 1 ? partes[0]! : { AND: partes }
}

function serializarLog(
  log: {
    id_historico_log: string
    id_ator_historico_log: string
    data_criacao_historico_log: Date
    acao_historico_log: string
    detalhe_acao_historico_log: string
    tipo_recurso_historico_log: string
    id_recurso_historico_log: string | null
    nome_ator_historico_log: string
    tipo_ator_historico_log: string
    status_historico_log: string
    modulo_historico_log: string
    metadata_ator_historico_log: Prisma.JsonValue
  },
  email_ator_historico_log: string | null,
): HistoricoLogSerializado {
  const metadata =
    log.metadata_ator_historico_log != null &&
    typeof log.metadata_ator_historico_log === 'object' &&
    !Array.isArray(log.metadata_ator_historico_log)
      ? (log.metadata_ator_historico_log as Record<string, unknown>)
      : null

  return {
    id_historico_log: log.id_historico_log,
    id_ator_historico_log: log.id_ator_historico_log,
    data_criacao_historico_log: log.data_criacao_historico_log.toISOString(),
    acao_historico_log: log.acao_historico_log,
    detalhe_acao_historico_log: log.detalhe_acao_historico_log ?? null,
    tipo_recurso_historico_log: log.tipo_recurso_historico_log,
    id_recurso_historico_log: log.id_recurso_historico_log,
    nome_ator_historico_log: log.nome_ator_historico_log ?? null,
    tipo_ator_historico_log: log.tipo_ator_historico_log ?? null,
    status_historico_log: log.status_historico_log ?? null,
    modulo_historico_log: log.modulo_historico_log ?? null,
    metadata_ator_historico_log: metadata,
    email_ator_historico_log,
  }
}

export { isErroTabelaHistoricoAusente, isErroPrismaSchemaOrganizacao } from './erros-prisma-organizacao.js'

export async function consultarHistoricoLog(
  params: ConsultarHistoricoLogParams,
): Promise<ConsultarHistoricoLogResultado> {
  const orgPrisma = getPrismaOrganizacao()
  const safeLimit = Math.min(params.limit, 100)
  const where = montarWhereHistoricoLog(params)

  const rawLogs = await orgPrisma.historicoLog.findMany({
    where,
    orderBy: { data_criacao_historico_log: 'desc' },
    take: safeLimit + 1,
  })

  const hasMore = rawLogs.length > safeLimit
  const slice = hasMore ? rawLogs.slice(0, safeLimit) : rawLogs
  const nextCursor = hasMore
    ? slice[slice.length - 1]!.data_criacao_historico_log.toISOString()
    : null

  return {
    logs: slice.map((l) => serializarLog(l, null)),
    hasMore,
    nextCursor,
  }
}
