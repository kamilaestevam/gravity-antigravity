/**
 * Garante vínculo Postgres (progresso/snapshot) sem bloquear polling quando o legado já tem a leitura.
 * Evita split-brain: POST criou no DATI mas `registrarVinculo` falhou → GET heal-on-read.
 */
import type { PrismaClient } from '../generated/client/index.js'
import { leituraVinculadaAoWorkspaceSmartRead } from './escopo-workspace-leitura-smart-read.js'
import { registrarVinculoLeituraUsuarioSmartRead } from './registrar-vinculo-leitura-usuario-smart-read.js'

export async function tentarRecuperarVinculoLeituraWorkspaceSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  idLeitura: string
  leituraExisteNoLegado: boolean
}): Promise<boolean> {
  const { prisma, idOrganizacao, idUsuario, idWorkspace, idLeitura, leituraExisteNoLegado } = params

  const vinculada = await leituraVinculadaAoWorkspaceSmartRead(prisma, idLeitura, idWorkspace)
  if (vinculada) return true

  if (!leituraExisteNoLegado) return false

  try {
    await registrarVinculoLeituraUsuarioSmartRead({
      prisma,
      idOrganizacao,
      idUsuario,
      idWorkspace,
      idLeitura,
    })
    return true
  } catch (erro) {
    console.error('[smart-read][vinculo] heal-on-read falhou — polling segue via legado', {
      idLeitura,
      idWorkspace,
      erro,
    })
    return true
  }
}
