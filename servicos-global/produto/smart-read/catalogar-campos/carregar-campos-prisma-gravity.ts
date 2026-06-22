/**
 * Índice de campos escalares reais nos fragment.prisma Gravity (fonte única).
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dir, '../../..')

export type CampoPrismaGravity = {
  nome_campo: string
  model: string
  fragmento: string
}

const FRAGMENTOS = [
  ['Processo', join(RAIZ, 'produto/processo/prisma/fragment.prisma')],
  ['Pedido', join(RAIZ, 'produto/pedido/prisma/fragment.prisma')],
  ['Cadastros', join(RAIZ, 'cadastros/prisma/fragment.prisma')],
] as const

let cache: CampoPrismaGravity[] | null = null

function extrairCampos(conteudo: string, fragmento: string): CampoPrismaGravity[] {
  const campos: CampoPrismaGravity[] = []
  const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/gs
  let m: RegExpExecArray | null
  while ((m = modelRegex.exec(conteudo)) !== null) {
    const model = m[1]
    const corpo = m[2]
    const linhaRegex = /^\s+([a-z][a-z0-9_]*)\s+(String|Int|Boolean|Decimal|DateTime|Json|Float|BigInt)/gm
    let l: RegExpExecArray | null
    while ((l = linhaRegex.exec(corpo)) !== null) {
      campos.push({ nome_campo: l[1], model, fragmento })
    }
  }
  return campos
}

export async function carregarCamposPrismaGravity(): Promise<CampoPrismaGravity[]> {
  if (cache) return cache
  const todos: CampoPrismaGravity[] = []
  for (const [fragmento, caminho] of FRAGMENTOS) {
    const conteudo = await readFile(caminho, 'utf8')
    todos.push(...extrairCampos(conteudo, fragmento))
  }
  cache = todos
  return todos
}

export async function indicePorNomeCampo(): Promise<Map<string, CampoPrismaGravity[]>> {
  const campos = await carregarCamposPrismaGravity()
  const mapa = new Map<string, CampoPrismaGravity[]>()
  for (const c of campos) {
    if (!mapa.has(c.nome_campo)) mapa.set(c.nome_campo, [])
    mapa.get(c.nome_campo)!.push(c)
  }
  return mapa
}

export function validarCampoExiste(
  indice: Map<string, CampoPrismaGravity[]>,
  nomeCampo: string,
): CampoPrismaGravity[] {
  return indice.get(nomeCampo) ?? []
}
