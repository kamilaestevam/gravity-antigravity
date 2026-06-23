/**
 * Monta lista de transacoes: legado (primario) + progresso Gravity (complemento).
 */
import type { PrismaClient } from '../generated/client/index.js'
import { clausulaWorkspaceLeituraSmartRead } from './escopo-workspace-leitura-smart-read.js'
import { obterLeituraLegado, listarLeiturasLegado } from './cliente-legado-smart-read.js'
import {
  extrairItensListaLegado,
  complementarMetricasTransacaoLista,
  mesclarTransacaoNaLista,
  normalizarTransacaoDeItemListaLegado,
  normalizarTransacaoDeLeitura,
} from './normalizar-transacao-leitura-smart-read.js'
import {
  carregarSnapshotsPorIds,
  transacaoDeRegistroSnapshot,
} from './snapshot-leitura-smart-read.js'
import { extrairDadosSessaoProgressoLeitura } from '../schemas/progresso-leitura-smart-read.js'
import { normalizarLeitura, type OrigemLeitura, type TransacaoLeitura } from '../schemas/leitura-smart-read.js'

export type ParametrosListaLeituras = {
  companyId: string
  idOrganizacao: string
  pagina: number
  limite: number
  termo_busca?: string
  origem_leitura?: OrigemLeitura
  prisma?: PrismaClient
  /** Workspace ativo (lista compartilhada na filial — paridade Pedido/BID). */
  idWorkspace: string
}

function transacaoPrecisaEnriquecerMetricas(transacao: TransacaoLeitura): boolean {
  if (transacao.status_leitura !== 'COMPLETED') return false
  if (transacao.total_documentos === 0) return true
  return (
    transacao.media_acertos == null ||
    transacao.saving_total_minutos == null ||
    transacao.saving_total_minutos <= 0
  )
}

function mesclarTransacaoComSnapshot(
  transacao: TransacaoLeitura,
  doSnapshot: TransacaoLeitura,
): TransacaoLeitura {
  return {
    ...doSnapshot,
    data_envio: transacao.data_envio ?? doSnapshot.data_envio,
    origem_leitura: transacao.origem_leitura,
    mensagem_erro: transacao.mensagem_erro ?? doSnapshot.mensagem_erro,
  }
}

/** Métricas da página: 1 query batch no snapshot — sem N chamadas ao legado na lista. */
async function aplicarMetricasDaPagina(
  prisma: PrismaClient | undefined,
  idWorkspace: string,
  paginado: TransacaoLeitura[],
): Promise<TransacaoLeitura[]> {
  const precisam = paginado.filter(transacaoPrecisaEnriquecerMetricas)
  if (precisam.length === 0 || !prisma || !idWorkspace) return paginado

  const snapshotPorId = await carregarSnapshotsPorIds(
    prisma,
    precisam.map((item) => item.id_leitura),
    idWorkspace,
  )
  if (snapshotPorId.size === 0) return paginado

  return paginado.map((transacao) => {
    if (!transacaoPrecisaEnriquecerMetricas(transacao)) return transacao
    const doSnapshot = snapshotPorId.get(transacao.id_leitura)
    return doSnapshot ? mesclarTransacaoComSnapshot(transacao, doSnapshot) : transacao
  })
}

function filtrarPorTermo(transacoes: TransacaoLeitura[], termo?: string): TransacaoLeitura[] {
  const busca = termo?.trim().toLowerCase()
  if (!busca) return transacoes
  return transacoes.filter((item) => {
    const nome = (item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura).toLowerCase()
    return nome.includes(busca)
  })
}

function filtrarPorOrigem(
  transacoes: TransacaoLeitura[],
  origem?: OrigemLeitura,
): TransacaoLeitura[] {
  if (!origem) return transacoes
  return transacoes.filter((item) => item.origem_leitura === origem)
}

function inserirTransacaoNoMapa(mapa: Map<string, TransacaoLeitura>, item: TransacaoLeitura): void {
  const existente = mapa.get(item.id_leitura)
  mapa.set(
    item.id_leitura,
    existente ? mesclarTransacaoNaLista(existente, item) : complementarMetricasTransacaoLista(item),
  )
}

async function listarViaSnapshotGravity(
  prisma: PrismaClient | undefined,
  idWorkspace: string,
): Promise<TransacaoLeitura[]> {
  if (!prisma || !idWorkspace) return []

  const registros = await prisma.snapshotLeituraSmartRead.findMany({
    where: clausulaWorkspaceLeituraSmartRead(idWorkspace),
    orderBy: { data_envio_snapshot_leitura_smart_read: 'desc' },
    take: 200,
  })

  const transacoes: TransacaoLeitura[] = []
  for (const registro of registros) {
    const transacao = transacaoDeRegistroSnapshot(registro)
    if (transacao) transacoes.push(transacao)
  }
  return transacoes
}

