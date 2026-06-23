/**
 * snapshot-leitura-smart-read.ts — leitura/congelamento e leitura do snapshot Gravity.
 */
import type { Prisma } from '../generated/client/index.js'
import type { PrismaClient } from '../generated/client/index.js'
import { calcularMetricasTransacaoLeituraSmartRead } from '../../../shared/metricas-transacao-leitura-smart-read.js'
import {
  LeituraSchema,
  type Leitura,
  type OrigemLeitura,
  type TransacaoLeitura,
} from '../schemas/leitura-smart-read.js'
import { extrairDadosSessaoProgressoLeitura } from '../schemas/progresso-leitura-smart-read.js'
import { clausulaWorkspaceLeituraSmartRead } from './escopo-workspace-leitura-smart-read.js'
import { normalizarTransacaoDeLeitura, mesclarOrigemLeituraTransacao } from './normalizar-transacao-leitura-smart-read.js'

export const VERSAO_CONTRATO_SNAPSHOT_LEITURA_SMART_READ = 1

export type MotivoCongelamentoSnapshotLeituraSmartRead =
  | 'extracao_concluida'
  | 'conferencia_usuario'

export type ExtrasSnapshotLeituraSmartRead = {
  data_envio?: string | null
  origem_leitura?: OrigemLeitura
  created_at?: string | null
  completed_at?: string | null
  mensagem_erro?: string | null
}

type RegistroSnapshot = {
  dados_extracao_snapshot_leitura_smart_read: Prisma.JsonValue
  data_envio_snapshot_leitura_smart_read: Date | null
  origem_leitura_snapshot_leitura_smart_read: string
  mensagem_erro_snapshot_leitura_smart_read: string | null
}

export function leituraDeRegistroSnapshot(registro: RegistroSnapshot): Leitura | null {
  const parseado = LeituraSchema.safeParse(registro.dados_extracao_snapshot_leitura_smart_read)
  return parseado.success ? parseado.data : null
}

export function transacaoDeRegistroSnapshot(
  registro: RegistroSnapshot & {
    id_leitura_legado_snapshot_leitura_smart_read: string
    nome_leitura_snapshot_leitura_smart_read: string | null
    status_leitura_snapshot_leitura_smart_read: string
    total_arquivos_snapshot_leitura_smart_read: number
    media_acertos_snapshot_leitura_smart_read: number | null
    nome_arquivo_snapshot_leitura_smart_read: string | null
    total_campos_snapshot_leitura_smart_read: number
    campos_corretos_snapshot_leitura_smart_read: number
    campos_errados_snapshot_leitura_smart_read: number
  },
): TransacaoLeitura | null {
  const leitura = leituraDeRegistroSnapshot(registro)
  if (!leitura) return null

  return normalizarTransacaoDeLeitura(leitura, {
    data_envio: registro.data_envio_snapshot_leitura_smart_read?.toISOString() ?? null,
    origem_leitura: registro.origem_leitura_snapshot_leitura_smart_read as OrigemLeitura,
    created_at: registro.data_envio_snapshot_leitura_smart_read?.toISOString() ?? null,
    completed_at: null,
  })
}

export function leituraElegivelParaSnapshot(leitura: Leitura): boolean {
  if (leitura.status_leitura === 'FAILED') return true
  if (leitura.status_leitura !== 'COMPLETED') return false
  return leitura.arquivos.some((arquivo) => (arquivo.resultado_extracao?.length ?? 0) > 0)
}

export async function persistirSnapshotLeituraSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string | null
  leitura: Leitura
  motivo: MotivoCongelamentoSnapshotLeituraSmartRead
  extras?: ExtrasSnapshotLeituraSmartRead
}): Promise<void> {
  const { prisma, idOrganizacao, idUsuario, idWorkspace, leitura, motivo, extras } = params
  if (!leituraElegivelParaSnapshot(leitura) && motivo !== 'conferencia_usuario') return

  const existente = await prisma.snapshotLeituraSmartRead.findFirst({
    where: {
      id_leitura_legado_snapshot_leitura_smart_read: leitura.id_leitura,
    },
  })

  const origemExistente = existente?.origem_leitura_snapshot_leitura_smart_read as OrigemLeitura | undefined
  const origemInformada = extras?.origem_leitura
  const origemPersistida =
    origemExistente && origemInformada
      ? mesclarOrigemLeituraTransacao(origemExistente, origemInformada)
      : origemInformada ?? origemExistente

  const transacao = normalizarTransacaoDeLeitura(leitura, {
    data_envio: extras?.data_envio ?? null,
    origem_leitura: origemPersistida,
    created_at: extras?.created_at ?? extras?.data_envio ?? null,
    completed_at: extras?.completed_at ?? null,
  })

  const metricas = calcularMetricasTransacaoLeituraSmartRead(leitura, {
    created_at: extras?.created_at ?? extras?.data_envio ?? null,
    completed_at: extras?.completed_at ?? null,
  })

  const dataEnvio =
    extras?.data_envio != null && extras.data_envio !== ''
      ? new Date(extras.data_envio)
      : new Date()

  const payload = LeituraSchema.parse(leitura) as Prisma.InputJsonValue

  const payloadSnapshot: Prisma.SnapshotLeituraSmartReadUncheckedCreateInput = {
    id_organizacao: idOrganizacao,
    id_usuario: idUsuario,
    id_workspace: idWorkspace,
    id_leitura_legado_snapshot_leitura_smart_read: leitura.id_leitura,
    nome_leitura_snapshot_leitura_smart_read: leitura.nome_leitura,
    status_leitura_snapshot_leitura_smart_read: leitura.status_leitura,
    origem_leitura_snapshot_leitura_smart_read: transacao.origem_leitura,
    total_arquivos_snapshot_leitura_smart_read: leitura.total_arquivos,
    arquivos_processados_snapshot_leitura_smart_read: leitura.arquivos_processados,
    nome_arquivo_snapshot_leitura_smart_read: transacao.nome_arquivo,
    media_acertos_snapshot_leitura_smart_read: transacao.media_acertos,
    total_campos_snapshot_leitura_smart_read: metricas.total_campos_extraidos,
    campos_corretos_snapshot_leitura_smart_read: metricas.total_campos_corretos,
    campos_errados_snapshot_leitura_smart_read: metricas.total_campos_errados,
    data_envio_snapshot_leitura_smart_read: dataEnvio,
    mensagem_erro_snapshot_leitura_smart_read: extras?.mensagem_erro ?? transacao.mensagem_erro,
    dados_extracao_snapshot_leitura_smart_read: payload,
    motivo_congelamento_snapshot_leitura_smart_read: motivo,
    data_congelamento_snapshot_leitura_smart_read: new Date(),
    versao_contrato_snapshot_leitura_smart_read: VERSAO_CONTRATO_SNAPSHOT_LEITURA_SMART_READ,
  }

  if (existente) {
    await prisma.snapshotLeituraSmartRead.update({
      where: { id_snapshot_leitura_smart_read: existente.id_snapshot_leitura_smart_read },
      data: payloadSnapshot,
    })
    return
  }

  await prisma.snapshotLeituraSmartRead.create({ data: payloadSnapshot })
}

export async function obterLeituraDoProgresso(
  prisma: PrismaClient,
  idLeituraLegado: string,
  idUsuario: string,
  idWorkspace?: string,
): Promise<Leitura | null> {
  if (!idUsuario) return null

  const registro = await prisma.progressoLeituraSmartRead.findFirst({
    where: {
      id_leitura_legado_progresso_leitura_smart_read: idLeituraLegado,
      id_usuario: idUsuario,
      ...(idWorkspace ? { id_workspace: idWorkspace } : {}),
    },
    orderBy: { data_atualizacao_progresso_leitura_smart_read: 'desc' },
  })
  if (!registro) return null

  const sessao = extrairDadosSessaoProgressoLeitura(registro.dados_sessao_progresso_leitura_smart_read)
  if (!sessao?.leitura) return null

  const parseado = LeituraSchema.safeParse({
    ...sessao.leitura,
    nome_leitura: sessao.nome || sessao.leitura.nome_leitura,
  })
  return parseado.success ? parseado.data : null
}

export async function obterLeituraDoSnapshot(
  prisma: PrismaClient,
  idLeituraLegado: string,
  idWorkspace: string,
): Promise<Leitura | null> {
  if (!idWorkspace) return null

  const registro = await prisma.snapshotLeituraSmartRead.findFirst({
    where: {
      ...clausulaWorkspaceLeituraSmartRead(idWorkspace),
      id_leitura_legado_snapshot_leitura_smart_read: idLeituraLegado,
    },
  })
  if (!registro) return null
  return leituraDeRegistroSnapshot(registro)
}

export async function carregarSnapshotsPorIds(
  prisma: PrismaClient,
  idsLeitura: string[],
  idWorkspace: string,
): Promise<Map<string, TransacaoLeitura>> {
  if (idsLeitura.length === 0 || !idWorkspace) return new Map()

  const registros = await prisma.snapshotLeituraSmartRead.findMany({
    where: {
      ...clausulaWorkspaceLeituraSmartRead(idWorkspace),
      id_leitura_legado_snapshot_leitura_smart_read: { in: idsLeitura },
    },
  })

  const mapa = new Map<string, TransacaoLeitura>()
  for (const registro of registros) {
    const transacao = transacaoDeRegistroSnapshot(registro)
    if (transacao) {
      mapa.set(registro.id_leitura_legado_snapshot_leitura_smart_read, transacao)
    }
  }
  return mapa
}
