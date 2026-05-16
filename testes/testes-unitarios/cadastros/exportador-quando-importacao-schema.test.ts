/**
 * Testes unitários — Schema Zod ExportadorQuandoImportacao
 *
 * Verifica contratos bilaterais (Mandamento 09):
 * - Criação: campos obrigatórios, validação ISO-2, rejeição inválidos
 * - Atualização: campos opcionais, validação quando presentes
 * - Resposta: shape completo
 */
import { describe, it, expect } from 'vitest'
import {
  criarExportadorQuandoImportacaoSchema,
  atualizarExportadorQuandoImportacaoSchema,
  exportadorQuandoImportacaoSchema,
} from '../../../servicos-global/cadastros/shared/schemas/exportador-quando-importacao.schema'

describe('criarExportadorQuandoImportacaoSchema', () => {
  const payloadValido = {
    id_organizacao: 'org_abc123',
    id_workspace: 'ws_def456',
    nome_exportador: 'Acme International Ltd',
    pais_exportador: 'US',
  }

  it('aceita payload válido com campos mínimos obrigatórios', () => {
    const resultado = criarExportadorQuandoImportacaoSchema.parse(payloadValido)
    expect(resultado.id_organizacao).toBe('org_abc123')
    expect(resultado.id_workspace).toBe('ws_def456')
    expect(resultado.nome_exportador).toBe('Acme International Ltd')
    expect(resultado.pais_exportador).toBe('US')
  })

  it('aceita payload completo com todos os campos opcionais', () => {
    const completo = {
      ...payloadValido,
      endereco_exportador: '123 Main St',
      cidade_exportador: 'New York',
      estado_provincia_exportador: 'NY',
      zipcode_exportador: '10001',
    }
    const resultado = criarExportadorQuandoImportacaoSchema.parse(completo)
    expect(resultado.endereco_exportador).toBe('123 Main St')
    expect(resultado.cidade_exportador).toBe('New York')
  })

  it('aceita campos opcionais como null', () => {
    const comNulls = {
      ...payloadValido,
      endereco_exportador: null,
      cidade_exportador: null,
      estado_provincia_exportador: null,
      zipcode_exportador: null,
    }
    const resultado = criarExportadorQuandoImportacaoSchema.parse(comNulls)
    expect(resultado.endereco_exportador).toBeNull()
  })

  it('rejeita id_organizacao vazio', () => {
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, id_organizacao: '' })
    ).toThrow()
  })

  it('rejeita id_workspace vazio', () => {
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, id_workspace: '' })
    ).toThrow()
  })

  it('rejeita nome_exportador com menos de 2 caracteres', () => {
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, nome_exportador: 'A' })
    ).toThrow()
  })

  it('rejeita pais_exportador fora do formato ISO-2', () => {
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, pais_exportador: 'usa' })
    ).toThrow()
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, pais_exportador: 'USA' })
    ).toThrow()
    expect(() =>
      criarExportadorQuandoImportacaoSchema.parse({ ...payloadValido, pais_exportador: '12' })
    ).toThrow()
  })

  it('rejeita payload sem id_organizacao', () => {
    const { id_organizacao: _, ...semOrg } = payloadValido
    expect(() => criarExportadorQuandoImportacaoSchema.parse(semOrg)).toThrow()
  })

  it('rejeita payload sem pais_exportador', () => {
    const { pais_exportador: _, ...semPais } = payloadValido
    expect(() => criarExportadorQuandoImportacaoSchema.parse(semPais)).toThrow()
  })
})

describe('atualizarExportadorQuandoImportacaoSchema', () => {
  it('aceita payload vazio (nenhum campo atualizado)', () => {
    const resultado = atualizarExportadorQuandoImportacaoSchema.parse({})
    expect(resultado).toEqual({})
  })

  it('aceita atualização parcial de nome', () => {
    const resultado = atualizarExportadorQuandoImportacaoSchema.parse({
      nome_exportador: 'Novo Nome Corp',
    })
    expect(resultado.nome_exportador).toBe('Novo Nome Corp')
  })

  it('rejeita nome_exportador com menos de 2 caracteres quando presente', () => {
    expect(() =>
      atualizarExportadorQuandoImportacaoSchema.parse({ nome_exportador: 'X' })
    ).toThrow()
  })

  it('rejeita pais_exportador inválido quando presente', () => {
    expect(() =>
      atualizarExportadorQuandoImportacaoSchema.parse({ pais_exportador: 'abc' })
    ).toThrow()
  })

  it('aceita pais_exportador válido quando presente', () => {
    const resultado = atualizarExportadorQuandoImportacaoSchema.parse({ pais_exportador: 'CN' })
    expect(resultado.pais_exportador).toBe('CN')
  })
})

describe('exportadorQuandoImportacaoSchema (resposta)', () => {
  const respostaValida = {
    id_exportador_quando_importacao: 'cuid_abc123',
    id_organizacao: 'org_xyz',
    id_workspace: 'ws_123',
    nome_exportador: 'Test Supplier',
    endereco_exportador: null,
    cidade_exportador: null,
    estado_provincia_exportador: null,
    pais_exportador: 'DE',
    zipcode_exportador: null,
    criado_em_exportador: '2026-05-16T14:00:00.000Z',
    atualizado_em_exportador: '2026-05-16T14:00:00.000Z',
  }

  it('valida resposta completa do backend', () => {
    const resultado = exportadorQuandoImportacaoSchema.parse(respostaValida)
    expect(resultado.id_exportador_quando_importacao).toBe('cuid_abc123')
    expect(resultado.pais_exportador).toBe('DE')
  })

  it('rejeita resposta sem id_exportador_quando_importacao', () => {
    const { id_exportador_quando_importacao: _, ...semId } = respostaValida
    expect(() => exportadorQuandoImportacaoSchema.parse(semId)).toThrow()
  })
})
