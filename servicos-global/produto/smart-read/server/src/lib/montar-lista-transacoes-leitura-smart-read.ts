/**
 * Monta lista de transacoes: legado (primario) + progresso Gravity (complemento).
 */
import type { PrismaClient } from '../generated/client/index.js'
import { obterLeituraLegado, listarLeiturasLegado } from './cliente-legado-smart-read.js'
import {
  extrairItensListaLegado,
  extrairTotalListaLegado,
  normalizarTransacaoDeItemListaLegado,
  normalizarTransacaoDeLeitura,
} from './normalizar-transacao-leitura-smart-read.js'
import {
  persistirSnapshotLeituraSmartRead,
  transacaoDeRegistroSnapshot,
} from './snapshot-leitura-smart-read.js'
import { extrairDadosSessaoProgressoLeitura } from '../schemas/progresso-leitura-smart-read.js'
import { normalizarLeitura, type TransacaoLeitura } from '../schemas/leitura-smart-read.js'

export type ParametrosListaLeituras = {
  companyId: string
  idOrganizacao: string
  pagina: number
  limite: number
  termo_busca?: string
  prisma?: PrismaClient
  idUsuario?: string
  idWorkspace?: string | null
}

function transacaoPrecisaEnriquecerMetricas(transacao: TransacaoLeitura): boolean {
  return transacao.total_documentos === 0 && transacao.status_leitura === 'COMPLETED'
}

async function enriquecerMetricasTransacaoLegado(
  params: ParametrosListaLeituras,
  transacao: TransacaoLeitura,
): Promise<TransacaoLeitura> {
  if (!transacaoPrecisaEnriquecerMetricas(transacao)) return transacao
  try {
    const legado = await obterLeituraLegado(params.companyId, transacao.id_leitura)
    const leitura = normalizarLeitura(legado)
    const enriquecida = normalizarTransacaoDeLeitura(leitura, {
      data_envio: transacao.data_envio ?? legado.createdAt ?? null,
      origem_leitura: transacao.origem_leitura,
      created_at: legado.createdAt ?? transacao.data_envio ?? null,
      completed_at: legado.completedAt ?? null,
    })

    if (params.prisma && params.idUsuario) {
      void persistirSnapshotLeituraSmartRead({
        prisma: params.prisma,
        idOrganizacao: params.idOrganizacao,
        idUsuario: params.idUsuario,
        idWorkspace: params.idWorkspace ?? null,
        leitura,
        motivo: 'extracao_concluida',
        extras: {
          data_envio: transacao.data_envio ?? legado.createdAt ?? null,
          origem_leitura: transacao.origem_leitura,
          created_at: legado.createdAt ?? transacao.data_envio ?? null,
          completed_at: legado.completedAt ?? null,
          mensagem_erro: transacao.mensagem_erro,
        },
      }).catch((erro) => {
        console.warn('[smart-read][snapshot] falha ao persistir na lista', erro)
      })
    }

    return enriquecida
  } catch {
    return transacao
  }
}

function filtrarPorTermo(transacoes: TransacaoLeitura[], termo?: string): TransacaoLeitura[] {
  const busca = termo?.trim().toLowerCase()
  if (!busca) return transacoes
  return transacoes.filter((item) => {
    const nome = (item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura).toLowerCase()
    return nome.includes(busca)
  })
}

async function listarViaSnapshotGravity(prisma: PrismaClient | undefined): Promise<TransacaoLeitura[]> {
  if (!prisma) return []

  const registros = await prisma.snapshotLeituraSmartRead.findMany({
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
  idUsuario: string | undefined,
): Promise<TransacaoLeitura[]> {
  if (!prisma || !idUsuario) return []

  const registros = await prisma.progressoLeituraSmartRead.findMany({
    where: { id_usuario: idUsuario },
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
    transacoesLegado = itens.map(normalizarTransacaoDeItemListaLegado)
    totalLegado = extrairTotalListaLegado(bruto, transacoesLegado.length)
  } catch (erro) {
    legadoIndisponivel = true
    console.warn(
      '[smart-read][lista] legado /list indisponivel — complementando via progresso Gravity',
      erro instanceof Error ? erro.message : erro,
    )
  }

  const viaProgresso = await listarViaProgressoGravity(params.prisma, params.idUsuario)
  const viaSnapshot = await listarViaSnapshotGravity(params.prisma)

  const mapa = new Map<string, TransacaoLeitura>()
  for (const item of [...transacoesLegado, ...viaProgresso, ...viaSnapshot]) {
    mapa.set(item.id_leitura, item)
  }

  let transacoes = [...mapa.values()].sort((a, b) =>
    (b.data_envio ?? '').localeCompare(a.data_envio ?? ''),
  )
  transacoes = filtrarPorTermo(transacoes, params.termo_busca)

  const total = legadoIndisponivel && transacoesLegado.length === 0 ? transacoes.length : Math.max(totalLegado, transacoes.length)

  const inicio = (params.pagina - 1) * params.limite
  const paginado = transacoes.slice(inicio, inicio + params.limite)
  const enriquecidas = await Promise.all(
    paginado.map((item) => enriquecerMetricasTransacaoLegado(params, item)),
  )

  return {
    transacoes: enriquecidas,
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
