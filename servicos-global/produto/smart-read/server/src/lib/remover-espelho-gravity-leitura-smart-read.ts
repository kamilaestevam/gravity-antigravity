/**
 * Remove snapshot e progresso Gravity após exclusão no legado DATI.
 */
import type { PrismaClient } from '../generated/client/index.js'
import { clausulaWorkspaceLeituraSmartRead } from './escopo-workspace-leitura-smart-read.js'

export async function removerEspelhoGravityLeituraSmartRead(params: {
  prisma: PrismaClient
  idLeitura: string
  idWorkspace: string
}): Promise<void> {
  const { prisma, idLeitura, idWorkspace } = params
  const filtroWorkspace = clausulaWorkspaceLeituraSmartRead(idWorkspace)

  await prisma.snapshotLeituraSmartRead.deleteMany({
    where: {
      ...filtroWorkspace,
      id_leitura_legado_snapshot_leitura_smart_read: idLeitura,
    },
  })

  await prisma.progressoLeituraSmartRead.deleteMany({
    where: {
      ...filtroWorkspace,
      id_leitura_legado_progresso_leitura_smart_read: idLeitura,
    },
  })
}
