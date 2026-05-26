// @vitest-environment node
// TST-UNIT-PEDIDO-IMPORTAR-PLANILHA — SmartImportService.confirmar (U-CNF)
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRecalcularAgregados } = vi.hoisted(() => ({
  mockRecalcularAgregados: vi.fn().mockResolvedValue(undefined),
}))

vi.mock(
  '../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js',
  () => ({ recalcularAgregadosPedido: mockRecalcularAgregados }),
)

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/importEngine.js', () => ({
  parseArquivo: vi.fn(),
  ALIASES_CAMPOS: {},
  calcularHashColunas: vi.fn(() => 'hash-test'),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/mapeamentoMemoriaService.js', () => ({
  MapeamentoMemoriaService: vi.fn().mockImplementation(() => ({
    salvar: vi.fn().mockResolvedValue(undefined),
    buscar: vi.fn().mockResolvedValue(null),
  })),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd.js', () => ({
  CAMPOS_PEDIDO_DDD_TODOS: [],
  normalizarNomeCampo: vi.fn((s: string) => s),
  CAMPO_POR_ROTULO_NORMALIZADO: new Map(),
  CAMPO_POR_NOME_INTERNO: new Map(),
  CAMPO_POR_ALIAS_LEGADO: new Map(),
}))

import { criarSmartImportService } from '../../../../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'
import type { ParceirosResolvidosPedido } from '../../../../../../servicos-global/produto/pedido/server/src/services/smartImportParceirosService.js'

const TENANT_ID = 'org_test_001'
const WORKSPACE_ID = 'ws_test_001'
const PREVIEW_ID = `${TENANT_ID}-hash123-1234567890`

