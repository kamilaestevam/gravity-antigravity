/**
 * smart-import-limite-linhas.test.ts — Limite rigido de 1.000 linhas no Smart Import
 */

import { describe, it, expect } from 'vitest'
import {
  LIMITE_LINHAS_IMPORTACAO,
  LIMITE_BODY_JSON_IMPORTACAO_MB,
  LIMITE_BODY_JSON_IMPORTACAO,
  ULTIMA_LINHA_DADOS_TEMPLATE,
  PRIMEIRA_LINHA_DADOS_TEMPLATE,
  mensagemLimiteLinhasExcedido,
  CODIGO_ERRO_LIMITE_LINHAS,
} from '../../../servicos-global/produto/pedido/shared/smart-import-limites.js'
import {
  prepararLinhasFiltradasConfirmacao,
} from '../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'
import { AppError } from '../../../servicos-global/produto/pedido/server/src/errors/AppError.js'

describe('smart-import-limites (SSOT)', () => {
  it('define 1.000 linhas como limite maximo', () => {
    expect(LIMITE_LINHAS_IMPORTACAO).toBe(1000)
  })

  it('define limite de body JSON para confirmar (10mb — paridade com teto de arquivo)', () => {
    expect(LIMITE_BODY_JSON_IMPORTACAO_MB).toBe(10)
    expect(LIMITE_BODY_JSON_IMPORTACAO).toBe('10mb')
  })

  it('template cobre exatamente 1.000 linhas de dados (linhas 3 a 1002)', () => {
    expect(PRIMEIRA_LINHA_DADOS_TEMPLATE).toBe(3)
    expect(ULTIMA_LINHA_DADOS_TEMPLATE).toBe(1002)
    expect(ULTIMA_LINHA_DADOS_TEMPLATE - PRIMEIRA_LINHA_DADOS_TEMPLATE + 1).toBe(1000)
  })

  it('mensagemLimiteLinhasExcedido inclui total e limite', () => {
    const msg = mensagemLimiteLinhasExcedido(1001)
    expect(msg).toContain('1001')
    expect(msg).toContain('1000')
  })
})

describe('prepararLinhasFiltradasConfirmacao — limite de linhas', () => {
  const tenantId = 'org_teste'

  function linha(n: number) {
    return {
      linha_arquivo: n,
      numero_pedido: `PO-${n}`,
      status: 'ok' as const,
      alertas: [],
      dados: { numero_pedido: `PO-${n}` },
    }
  }

  it('aceita exatamente 1.000 linhas incluidas', () => {
    const incluidas = Array.from({ length: 1000 }, (_, i) => i + 1)
    const payload = {
      preview_id: `${tenantId}-abc-123`,
      mapeamento_confirmado: [],
      decisoes_duplicatas: {},
      linhas_incluidas: incluidas,
      salvar_mapeamento: false,
      linhas: incluidas.map(linha),
    }
    const result = prepararLinhasFiltradasConfirmacao(tenantId, payload)
    expect(result).toHaveLength(1000)
  })

  it('rejeita 1.001 linhas com LIMITE_LINHAS_EXCEDIDO', () => {
    const incluidas = Array.from({ length: 1001 }, (_, i) => i + 1)
    const payload = {
      preview_id: `${tenantId}-abc-123`,
      mapeamento_confirmado: [],
      decisoes_duplicatas: {},
      linhas_incluidas: incluidas,
      salvar_mapeamento: false,
      linhas: incluidas.map(linha),
    }
    expect(() => prepararLinhasFiltradasConfirmacao(tenantId, payload)).toThrow(AppError)
    try {
      prepararLinhasFiltradasConfirmacao(tenantId, payload)
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      const appErr = err as AppError
      expect(appErr.code).toBe(CODIGO_ERRO_LIMITE_LINHAS)
      expect(appErr.statusCode).toBe(400)
    }
  })
})
