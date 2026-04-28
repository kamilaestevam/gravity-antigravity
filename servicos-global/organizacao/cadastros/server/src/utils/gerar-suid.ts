/**
 * Geração de SUID (Stable Unique IDentifier) para Empresa.
 *
 * Formato: `${PAIS}-${SLUG_NOME}-${SEQ_5}`  (ex: `BR-CAOA-MONTADORA-00001`).
 *
 * O sequencial é por (id_organizacao, pais) — não global. SUID per-tenant
 * é uma decisão consciente do documento técnico (seção 2.3): isolamento
 * prevalece sobre unicidade global.
 *
 * Concorrência: usamos `count` + retry no `create`. Em caso de colisão
 * (corrida entre dois inserts simultâneos), o caller deve recapturar o
 * erro de unique constraint (`@@unique` no SUID) e chamar de novo.
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
    .slice(0, 40) // teto pra evitar SUIDs gigantes
}

export function formatarSequencial(n: number): string {
  return String(n).padStart(TAMANHO_SEQUENCIAL, '0')
}

export function montarSuid(pais: string, nome: string, sequencial: number): string {
  return `${pais.toUpperCase()}-${slugificar(nome)}-${formatarSequencial(sequencial)}`
}

/**
 * Gera o próximo SUID livre para a tupla (id_organizacao, pais, nome).
 * Faz `count` filtrado por (id_organizacao, pais) e incrementa. Se o SUID
 * candidato já existir (colisão por mesmo nome+país no tenant), avança
 * o sufixo até achar um livre.
 */
export async function gerarSuid(
  prisma: Pick<PrismaClient, 'empresa'>,
  args: { id_organizacao: string; pais_empresa: string; nome_empresa: string },
): Promise<string> {
  const { id_organizacao, pais_empresa, nome_empresa } = args
  const total = await prisma.empresa.count({
    where: { id_organizacao_empresa: id_organizacao, pais_empresa },
  })

  // Tenta até 50 vezes — colisão extrema indicaria bug no slug ou catálogo
  // monstro de homônimos no tenant. Falha alto se ultrapassar (M08).
  let proximo = total + 1
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const candidato = montarSuid(pais_empresa, nome_empresa, proximo)
    const existe = await prisma.empresa.findUnique({ where: { suid_empresa: candidato } })
    if (!existe) return candidato
    proximo++
  }
  throw new Error(
    `[gerarSuid] Não foi possível gerar SUID livre após 50 tentativas (id_organizacao=${id_organizacao}, pais=${pais_empresa}, nome=${nome_empresa})`,
  )
}
