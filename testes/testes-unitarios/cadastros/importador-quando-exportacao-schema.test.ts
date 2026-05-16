/**
 * Testes unitários — Schema Zod ImportadorQuandoExportacao
 *
 * Verifica contratos bilaterais (Mandamento 09):
 * - Criação: campos obrigatórios, validação ISO-2, rejeição inválidos
 * - Atualização: campos opcionais, validação quando presentes
 * - Resposta: shape completo
 */
import { describe, it, expect } from 'vitest'
import {
  criarImportadorQuandoExportacaoSchema,
  atualizarImportadorQuandoExportacaoSchema,
  importadorQuandoExportacaoSchema,
} from '../../../servicos-global/cadastros/shared/schemas/importador-quando-exportacao.schema'

describe('criarImportadorQuandoExportacaoSchema', () => {
  const payloadValido = {
    id_organizacao: 'org_abc123',
    id_workspace: 'ws_def456',
    nome_importador: 'GlobalBuy Trading Co',
    pais_importador: 'CN',
  }

  it('aceita payload válido com campos mínimos obrigatórios', () => {
    const resultado = criarImportadorQuandoExportacaoSchema.parse(payloadValido)
    expect(resultado.id_organizacao).toBe('org_abc123')
    expect(resultado.id_workspace).toBe('ws_def456')
    expect(resultado.nome_importador).toBe('GlobalBuy Trading Co')
    expect(resultado.pais_importador).toBe('CN')
  })

  it('aceita payload completo com todos os campos opcionais', () => {
    const completo = {
      ...payloadValido,
      endereco_importador: '456 Market St',
      cidade_importador: 'Shanghai',
      estado_provincia_importador: 'SH',
      zipcode_importador: '200001',
    }
    const resultado = criarImportadorQuandoExportacaoSchema.parse(completo)
    expect(resultado.endereco_importador).toBe('456 Market St')
    expect(resultado.cidade_importador).toBe('Shanghai')
  })

  it('aceita campos opcionais como null', () => {
    const comNulls = {
      ...payloadValido,
      endereco_importador: null,
      cidade_importador: null,
      estado_provincia_importador: null,
      zipcode_importador: null,
    }
    const resultado = criarImportadorQuandoExportacaoSchema.parse(comNulls)
    expect(resultado.endereco_importador).toBeNull()
  })

  it('rejeita id_organizacao vazio', () => {
    expect(() =>
      criarImportadorQuandoExportacaoSchema.parse({ ...payloadValido, id_organizacao: '' })
    ).toThrow()
  })

  it('rejeita id_workspace vazio', () => {
    expect(() =>
      criarImportadorQuandoExportacaoSchema.parse({ ...payloadValido, id_workspace: '' })
    ).toThrow()
  })

  it('rejeita nome_importador com menos de 2 caracteres', () => {
    expect(() =>
      criarImportadorQuandoExportacaoSchema.parse({ ...payloadValido, nome_importador: 'B' })
    ).toThrow()
  })

  it('rejeita pais_importador fora do formato ISO-2', () => {
    expect(() =>
      criarImportadorQuandoExportacaoSchema.parse({ ...payloadValido, pais_importador: 'chn' })
    ).toThrow()
    expect(() =>
      criarImportadorQuandoExportacaoSchema.parse({ ...payloadValido, pais_importador: 'CHN' })
    ).toThrow()
  })

  it('rejeita payload sem id_organizacao', () => {
    const { id_organizacao: _, ...semOrg } = payloadValido
    expect(() => criarImportadorQuandoExportacaoSchema.parse(semOrg)).toThrow()
  })

  it('rejeita payload sem pais_importador', () => {
    const { pais_importador: _, ...semPais } = payloadValido
    expect(() => criarImportadorQuandoExportacaoSchema.parse(semPais)).toThrow()
  })
})

describe('atualizarImportadorQuandoExportacaoSchema', () => {
  it('aceita payload vazio (nenhum campo atualizado)', () => {
    const resultado = atualizarImportadorQuandoExportacaoSchema.parse({})
    expect(resultado).toEqual({})
  })

  it('aceita atualização parcial de nome', () => {
    const resultado = atualizarImportadorQuandoExportacaoSchema.parse({
      nome_importador: 'New Buyer Inc',
    })
    expect(resultado.nome_importador).toBe('New Buyer Inc')
  })

  it('rejeita nome_importador com menos de 2 caracteres quando presente', () => {
    expect(() =>
      atualizarImportadorQuandoExportacaoSchema.parse({ nome_importador: 'Y' })
    ).toThrow()
  })

  it('rejeita pais_importador inválido quando presente', () => {
    expect(() =>
      atualizarImportadorQuandoExportacaoSchema.parse({ pais_importador: '123' })
    ).toThrow()
  })

  it('aceita pais_importador válido quando presente', () => {
    const resultado = atualizarImportadorQuandoExportacaoSchema.parse({ pais_importador: 'JP' })
    expect(resultado.pais_importador).toBe('JP')
  })
})

describe('importadorQuandoExportacaoSchema (resposta)', () => {
  const respostaValida = {
    id_importador_quando_exportacao: 'cuid_xyz789',
    id_organizacao: 'org_xyz',
    id_workspace: 'ws_456',
    nome_importador: 'Test Buyer Corp',
    endereco_importador: null,
    cidade_importador: null,
    estado_provincia_importador: null,
    pais_importador: 'JP',
    zipcode_importador: null,
    criado_em_importador: '2026-05-16T14:00:00.000Z',
    atualizado_em_importador: '2026-05-16T14:00:00.000Z',
  }

  it('valida resposta completa do backend', () => {
    const resultado = importadorQuandoExportacaoSchema.parse(respostaValida)
    expect(resultado.id_importador_quando_exportacao).toBe('cuid_xyz789')
    expect(resultado.pais_importador).toBe('JP')
  })

  it('rejeita resposta sem id_importador_quando_exportacao', () => {
    const { id_importador_quando_exportacao: _, ...semId } = respostaValida
    expect(() => importadorQuandoExportacaoSchema.parse(semId)).toThrow()
  })
})
