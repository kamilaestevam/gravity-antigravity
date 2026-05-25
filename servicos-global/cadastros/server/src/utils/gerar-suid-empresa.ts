/**
 * SUID para Empresa (identidade 1:1 da organização).
 * Colisão verificada em empresa e fornecedor (IDs compartilham namespace).
 */
import type { PrismaClient } from '../../../generated/index.js'
import { montarSuid, slugificar, formatarSequencial } from './gerar-suid.js'

export async function gerarSuidEmpresa(
  prisma: Pick<PrismaClient, 'empresa' | 'fornecedor'>,
  args: { id_organizacao: string; pais_empresa: string; nome_empresa: string },
): Promise<string> {
  const { id_organizacao, pais_empresa, nome_empresa } = args
  const total = await prisma.empresa.count({
    where: { id_organizacao_empresa: id_organizacao, pais_empresa },
  })

  let proximo = total + 1
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const candidato = montarSuid(pais_empresa, nome_empresa, proximo)
    const [existeEmp, existeForn] = await Promise.all([
      prisma.empresa.findUnique({ where: { id_empresa: candidato } }),
      prisma.fornecedor.findUnique({ where: { id_fornecedor: candidato } }),
    ])
    if (!existeEmp && !existeForn) return candidato
    proximo++
  }
  throw new Error(
    `[gerarSuidEmpresa] SUID indisponível após 50 tentativas (org=${id_organizacao})`,
  )
}

export { slugificar, formatarSequencial, montarSuid }
