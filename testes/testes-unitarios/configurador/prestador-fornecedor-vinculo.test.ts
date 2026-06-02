// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flagsCadastroPorTipoFornecedorOrganizacao } from '../../../servicos-global/configurador/shared/tipo-fornecedor-organizacao.js'

const {
  mockObterFornecedorPorIdNaOrganizacao,
  mockListarVinculosFornecedorPorUsuario,
  mockCriarVinculoFornecedorOrganizacao,
  mockOrganizacaoFindFirst,
} = vi.hoisted(() => ({
  mockObterFornecedorPorIdNaOrganizacao: vi.fn(),
  mockListarVinculosFornecedorPorUsuario: vi.fn(),
  mockCriarVinculoFornecedorOrganizacao: vi.fn(),
  mockOrganizacaoFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: { findFirst: mockOrganizacaoFindFirst },
  },
}))

vi.mock('../../../servicos-global/configurador/server/services/cadastros-client.js', () => ({
  obterFornecedorPorIdNaOrganizacao: mockObterFornecedorPorIdNaOrganizacao,
  listarVinculosFornecedorPorUsuario: mockListarVinculosFornecedorPorUsuario,
  listarVinculosFornecedorOrganizacaoPorOrganizacao: vi.fn().mockResolvedValue([]),
  criarVinculoFornecedorOrganizacao: mockCriarVinculoFornecedorOrganizacao,
  buscarFornecedorPorEmailNaOrganizacao: vi.fn(),
  criarFornecedor: vi.fn(),
}))

import {
  exigirVinculosCadastrosFornecedorAtivos,
  provisionarPrestadorFornecedor,
} from '../../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js'

const ORG_CLIENTE = 'org_cliente_01'
const ORG_GRAVITY = 'org_gravity_01'
const ID_FORNECEDOR = 'BR-TRANSDATA-00007'
const ID_USUARIO = 'usr_forn_01'

function fornecedorAgenteAtivo() {
  return {
    id_fornecedor: ID_FORNECEDOR,
    nome_fornecedor: 'Transdata',
    ativo_fornecedor: true,
    ...flagsCadastroPorTipoFornecedorOrganizacao('AGENTE_CARGA'),
  }
}

