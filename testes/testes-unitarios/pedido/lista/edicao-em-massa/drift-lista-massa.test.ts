// @vitest-environment node
/**
 * drift-lista-massa.test.ts — Guard-rail de drift (Onda 4 — 2026-06-11)
 *
 * Regra de produto (dono, 2026-06-10): "se o campo pode ser editável na
 * lista, ele deve ser editável em massa" — incluindo colunas de usuário.
 *
 * Este teste trava o contrato em CI:
 *   1. Partição completa: todo campo do DDD é editável em massa OU está
 *      na blocklist OU é parser-only — nenhum campo no limbo.
 *   2. Disjunção: nenhum bloqueado escapa pelo validador.
 *   3. Paridade física: todo campo editável não-JSON existe como coluna
 *      no fragment.prisma (nenhum campo fantasma).
 *   4. Convenção coluna_usuario:<id> aceita; malformada rejeitada.
 *   5. Contagens fixadas: se o DDD crescer, este teste quebra de propósito —
 *      atualize os números APÓS conferir blocklist e modal (drift consciente).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
} from '../../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
  CAMPOS_BLOQUEADOS_PEDIDO,
  CAMPOS_BLOQUEADOS_ITEM,
  CAMPOS_DETALHES_OPERACIONAIS,
  campoEditavelEmMassa,
  motivoBloqueioCampo,
  ehCampoColunaUsuario,
  idColunaUsuarioDeCampo,
} from '../../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa'

const PARSER_ONLY = new Set(['tipo_linha'])

describe('Drift lista ⇔ edição em massa — partição completa do DDD', () => {
  it('todo campo DDD de pedido é editável em massa, bloqueado ou parser-only', () => {
    const limbo = CAMPOS_PEDIDO_DDD
      .filter(c =>
        !campoEditavelEmMassa(c.campo, 'pedido') &&
        !CAMPOS_BLOQUEADOS_PEDIDO.has(c.campo) &&
        !PARSER_ONLY.has(c.campo))
      .map(c => c.campo)
    expect(limbo).toEqual([])
  })

  it('todo campo DDD de item é editável em massa ou bloqueado', () => {
    const limbo = CAMPOS_ITEM_DDD
      .filter(c =>
        !campoEditavelEmMassa(c.campo, 'item') &&
        !CAMPOS_BLOQUEADOS_ITEM.has(c.campo))
      .map(c => c.campo)
    expect(limbo).toEqual([])
  })

  it('nenhum campo bloqueado de pedido passa pelo validador', () => {
    for (const campo of CAMPOS_BLOQUEADOS_PEDIDO) {
      expect(campoEditavelEmMassa(campo, 'pedido'), campo).toBe(false)
      expect(motivoBloqueioCampo(campo, 'pedido'), campo).toBe('bloqueado')
    }
  })

  it('nenhum campo bloqueado de item passa pelo validador', () => {
    for (const campo of CAMPOS_BLOQUEADOS_ITEM) {
      expect(campoEditavelEmMassa(campo, 'item'), campo).toBe(false)
      expect(motivoBloqueioCampo(campo, 'item'), campo).toBe('bloqueado')
    }
  })

  it('editáveis e bloqueados são conjuntos disjuntos', () => {
    const colisoesPedido = CAMPOS_EDICAO_MASSA_PEDIDO
      .filter(c => CAMPOS_BLOQUEADOS_PEDIDO.has(c.campo)).map(c => c.campo)
    const colisoesItem = CAMPOS_EDICAO_MASSA_ITEM
      .filter(c => CAMPOS_BLOQUEADOS_ITEM.has(c.campo)).map(c => c.campo)
    expect(colisoesPedido).toEqual([])
    expect(colisoesItem).toEqual([])
  })

  it('campo desconhecido falha ruidosamente (Mand. 08)', () => {
    expect(motivoBloqueioCampo('campo_que_nao_existe', 'pedido')).toBe('desconhecido')
    expect(motivoBloqueioCampo('campo_que_nao_existe', 'item')).toBe('desconhecido')
  })
})

describe('Drift — paridade física com o fragment.prisma', () => {
  const prisma = readFileSync(
    resolve(__dirname, '../../../../../servicos-global/produto/pedido/prisma/fragment.prisma'),
    'utf8',
  )

  it('todo campo editável não-JSON é coluna física do Prisma', () => {
    const fantasmas = [...CAMPOS_EDICAO_MASSA_PEDIDO, ...CAMPOS_EDICAO_MASSA_ITEM]
      .filter(c => !c.armazenadoEmJson && !new RegExp(`\\b${c.campo}\\b`).test(prisma))
      .map(c => `${c.nivel}:${c.campo}`)
    expect(fantasmas).toEqual([])
  })

  it('todo campo JSON está em CAMPOS_DETALHES_OPERACIONAIS', () => {
    const fora = [...CAMPOS_EDICAO_MASSA_PEDIDO, ...CAMPOS_EDICAO_MASSA_ITEM]
      .filter(c => c.armazenadoEmJson && !CAMPOS_DETALHES_OPERACIONAIS.has(c.campo))
      .map(c => c.campo)
    expect(fora).toEqual([])
  })
})

describe('Drift — colunas criadas pelo usuário (coluna_usuario:<id>)', () => {
  it('convenção com id válido é aceita nos dois níveis', () => {
    expect(campoEditavelEmMassa('coluna_usuario:abc123', 'pedido')).toBe(true)
    expect(campoEditavelEmMassa('coluna_usuario:abc123', 'item')).toBe(true)
    expect(idColunaUsuarioDeCampo('coluna_usuario:abc123')).toBe('abc123')
  })

  it('prefixo sem id é rejeitado (malformado)', () => {
    expect(ehCampoColunaUsuario('coluna_usuario:')).toBe(true)
    expect(idColunaUsuarioDeCampo('coluna_usuario:')).toBeNull()
    expect(campoEditavelEmMassa('coluna_usuario:', 'pedido')).toBe(false)
    expect(campoEditavelEmMassa('coluna_usuario:', 'item')).toBe(false)
  })

  it('campo comum não é confundido com coluna de usuário', () => {
    expect(ehCampoColunaUsuario('incoterm_pedido')).toBe(false)
    expect(idColunaUsuarioDeCampo('incoterm_pedido')).toBeNull()
  })
})

describe('Drift — contagens fixadas (alarme de drift consciente)', () => {
  // Ao adicionar campo no DDD/Prisma, estes números mudam DE PROPÓSITO.
  // Confira blocklist + modal antes de atualizar (processo Onda 1-3, 2026-06-11).
  it('111 campos de pedido editáveis em massa', () => {
    expect(CAMPOS_EDICAO_MASSA_PEDIDO.length).toBe(111)
  })

  it('55 campos de item editáveis em massa', () => {
    expect(CAMPOS_EDICAO_MASSA_ITEM.length).toBe(55)
  })

  it('14 bloqueados de pedido / 10 bloqueados de item', () => {
    expect(CAMPOS_BLOQUEADOS_PEDIDO.size).toBe(14)
    expect(CAMPOS_BLOQUEADOS_ITEM.size).toBe(10)
  })

  it('sem duplicatas de campo dentro de cada nível', () => {
    const pedidoSet = new Set(CAMPOS_EDICAO_MASSA_PEDIDO.map(c => c.campo))
    const itemSet = new Set(CAMPOS_EDICAO_MASSA_ITEM.map(c => c.campo))
    expect(pedidoSet.size).toBe(CAMPOS_EDICAO_MASSA_PEDIDO.length)
    expect(itemSet.size).toBe(CAMPOS_EDICAO_MASSA_ITEM.length)
  })
})
