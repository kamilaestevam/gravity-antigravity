/**
 * unidades-canonicas.test.ts — testes unitários da lista canônica de unidades.
 *
 * Cobre:
 *   - Lista não vazia
 *   - Cada entrada tem `sigla` (max 8 chars) e `descricao` (não vazio)
 *   - Cada entrada tem `categoria` válida (10 categorias do enum)
 *   - Sem duplicatas de sigla (sigla é PK no banco)
 *   - Cada entrada (após mapping) passa o `unidadeSchema` Zod
 *   - Categorias essenciais COMEX presentes (peso, volume, contagem)
 */
import { describe, it, expect } from 'vitest'
import { UNIDADES_CANONICAS } from '../../prisma/data/unidades-canonicas.js'
import { unidadeSchema, tipoUnidadeEnum } from '../../shared/schemas/unidade.schema.js'

describe('UNIDADES_CANONICAS — integridade da lista', () => {
  it('contém pelo menos as unidades essenciais COMEX', () => {
    const siglas = new Set(UNIDADES_CANONICAS.map((u) => u.sigla))
    for (const obrigatoria of ['KG', 'G', 'TON', 'UN', 'M', 'LT', 'M3']) {
      expect(siglas.has(obrigatoria), `${obrigatoria} ausente na lista canônica`).toBe(true)
    }
  })

  it('tem mais de 50 entradas (lista canônica completa)', () => {
    expect(UNIDADES_CANONICAS.length).toBeGreaterThan(50)
  })

  it('toda sigla cabe em codigo_unidade (max 8 chars)', () => {
    for (const u of UNIDADES_CANONICAS) {
      expect(u.sigla.length, `sigla muito longa: ${u.sigla}`).toBeLessThanOrEqual(8)
      expect(u.sigla.length, `sigla vazia`).toBeGreaterThanOrEqual(1)
    }
  })

  it('toda descricao é não-vazia', () => {
    for (const u of UNIDADES_CANONICAS) {
      expect(u.descricao.trim().length, `descricao vazia para ${u.sigla}`).toBeGreaterThan(0)
    }
  })

  it('toda categoria está nas 10 categorias válidas do enum', () => {
    const categorias = new Set(['peso', 'volume', 'comprimento', 'area', 'contagem', 'energia', 'gemas', 'agrupamento', 'embalagem', 'caixa'])
    for (const u of UNIDADES_CANONICAS) {
      expect(categorias.has(u.categoria), `categoria inválida para ${u.sigla}: ${u.categoria}`).toBe(true)
    }
  })

  it('não tem duplicatas de sigla (sigla é PK no banco)', () => {
    const siglas = UNIDADES_CANONICAS.map((u) => u.sigla)
    expect(siglas.length, 'duplicata detectada').toBe(new Set(siglas).size)
  })

  it('cada entrada (após mapping) passa unidadeSchema do Cadastros', () => {
    for (const u of UNIDADES_CANONICAS) {
      const dadosNoBanco = {
        codigo_unidade: u.sigla,
        nome_unidade: u.descricao,
        tipo_unidade: u.categoria,
        ativo_unidade: true,
      }
      const resultado = unidadeSchema.safeParse(dadosNoBanco)
      expect(
        resultado.success,
        `Falhou pra ${u.sigla}: ${resultado.success ? '' : JSON.stringify(resultado.error.flatten().fieldErrors)}`,
      ).toBe(true)
    }
  })

  it('tipoUnidadeEnum aceita todas as 10 categorias do master', () => {
    for (const cat of ['peso', 'volume', 'comprimento', 'area', 'contagem', 'energia', 'gemas', 'agrupamento', 'embalagem', 'caixa']) {
      expect(tipoUnidadeEnum.safeParse(cat).success, `enum rejeita ${cat}`).toBe(true)
    }
  })
})