describe('provisionarPrestadorFornecedor — convite com id_fornecedor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ID_ORGANIZACAO_GRAVITY = ORG_GRAVITY
    mockListarVinculosFornecedorPorUsuario.mockResolvedValue([])
    mockCriarVinculoFornecedorOrganizacao.mockResolvedValue(undefined)
  })

  afterEach(() => {
    delete process.env.ID_ORGANIZACAO_GRAVITY
  })

  it('404 quando fornecedor não existe no cartório da org cliente', async () => {
    mockObterFornecedorPorIdNaOrganizacao.mockResolvedValue(null)

    await expect(
      provisionarPrestadorFornecedor({
        id_usuario: ID_USUARIO,
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente',
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        id_organizacao_cliente: ORG_CLIENTE,
        id_fornecedor: ID_FORNECEDOR,
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'FORNECEDOR_NAO_ENCONTRADO' })

    expect(mockCriarVinculoFornecedorOrganizacao).not.toHaveBeenCalled()
  })

  it('400 quando fornecedor está inativo', async () => {
    mockObterFornecedorPorIdNaOrganizacao.mockResolvedValue({
      ...fornecedorAgenteAtivo(),
      ativo_fornecedor: false,
    })

    await expect(
      provisionarPrestadorFornecedor({
        id_usuario: ID_USUARIO,
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente',
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        id_organizacao_cliente: ORG_CLIENTE,
        id_fornecedor: ID_FORNECEDOR,
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'FORNECEDOR_INATIVO' })
  })

  it('400 quando categoria COMEX não bate com flags do fornecedor', async () => {
    mockObterFornecedorPorIdNaOrganizacao.mockResolvedValue(fornecedorAgenteAtivo())

    await expect(
      provisionarPrestadorFornecedor({
        id_usuario: ID_USUARIO,
        email_usuario: 'armador@frete.com',
        nome_usuario: 'Armador',
        tipo_fornecedor_organizacao: 'ARMADOR',
        id_organizacao_cliente: ORG_CLIENTE,
        id_fornecedor: ID_FORNECEDOR,
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'FORNECEDOR_CATEGORIA_INCOMPATIVEL' })
  })

  it('cria vínculo apenas na org cliente quando id_fornecedor informado', async () => {
    mockObterFornecedorPorIdNaOrganizacao.mockResolvedValue(fornecedorAgenteAtivo())

    const result = await provisionarPrestadorFornecedor({
      id_usuario: ID_USUARIO,
      email_usuario: 'agente@frete.com',
      nome_usuario: 'Agente',
      tipo_fornecedor_organizacao: 'AGENTE_CARGA',
      id_organizacao_cliente: ORG_CLIENTE,
      id_fornecedor: ID_FORNECEDOR,
    })

    expect(result.id_fornecedor).toBe(ID_FORNECEDOR)
    expect(result.vinculos_criados).toEqual([ORG_CLIENTE])
    expect(mockCriarVinculoFornecedorOrganizacao).toHaveBeenCalledTimes(1)
    expect(mockCriarVinculoFornecedorOrganizacao).toHaveBeenCalledWith(
      expect.objectContaining({
        id_fornecedor: ID_FORNECEDOR,
        id_organizacao: ORG_CLIENTE,
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        id_usuario: ID_USUARIO,
      }),
      expect.objectContaining({ id_organizacao: ORG_CLIENTE }),
    )
  })

  it('400 quando id_fornecedor sem id_organizacao_cliente', async () => {
    await expect(
      provisionarPrestadorFornecedor({
        id_usuario: ID_USUARIO,
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente',
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        id_fornecedor: ID_FORNECEDOR,
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'ORG_CLIENTE_AUSENTE' })
  })
})

describe('exigirVinculosCadastrosFornecedorAtivos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('422 FORNECEDOR_NAO_PROVISIONADO quando não há vínculo ATIVO na org', async () => {
    mockListarVinculosFornecedorPorUsuario.mockResolvedValue([])

    await expect(
      exigirVinculosCadastrosFornecedorAtivos({
        id_usuario: ID_USUARIO,
        id_organizacao: ORG_CLIENTE,
      }),
    ).rejects.toMatchObject({ statusCode: 422, code: 'FORNECEDOR_NAO_PROVISIONADO' })
  })

  it('422 quando vínculo existe mas status não é ATIVO', async () => {
    mockListarVinculosFornecedorPorUsuario.mockResolvedValue([
      {
        id_fornecedor: ID_FORNECEDOR,
        id_organizacao: ORG_CLIENTE,
        status_fornecedor_organizacao: 'INATIVO',
      },
    ])

    await expect(
      exigirVinculosCadastrosFornecedorAtivos({
        id_usuario: ID_USUARIO,
        id_organizacao: ORG_CLIENTE,
      }),
    ).rejects.toMatchObject({ statusCode: 422, code: 'FORNECEDOR_NAO_PROVISIONADO' })
  })

  it('retorna vínculos ATIVO da org alvo', async () => {
    mockListarVinculosFornecedorPorUsuario.mockResolvedValue([
      {
        id_fornecedor: ID_FORNECEDOR,
        id_organizacao: ORG_CLIENTE,
        status_fornecedor_organizacao: 'ATIVO',
      },
      {
        id_fornecedor: 'BR-OUTRO-001',
        id_organizacao: ORG_GRAVITY,
        status_fornecedor_organizacao: 'ATIVO',
      },
    ])

    const vinculos = await exigirVinculosCadastrosFornecedorAtivos({
      id_usuario: ID_USUARIO,
      id_organizacao: ORG_CLIENTE,
    })

    expect(vinculos).toEqual([
      { id_fornecedor: ID_FORNECEDOR, id_organizacao: ORG_CLIENTE },
    ])
  })
})
