// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { empresaParaFornecedorCompatDto } from '../../../servicos-global/cadastros/server/src/services/empresa-dto.js'

const ROOT = resolve(import.meta.dirname, '../../..')

function ler(caminho: string): string {
  return readFileSync(resolve(ROOT, caminho), 'utf-8')
}

describe('empresaParaFornecedorCompatDto', () => {
  const empresaPrisma = {
    id_empresa: 'BR-DETROIT-00001',
    id_organizacao_empresa: 'org_abc',
    nome_empresa: 'Detroit Brasil TESTE PROD',
    cnpj_empresa: '12.345.678/0001-90',
    tin_empresa: null,
    pais_empresa: 'BR',
    estado_provincia_empresa: null,
    cidade_empresa: null,
    endereco_empresa: null,
    cep_zipcode_empresa: null,
    email_principal_empresa: null,
    telefone_principal_empresa: null,
    whatsapp_principal_empresa: null,
    pode_ser_importador_empresa: true,
    pode_ser_exportador_empresa: false,
    pode_ser_fabricante_empresa: false,
    pode_ser_agente_empresa: false,
    pode_ser_despachante_empresa: false,
    pode_ser_armador_empresa: false,
    pode_ser_cia_aerea_empresa: false,
    pode_ser_transportadora_rodoviaria_nacional_empresa: false,
    pode_ser_transportadora_rodoviaria_internacional_empresa: false,
    pode_ser_armazem_alfandegado_empresa: false,
    pode_ser_armazem_nacional_empresa: false,
    pode_ser_banco_empresa: false,
    pode_ser_seguradora_internacional_empresa: false,
    pode_ser_seguradora_corretora_cambio_empresa: false,
    ativo_empresa: true,
    criado_em_empresa: new Date('2026-05-01T12:00:00.000Z'),
    atualizado_em_empresa: new Date('2026-05-01T12:00:00.000Z'),
  }

  it('mapeia id_empresa → id_fornecedor para compat Pedido', () => {
    const dto = empresaParaFornecedorCompatDto(empresaPrisma)
    expect(dto.id_fornecedor).toBe('BR-DETROIT-00001')
    expect(dto.nome_fornecedor).toBe('Detroit Brasil TESTE PROD')
    expect(dto.pode_ser_importador_fornecedor).toBe(true)
    expect(dto.id_organizacao).toBe('org_abc')
  })
})

describe('EmpresasEParceiros — escopo parceiros', () => {
  it('deve listar fornecedores com escopo=parceiros (exclui espelho da org)', () => {
    const conteudo = ler('servicos-global/configurador/src/pages/configurador/EmpresasEParceiros.tsx')
    expect(conteudo).toContain('escopo=parceiros')
  })
})

describe('cadastros-client — rotas empresa vs fornecedor', () => {
  it('onboarding usa POST /empresas', () => {
    const conteudo = ler('servicos-global/configurador/server/services/cadastros-client.ts')
    expect(conteudo).toContain('/empresas')
    expect(conteudo).toMatch(/criarEmpresa\(/)
    expect(conteudo).toMatch(/compensarEmpresa\(/)
  })
})
