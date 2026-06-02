/**
 * Gera numero_processo legível: Gravity-00001/26
 */
import type { PrismaClient } from '../../../generated/index.js'

export async function gerarNumeroProcesso(
  prisma: PrismaClient,
  idOrganizacao: string,
): Promise<string> {
  const ano = new Date().getFullYear() % 100
  const prefixo = `Gravity-`

  const ultimo = await prisma.processo.findFirst({
    where: {
      id_organizacao: idOrganizacao,
      numero_processo: { startsWith: prefixo },
    },
    orderBy: { data_criacao_processo: 'desc' },
    select: { numero_processo: true },
  })

  let sequencia = 1
  if (ultimo?.numero_processo) {
    const match = ultimo.numero_processo.match(/Gravity-(\d+)\/\d{2}$/)
    if (match) {
      sequencia = parseInt(match[1], 10) + 1
    }
  }

  return `${prefixo}${String(sequencia).padStart(5, '0')}/${String(ano).padStart(2, '0')}`
}
