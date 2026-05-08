/**
 * moedas-canonicas.test.ts — testes unitários da lista canônica de moedas.
 *
 * Cobre:
 *   - Lista não vazia (sentinela contra refator destrutivo)
 *   - Cada entrada tem `sigla` ISO 4217 (3 letras maiúsculas)
 *   - Cada entrada tem `descricao` não vazia
 *   - Sem duplicatas (sigla é PK no banco — duplicata estoura upsert)
 *   - Cada entrada passa o `moedaSchema` do Zod (contrato bilateral)
 */
import { describe, it, expect } from 'vitest'
import { MOEDAS_CANONICAS } from '../../prisma/data/moedas-canonicas.js'
import { moedaSchema } from '../../shared/schemas/moeda.schema.js'

describe('MOEDAS_CANONICAS — integridade da lista', () => {
  it('contém pelo menos as moedas mais usadas em COMEX', () => {
    const siglas = new Set(MOEDAS_CANONICAS.map((m) => m.sigla))
    for (const obrigatoria of ['USD', 'EUR', 'BRL', 'CNY', 'GBP', 'JPY']) {
      expect(siglas.has(obrigatoria)).toBe(true)
    }
  })

  it('tem mais de 100 entradas (lista canônica completa)', () => {
    expect(MOEDAS_CANONICAS.length).toBeGreaterThan(100)
  })

  it('toda sigla segue padrão ISO 4217 (3 letras maiúsculas)', () => {
    const regex = /^[A-Z]{3}$/
    for (const m of MOEDAS_CANONICAS) {
      expect(m.sigla, `sigla inválida: ${m.sigla}`).toMatch(regex)
    }
  })

  it('toda descricao é não-vazia (mínimo 1 caractere)', () => {
    for (const m of MOEDAS_CANONICAS) {
      expect(m.descricao, `descricao vazia para ${m.sigla}`).toBeTruthy()
      expect(m.descricao.trim().length, `descricao só de espaços para ${m.sigla}`).toBeGreaterThan(0)
    }
  })

  it('não tem duplicatas de sigla (sigla é PK no banco)', () => {
    const siglas = MOEDAS_CANONICAS.map((m) => m.sigla)
    const unicas = new Set(siglas)
    expect(siglas.length, 'duplicata detectada — quebraria o seed por violar PK').toBe(unicas.size)
  })

  it('cada entrada do seed (após mapping) passa moedaSchema do Cadastros', () => {
    // Mapping idêntico ao seed-moedas.ts — garante que o que o script escreve
    // no banco satisfaz o contrato Zod do serviço (Mandamento 09).
    for (const m of MOEDAS_CANONICAS) {
      const dadosNoBanco = {
        codigo_moeda: m.sigla,
        nome_moeda: m.descricao,
        simbolo_moeda: m.sigla,
        ativo_moeda: true,
      }
      const resultado = moedaSchema.safeParse(dadosNoBanco)
      expect(
        resultado.success,
        `Falhou pra ${m.sigla}: ${resultado.success ? '' : JSON.stringify(resultado.error.flatten().fieldErrors)}`,
      ).toBe(true)
    }
  })
})
