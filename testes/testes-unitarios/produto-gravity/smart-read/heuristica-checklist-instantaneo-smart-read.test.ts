import { describe, expect, it } from 'vitest'
import {
  avaliarSimilaridadeHeuristicaChecklist,
  montarEnderecoOficialCnpj,
  normalizarTextoHeuristicaChecklist,
  similaridadeTextoHeuristicaChecklist,
} from '../../../../servicos-global/produto/smart-read/shared/heuristica-checklist-instantaneo-smart-read.ts'

describe('heuristica-checklist-instantaneo-smart-read', () => {
  it('normaliza abreviações e acentos', () => {
    expect(normalizarTextoHeuristicaChecklist('Intelbras S/A')).toBe('intelbras sociedade anonima')
  })

  it('calcula similaridade alta para razões sociais equivalentes', () => {
    const score = similaridadeTextoHeuristicaChecklist('Intelbras S.A.', 'INTELBRAS SA')
    expect(score).toBeGreaterThanOrEqual(0.72)
  })

  it('marca conforme quando similaridade atinge limiar', () => {
    const resultado = avaliarSimilaridadeHeuristicaChecklist('Intelbras S/A', 'Intelbras Sociedade Anonima')
    expect(resultado.conforme).toBe(true)
    expect(resultado.rotulo).toBe('conforme')
  })

  it('monta endereço oficial a partir dos campos CNPJ', () => {
    const endereco = montarEnderecoOficialCnpj({
      cnpj: '82901000000127',
      razao_social: 'Intelbras',
      nome_fantasia: null,
      situacao_cadastral: 'ATIVA',
      ativo: true,
      logradouro: 'Rua das Flores',
      numero: '10',
      complemento: null,
      bairro: 'Centro',
      municipio: 'São José',
      uf: 'SC',
      cep: '88101000',
      fonte: 'brasilapi_rfb',
    })
    expect(endereco).toContain('Rua das Flores')
    expect(endereco).toContain('São José')
  })
})