function criarDbMock() {
  const pedidosCriados: Record<string, unknown>[] = []

  const dbMock: Record<string, unknown> = {
    pedidoCasasDecimais: { findUnique: vi.fn().mockResolvedValue(null) },
    statusPedido: {
      findFirst: vi.fn().mockResolvedValue({ id_pedido_status: 'status_rascunho_001' }),
    },
    pedido: {
      findFirst: vi.fn().mockImplementation((args: { where?: { numero_pedido?: string } }) => {
        const found = pedidosCriados.find(
          (p: Record<string, unknown>) => p.numero_pedido === args.where?.numero_pedido,
        )
        return Promise.resolve(found ? { id_pedido: found.id_pedido } : null)
      }),
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
        pedidosCriados.push(args.data)
        return Promise.resolve({ id_pedido: args.data.id_pedido })
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    pedidoItem: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({}),
    },
    pedidoSnapshotEmpresa: {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
  }
  return { dbMock, pedidosCriados }
}

function payloadBase(linhas: Array<{ linha_arquivo: number; dados: Record<string, unknown> }>) {
  return {
    preview_id: PREVIEW_ID,
    linhas_incluidas: linhas.map((l) => l.linha_arquivo),
    linhas: linhas.map((l) => ({
      linha_arquivo: l.linha_arquivo,
      numero_pedido: (l.dados.numero_pedido as string) ?? null,
      status: 'ok' as const,
      alertas: [],
      dados: l.dados,
    })),
    decisoes_duplicatas: {} as Record<string, string>,
    numeros_editados: {} as Record<number, string>,
    mapeamento_confirmado: [],
    salvar_mapeamento: false,
  }
}

describe('SmartImportService.confirmar (U-CNF)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('U-CNF-01: cria pedido com item sem chamar $transaction aninhada', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-001',
        part_number_item: 'PART-A',
        descricao_item: 'Item de teste',
        quantidade_inicial_item: 10,
        moeda_pedido: 'USD',
      },
    }])

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)

    expect(resultado.criados).toBe(1)
    expect(resultado.erros).toHaveLength(0)
    expect((dbMock.pedido as Record<string, unknown>).create).toHaveBeenCalledTimes(1)
    expect(mockRecalcularAgregados).toHaveBeenCalledTimes(1)
  })

  it('U-CNF-02: duas linhas mesmo PO — segunda adiciona item incremental', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([
      {
        linha_arquivo: 1,
        dados: {
          numero_pedido: 'PO-DUP',
          part_number_item: 'PART-1',
          descricao_item: 'Primeiro item',
          quantidade_inicial_item: 10,
        },
      },
      {
        linha_arquivo: 2,
        dados: {
          numero_pedido: 'PO-DUP',
          part_number_item: 'PART-2',
          descricao_item: 'Segundo item',
          quantidade_inicial_item: 20,
        },
      },
    ])

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)

    expect(resultado.criados).toBe(1)
    expect(resultado.atualizados).toBe(1)
    expect((dbMock.pedido as Record<string, unknown>).create).toHaveBeenCalledTimes(1)
    expect((dbMock.pedidoItem as Record<string, unknown>).create).toHaveBeenCalledTimes(1)
  })

  it('U-CNF-03: decisao pular ignora linha', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-SKIP',
        part_number_item: 'SKIP-PART',
        descricao_item: 'Item pulado',
        quantidade_inicial_item: 1,
      },
    }])
    payload.decisoes_duplicatas = { 'PO-SKIP': 'pular' }

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)
    expect(resultado.pulados).toBe(1)
    expect(resultado.criados).toBe(0)
  })

  it('U-CNF-04: valor unitário negativo rejeita linha', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-NEG',
        part_number_item: 'NEG-PART',
        descricao_item: 'Valor negativo',
        quantidade_inicial_item: 1,
        valor_por_unidade_item: -5.5,
      },
    }])

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)
    expect(resultado.erros).toHaveLength(1)
    expect(resultado.erros[0].motivo).toContain('negativo')
  })

  it('U-CNF-05: preview_id de outro tenant lança erro 403', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: { numero_pedido: 'PO-X', part_number_item: 'X', descricao_item: 'X', quantidade_inicial_item: 1 },
    }])
    payload.preview_id = 'org_OUTRO-hash-123'

    await expect(
      service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID),
    ).rejects.toThrow('Preview nao pertence a este tenant')
  })

  it('U-CNF-06: parceirosPorNumero aplica FK exportador e snapshots no create', async () => {
    const { dbMock, pedidosCriados } = criarDbMock()
    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'D-1382',
        part_number_item: 'PART-A',
        descricao_item: 'Item Detroit',
        quantidade_inicial_item: 1,
        nome_fabricante: 'KONGSBERG',
      },
    }])

    const parceiros = new Map<string, ParceirosResolvidosPedido>([
      ['D-1382', {
        tipo_operacao: 'importacao',
        suid_importador: 'suid_imp',
        suid_exportador: 'suid_exp',
        suid_fabricante: 'suid_fab',
        snapshots: [{
          id_organizacao: TENANT_ID,
          id_workspace: WORKSPACE_ID,
          papel: 'exportador',
          suid_empresa: 'suid_exp',
          nome_empresa: 'DETROIT USA INTERNATIONAL LLC',
          documento_principal: null,
          tipo_documento: null,
          cnpj_raiz: null,
          endereco_cidade: null,
          endereco_uf: null,
          endereco_cep: null,
          endereco_pais: 'US',
          endereco_logradouro: null,
          contato_email: null,
          contato_whatsapp: null,
          motivo_congelamento: 'emissao',
        }],
        nomesItem: {
          nome_exportador_item: 'DETROIT USA INTERNATIONAL LLC',
          nome_importador_item: null,
          nome_fabricante_item: null,
        },
      }],
    ])

    await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID, parceiros)

    expect(pedidosCriados).toHaveLength(1)
    const criado = pedidosCriados[0]
    expect(criado.id_importacao_exportador_pedido).toBe('suid_exp')
    expect(criado.id_fabricante_pedido).toBe('suid_fab')
    expect(criado.snapshots_empresa_pedido).toBeDefined()
  })
})
