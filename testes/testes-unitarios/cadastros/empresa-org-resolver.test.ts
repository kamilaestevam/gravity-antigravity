// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Prisma } from '../../../servicos-global/cadastros/generated/index.js'

const mockEmpresaFindUnique = vi.fn()
const mockEmpresaFindFirst = vi.fn()
const mockFornecedorFindFirst = vi.fn()

vi.mock('../../../servicos-global/cadastros/server/src/lib/prisma.js', () => ({
  prisma: {
    empresa: {
      findUnique: (...args: unknown[]) => mockEmpresaFindUnique(...args),
      findFirst: (...args: unknown[]) => mockEmpresaFindFirst(...args),
    },
    fornecedor: {
      findFirst: (...args: unknown[]) => mockFornecedorFindFirst(...args),
    },
  },
}))

import { obterEmpresaDaOrganizacao } from '../../../servicos-global/cadastros/server/src/services/empresa-org.service.js'
import { empresaParaFornecedorCompatDto } from '../../../servicos-global/cadastros/server/src/services/empresa-dto.js'

const ORG = 'org-qa-empresa'

const empresaRow = {
  id_empresa: 'BR-ORG-00001',
  id_organizacao_empresa: ORG,
  nome_empresa: 'Minha Org LTDA',
  cnpj_empresa: '12.345.678/0001-99',
  tin_empresa: null,
  pais_empresa: 'BR',
  estado_provincia_empresa: 'SP',
  cidade_empresa: 'Sao Paulo',
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

describe('obterEmpresaDaOrganizacao — SSOT tabela empresa (volta Empresas)', () => {
  beforeEach(() => {
    vi.stubEnv('CHAVE_INTERNA_SERVICO', 'chave-teste')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('U-EMP-01: retorna empresa quando tabela empresa tem registro 1:1', async () => {
    mockEmpresaFindUnique.mockResolvedValue(empresaRow)

    const result = await obterEmpresaDaOrganizacao(ORG)

    expect(result?.id_empresa).toBe('BR-ORG-00001')
    expect(mockFornecedorFindFirst).not.toHaveBeenCalled()
  })

  it('U-EMP-02: falha na tabela empresa tenta SUID via Configurador → fornecedor', async () => {
    mockEmpresaFindUnique.mockRejectedValue(new Error('relation "empresa" does not exist'))
    mockEmpresaFindFirst.mockResolvedValue(null)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ suid_empresa_organizacao: 'BR-ORG-00001' }),
      }),
    )

    mockFornecedorFindFirst.mockResolvedValue({
      id_fornecedor: 'BR-ORG-00001',
      id_organizacao_cadastro_fornecedor: ORG,
      nome_fornecedor: 'Minha Org LTDA',
      cnpj_fornecedor: '12.345.678/0001-99',
      tin_fornecedor: null,
      pais_fornecedor: 'BR',
      estado_provincia_fornecedor: 'SP',
      cidade_fornecedor: 'Sao Paulo',
      endereco_fornecedor: null,
      cep_zipcode_fornecedor: null,
      email_principal_fornecedor: null,
      telefone_principal_fornecedor: null,
      whatsapp_principal_fornecedor: null,
      pode_ser_importador_fornecedor: true,
      pode_ser_exportador_fornecedor: false,
      pode_ser_fabricante_fornecedor: false,
      pode_ser_agente_fornecedor: false,
      pode_ser_despachante_fornecedor: false,
      pode_ser_armador_fornecedor: false,
      pode_ser_cia_aerea_fornecedor: false,
      pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
      pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
      pode_ser_armazem_alfandegado_fornecedor: false,
      pode_ser_armazem_nacional_fornecedor: false,
      pode_ser_banco_fornecedor: false,
      pode_ser_seguradora_internacional_fornecedor: false,
      pode_ser_seguradora_corretora_cambio_fornecedor: false,
      ativo_fornecedor: true,
      criado_em_fornecedor: new Date('2026-05-01T12:00:00.000Z'),
      atualizado_em_fornecedor: new Date('2026-05-01T12:00:00.000Z'),
    })

    const result = await obterEmpresaDaOrganizacao(ORG)

    expect(result?.id_empresa).toBe('BR-ORG-00001')
    expect(result?.nome_empresa).toBe('Minha Org LTDA')
  })

  it('U-EMP-03: sem empresa e sem SUID retorna null (404 na rota)', async () => {
    mockEmpresaFindUnique.mockResolvedValue(null)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ suid_empresa_organizacao: null }),
      }),
    )

    const result = await obterEmpresaDaOrganizacao(ORG)

    expect(result).toBeNull()
  })

  it('U-EMP-04: dto compat fornecedor preserva id para ModalPedidoNovo', () => {
    const dto = empresaParaFornecedorCompatDto(empresaRow)
    expect(dto.id_fornecedor).toBe('BR-ORG-00001')
    expect(dto.pode_ser_importador_fornecedor).toBe(true)
  })
})

describe('errorHandler — Prisma infra vs negócio', () => {
  it('U-EMP-05: P2002 não deve ser tratado como BANCO_INDISPONIVEL', () => {
    const CODIGOS_PRISMA_INFRA = new Set(['P1000', 'P1001', 'P1008', 'P1017', 'P2021'])
    expect(CODIGOS_PRISMA_INFRA.has('P2002')).toBe(false)
  })

  it('U-EMP-06: P2021 (tabela ausente) é infra', () => {
    const CODIGOS_PRISMA_INFRA = new Set(['P1000', 'P1001', 'P1008', 'P1017', 'P2021'])
    expect(CODIGOS_PRISMA_INFRA.has('P2021')).toBe(true)
  })
})
