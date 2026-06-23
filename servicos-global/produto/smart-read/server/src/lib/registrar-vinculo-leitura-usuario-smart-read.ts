/**
 * Vincula leitura legada ao workspace Gravity (visibilidade na lista da filial).
 */
import type { Prisma } from '../generated/client/index.js'
import type { PrismaClient } from '../generated/client/index.js'

export async function registrarVinculoLeituraUsuarioSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  idLeitura: string
}): Promise<void> {
  const { prisma, idOrganizacao, idUsuario, idWorkspace, idLeitura } = params

  const existente = await prisma.progressoLeituraSmartRead.findFirst({
    where: {
      id_usuario: idUsuario,
      id_leitura_legado_progresso_leitura_smart_read: idLeitura,
    },
    select: { id_progresso_leitura_smart_read: true, id_workspace: true },
  })
  if (existente) {
    if (!existente.id_workspace) {
      await prisma.progressoLeituraSmartRead.update({
        where: { id_progresso_leitura_smart_read: existente.id_progresso_leitura_smart_read },
        data: { id_workspace: idWorkspace },
      })
    }
    return
  }

  const dadosSessao = {
    nome: '',
    leitura: {
      id_leitura: idLeitura,
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    },
  } satisfies Prisma.InputJsonObject

  await prisma.progressoLeituraSmartRead.create({
    data: {
      id_organizacao: idOrganizacao,
      id_usuario: idUsuario,
      id_workspace: idWorkspace,
      id_leitura_legado_progresso_leitura_smart_read: idLeitura,
      passo_atual_progresso_leitura_smart_read: 1,
      dados_sessao_progresso_leitura_smart_read: dadosSessao as Prisma.InputJsonValue,
    },
  })
}
