/**
 * Numeração global de passos do plano EMT 000112 — SSOT compartilhado entre
 * `gerar-plano-edicao-em-massa.ts` (plano .md) e `run-lista-edicao-em-massa.ts`
 * (runner). Garante que o print de cada passo tem o mesmo número nos dois lados.
 *
 * Estrutura: passos 001–005 (preparação/UX/drift) → etapas de grupo (cada grupo
 * termina com passo de persistência hub→lista, regra universal do EMT) →
 * combinado → colunas manuais → tipo de operação → erros → persistência final.
 */
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
} from '../../../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa.js'

export type CampoMassa = (typeof CAMPOS_EDICAO_MASSA_PEDIDO)[number]
export type NivelGrupo = 'PEDIDO' | 'ITEM'

export type PassoCampo = {
  passo: number
  campo: CampoMassa
  nivel: NivelGrupo
}

export type GrupoPlano = {
  etapa: number
  nivel: NivelGrupo
  grupo: string
  passos: PassoCampo[]
  passoPersistencia: number
  slugPersistencia: string
}

export function fmtPasso(n: number): string {
  return String(n).padStart(3, '0')
}

export function slugCampo(campo: string): string {
  return campo.replace(/[^a-z0-9_]/gi, '')
}

export function slugGrupo(grupo: string): string {
  return grupo.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function agrupar(campos: readonly CampoMassa[]): Map<string, CampoMassa[]> {
  const mapa = new Map<string, CampoMassa[]>()
  for (const c of campos) {
    const lista = mapa.get(c.grupo) ?? []
    lista.push(c)
    mapa.set(c.grupo, lista)
  }
  return mapa
}

function montar(): {
  grupos: GrupoPlano[]
  PASSO_COMBINADO: number
  PASSO_COMBINADO_PERSISTENCIA: number
  PASSO_COLUNAS_USUARIO: number
  PASSO_COLUNAS_PERSISTENCIA: number
  PASSO_TIPO_OPERACAO: number
  PASSO_TIPO_OP_PERSISTENCIA: number
  PASSO_ERROS: number
  PASSO_FINAL: number
} {
  const grupos: GrupoPlano[] = []
  let passo = 6 // 001 login/lista · 002 pedido-alvo · 003 modal · 004/005 drift
  let etapa = 3

  for (const [nivel, fonte] of [
    ['PEDIDO', CAMPOS_EDICAO_MASSA_PEDIDO],
    ['ITEM', CAMPOS_EDICAO_MASSA_ITEM],
  ] as const) {
    for (const [grupo, campos] of agrupar(fonte)) {
      const passos: PassoCampo[] = campos.map(campo => ({ passo: passo++, campo, nivel }))
      grupos.push({
        etapa: etapa++,
        nivel,
        grupo,
        passos,
        passoPersistencia: passo,
        slugPersistencia: `${fmtPasso(passo)}-${nivel.toLowerCase()}-${slugGrupo(grupo)}-persistencia-apos-navegar-resultado`,
      })
      passo++ // passo de persistência da etapa
    }
  }

  const PASSO_COMBINADO = passo // incoterm cascade
  const PASSO_COMBINADO_PERSISTENCIA = passo + 2 // 2 passos de edição + persistência
  passo += 3

  const PASSO_COLUNAS_USUARIO = passo // 7 tipos (…+6), fórmula (+7), escopo (+8)
  const PASSO_COLUNAS_PERSISTENCIA = passo + 9
  passo += 10

  const PASSO_TIPO_OPERACAO = passo // ida, volta, item
  const PASSO_TIPO_OP_PERSISTENCIA = passo + 3
  passo += 4

  const PASSO_ERROS = passo // 4 passos — não altera dados, sem persistência
  passo += 4

  const PASSO_FINAL = passo

  return {
    grupos,
    PASSO_COMBINADO,
    PASSO_COMBINADO_PERSISTENCIA,
    PASSO_COLUNAS_USUARIO,
    PASSO_COLUNAS_PERSISTENCIA,
    PASSO_TIPO_OPERACAO,
    PASSO_TIPO_OP_PERSISTENCIA,
    PASSO_ERROS,
    PASSO_FINAL,
  }
}

export const NUMERACAO = montar()
