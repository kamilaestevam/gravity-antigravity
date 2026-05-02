/**
 * lpcoStatusEngine.test.ts — Testes unitarios para a maquina de estados do LPCO
 */

import { describe, it, expect } from 'vitest'
import { validarTransicao, AppError } from '../lpcoStatusEngine.js'

type LpcoStatus =
  | 'rascunho'
  | 'para_analise'
  | 'em_analise'
  | 'em_exigencia'
  | 'resposta_exigencia'
  | 'deferida'
  | 'indeferida'
  | 'cancelada'

describe('validarTransicao', () => {
  // ── Transicoes validas ──────────────────────────────────────────────────────

  describe('transicoes validas', () => {
    const casosValidos: Array<[LpcoStatus, LpcoStatus]> = [
      ['rascunho', 'para_analise'],
      ['rascunho', 'cancelada'],
      ['para_analise', 'em_analise'],
      ['para_analise', 'cancelada'],
      ['em_analise', 'deferida'],
      ['em_analise', 'em_exigencia'],
      ['em_analise', 'indeferida'],
      ['em_analise', 'cancelada'],
      ['em_exigencia', 'resposta_exigencia'],
      ['em_exigencia', 'cancelada'],
      ['resposta_exigencia', 'em_analise'],
      ['resposta_exigencia', 'cancelada'],
    ]

    it.each(casosValidos)(
      'deve permitir transicao %s → %s',
      (statusAtual, statusNovo) => {
        expect(validarTransicao(statusAtual, statusNovo)).toBe(true)
      }
    )
  })

  // ── Transicoes invalidas ────────────────────────────────────────────────────

  describe('transicoes invalidas', () => {
    const casosInvalidos: Array<[LpcoStatus, LpcoStatus]> = [
      // Pular etapas
      ['rascunho', 'deferida'],
      ['rascunho', 'em_analise'],
      ['rascunho', 'indeferida'],
      ['rascunho', 'em_exigencia'],
      ['rascunho', 'resposta_exigencia'],
      // Transicoes retroativas
      ['deferida', 'rascunho'],
      ['deferida', 'em_analise'],
      ['deferida', 'para_analise'],
      ['indeferida', 'rascunho'],
      ['indeferida', 'em_analise'],
      // Cancelada nao pode ir para nada
      ['cancelada', 'rascunho'],
      ['cancelada', 'para_analise'],
      ['cancelada', 'em_analise'],
      ['cancelada', 'deferida'],
      ['cancelada', 'indeferida'],
      ['cancelada', 'em_exigencia'],
      ['cancelada', 'resposta_exigencia'],
      // Deferida e indeferida sao terminais
      ['deferida', 'cancelada'],
      ['deferida', 'em_exigencia'],
      ['indeferida', 'cancelada'],
      ['indeferida', 'para_analise'],
      // Caminhos invalidos entre estados intermediarios
      ['para_analise', 'deferida'],
      ['para_analise', 'indeferida'],
      ['para_analise', 'em_exigencia'],
      ['para_analise', 'resposta_exigencia'],
      ['para_analise', 'rascunho'],
      ['em_exigencia', 'deferida'],
      ['em_exigencia', 'indeferida'],
      ['em_exigencia', 'em_analise'],
      ['em_exigencia', 'rascunho'],
      ['resposta_exigencia', 'deferida'],
      ['resposta_exigencia', 'rascunho'],
      ['resposta_exigencia', 'em_exigencia'],
    ]

    it.each(casosInvalidos)(
      'deve rejeitar transicao %s → %s',
      (statusAtual, statusNovo) => {
        expect(validarTransicao(statusAtual, statusNovo)).toBe(false)
      }
    )
  })

  // ── Edge cases ──────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    const todosStatus: LpcoStatus[] = [
      'rascunho', 'para_analise', 'em_analise', 'em_exigencia',
      'resposta_exigencia', 'deferida', 'indeferida', 'cancelada',
    ]

    it.each(todosStatus)(
      'deve rejeitar transicao de %s para si mesmo',
      (status) => {
        expect(validarTransicao(status, status)).toBe(false)
      }
    )

    it('deve retornar false para status desconhecido como origem', () => {
      expect(validarTransicao('inexistente' as LpcoStatus, 'rascunho')).toBe(false)
    })

    it('deve retornar false para status desconhecido como destino', () => {
      expect(validarTransicao('rascunho', 'inexistente' as LpcoStatus)).toBe(false)
    })
  })

  // ── Estados terminais ───────────────────────────────────────────────────────

  describe('estados terminais', () => {
    const todosStatus: LpcoStatus[] = [
      'rascunho', 'para_analise', 'em_analise', 'em_exigencia',
      'resposta_exigencia', 'deferida', 'indeferida', 'cancelada',
    ]

    it('deferida nao pode transitar para nenhum status', () => {
      for (const destino of todosStatus) {
        expect(validarTransicao('deferida', destino)).toBe(false)
      }
    })

    it('indeferida nao pode transitar para nenhum status', () => {
      for (const destino of todosStatus) {
        expect(validarTransicao('indeferida', destino)).toBe(false)
      }
    })

    it('cancelada nao pode transitar para nenhum status', () => {
      for (const destino of todosStatus) {
        expect(validarTransicao('cancelada', destino)).toBe(false)
      }
    })
  })

  // ── Fluxo completo ────────────────────────────────────────────────────────

  describe('fluxos completos', () => {
    it('deve permitir fluxo feliz: rascunho → para_analise → em_analise → deferida', () => {
      expect(validarTransicao('rascunho', 'para_analise')).toBe(true)
      expect(validarTransicao('para_analise', 'em_analise')).toBe(true)
      expect(validarTransicao('em_analise', 'deferida')).toBe(true)
    })

    it('deve permitir fluxo com exigencia: em_analise → em_exigencia → resposta → em_analise → deferida', () => {
      expect(validarTransicao('em_analise', 'em_exigencia')).toBe(true)
      expect(validarTransicao('em_exigencia', 'resposta_exigencia')).toBe(true)
      expect(validarTransicao('resposta_exigencia', 'em_analise')).toBe(true)
      expect(validarTransicao('em_analise', 'deferida')).toBe(true)
    })

    it('deve permitir fluxo de indeferimento: rascunho → para_analise → em_analise → indeferida', () => {
      expect(validarTransicao('rascunho', 'para_analise')).toBe(true)
      expect(validarTransicao('para_analise', 'em_analise')).toBe(true)
      expect(validarTransicao('em_analise', 'indeferida')).toBe(true)
    })

    it('deve permitir cancelamento em qualquer etapa intermediaria', () => {
      expect(validarTransicao('rascunho', 'cancelada')).toBe(true)
      expect(validarTransicao('para_analise', 'cancelada')).toBe(true)
      expect(validarTransicao('em_analise', 'cancelada')).toBe(true)
      expect(validarTransicao('em_exigencia', 'cancelada')).toBe(true)
      expect(validarTransicao('resposta_exigencia', 'cancelada')).toBe(true)
    })
  })
})

describe('AppError', () => {
  it('deve criar erro com valores padrao', () => {
    const err = new AppError('teste')
    expect(err.message).toBe('teste')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.name).toBe('AppError')
  })

  it('deve criar erro com valores customizados', () => {
    const err = new AppError('nao encontrado', 404, 'NOT_FOUND')
    expect(err.message).toBe('nao encontrado')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('deve ser instancia de Error', () => {
    const err = new AppError('teste')
    expect(err).toBeInstanceOf(Error)
  })
})
