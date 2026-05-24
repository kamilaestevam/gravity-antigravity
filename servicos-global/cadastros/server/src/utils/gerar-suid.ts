/**
 * Geração de SUID (Stable Unique IDentifier) para Fornecedor.
 *
 * Formato: `${PAIS}-${SLUG_NOME}-${SEQ_5}`  (ex: `BR-CAOA-MONTADORA-00001`).
 */
import type { PrismaClient } from '../../../generated/index.js'

const TAMANHO_SEQUENCIAL = 5

export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function formatarSequencial(n: number): string {
  return String(n).padStart(TAMANHO_SEQUENCIAL, '0')
}

export function montarSuid(pais: string, nome: string, sequencial: number): string {
  return `${pais.toUpperCase()}-${slugificar(nome)}-${formatarSequencial(sequencial)}`
}

export async function gerarSuid(
  prisma: Pick<PrismaClient, 'fornecedor'>,
  args: { id_organizacao: string; pais_fornecedor: string; nome_fornecedor: string },
): Promise<string> {
  const { id_organizacao, pais_fornecedor, nome_fornecedor } = args
  const total = await prisma.fornecedor.count({
    where: { id_organizacao_cadastro_fornecedor: id_organizacao, pais_fornecedor },
  })

  let proximo = total + 1
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const candidato = montarSuid(pais_fornecedor, nome_fornecedor, proximo)
    const existe = await prisma.fornecedor.findUnique({ where: { id_fornecedor: candidato } })
    if (!existe) return candidato
    proximo++
  }
  throw new Error(
    `[gerarSuid] Não foi possível gerar SUID livre após 50 tentativas (id_organizacao=${id_organizacao}, pais=${pais_fornecedor}, nome=${nome_fornecedor})`,
  )
}