async function listarViaProgressoGravity(
  prisma: PrismaClient | undefined,
  idWorkspace: string,
): Promise<TransacaoLeitura[]> {
  if (!prisma || !idWorkspace) return []

  const registros = await prisma.progressoLeituraSmartRead.findMany({
    where: clausulaWorkspaceLeituraSmartRead(idWorkspace),
    orderBy: { data_atualizacao_progresso_leitura_smart_read: 'desc' },
    take: 200,
  })

  const transacoes: TransacaoLeitura[] = []
  for (const registro of registros) {
    const sessao = extrairDadosSessaoProgressoLeitura(registro.dados_sessao_progresso_leitura_smart_read)
    if (sessao?.leitura) {
      transacoes.push(
        normalizarTransacaoDeLeitura(
          { ...sessao.leitura, nome_leitura: sessao.nome || sessao.leitura.nome_leitura },
          {
            data_envio: registro.data_criacao_progresso_leitura_smart_read.toISOString(),
          },
        ),
      )
    }
  }
  return transacoes
}

export async function montarListaTransacoesLeituraSmartRead(
  params: ParametrosListaLeituras,
): Promise<{ transacoes: TransacaoLeitura[]; total: number }> {
  if (!params.idWorkspace) {
    return { transacoes: [], total: 0 }
  }

  const viaProgresso = await listarViaProgressoGravity(params.prisma, params.idWorkspace)
  const viaSnapshot = await listarViaSnapshotGravity(params.prisma, params.idWorkspace)

  const idsLeituraDoWorkspace = new Set<string>([
    ...viaProgresso.map((item) => item.id_leitura),
    ...viaSnapshot.map((item) => item.id_leitura),
  ])

  let transacoesLegado: TransacaoLeitura[] = []
  let totalLegado = 0
  let legadoIndisponivel = false

  try {
    const bruto = await listarLeiturasLegado(params.companyId, {
      pagina: params.pagina,
      limite: params.limite,
      termo_busca: params.termo_busca,
    })
    const itens = extrairItensListaLegado(bruto)
    transacoesLegado = itens
      .map(normalizarTransacaoDeItemListaLegado)
      .filter((item) => idsLeituraDoWorkspace.has(item.id_leitura))
    totalLegado = transacoesLegado.length
  } catch (erro) {
    legadoIndisponivel = true
    console.warn(
      '[smart-read][lista] legado /list indisponivel — complementando via progresso Gravity',
      erro instanceof Error ? erro.message : erro,
    )
  }

  const mapa = new Map<string, TransacaoLeitura>()
  for (const item of [...transacoesLegado, ...viaProgresso, ...viaSnapshot]) {
    inserirTransacaoNoMapa(mapa, item)
  }

  let transacoes = [...mapa.values()].sort((a, b) =>
    (b.data_envio ?? '').localeCompare(a.data_envio ?? ''),
  )
  transacoes = filtrarPorTermo(transacoes, params.termo_busca)
  transacoes = filtrarPorOrigem(transacoes, params.origem_leitura)

  const totalFiltrado = transacoes.length
  const total =
    params.origem_leitura != null
      ? totalFiltrado
      : legadoIndisponivel && transacoesLegado.length === 0
        ? transacoes.length
        : Math.max(totalLegado, transacoes.length, idsLeituraDoWorkspace.size)

  const inicio = (params.pagina - 1) * params.limite
  const paginado = transacoes.slice(inicio, inicio + params.limite)
  const enriquecidas = await aplicarMetricasDaPagina(params.prisma, params.idWorkspace, paginado)

  return {
    transacoes: enriquecidas.map(complementarMetricasTransacaoLista),
    total,
  }
}

export async function enriquecerTransacaoViaLegado(
  companyId: string,
  idLeitura: string,
  base?: TransacaoLeitura,
): Promise<TransacaoLeitura> {
  try {
    const legado = await obterLeituraLegado(companyId, idLeitura)
    const leitura = normalizarLeitura(legado)
    return normalizarTransacaoDeLeitura(leitura, {
      data_envio: base?.data_envio ?? legado.createdAt ?? null,
      origem_leitura: base?.origem_leitura,
      created_at: legado.createdAt ?? base?.data_envio ?? null,
      completed_at: legado.completedAt ?? null,
    })
  } catch {
    return base ?? normalizarTransacaoDeLeitura({
      id_leitura: idLeitura,
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    })
  }
}
