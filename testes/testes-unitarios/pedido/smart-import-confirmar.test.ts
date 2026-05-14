// @vitest-environment node
// TST-UNIT-PEDIDO-SMARTIMPORT-001 — smartImportService.confirmar()
// Cobre: bug de nested $transaction (this.db já é TransactionClient de
// withOrganizacao — chamar $transaction nele crashava com 500).
// Verifica que confirmar() usa this.db diretamente sem abrir transação aninhada.
/// <reference types="vitest/globals" />

// ─── Mocks hoisted ──────────────────────────────────────────────────────────
const { mockRecalcularAgregados } = vi.hoisted(() => ({
  mockRecalcularAgregados: vi.fn().mockResolvedValue(undefined),
}))

// Paths relativos ao arquivo de teste
vi.mock(
  '../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js',
  () => ({ recalcularAgregadosPedido: mockRecalcularAgregados }),
)

vi.mock('../../../servicos-global/produto/pedido/server/src/services/importEngine.js', () => ({
  parseArquivo: vi.fn(),
  ALIASES_CAMPOS: {},
  calcularHashColunas: vi.fn(() => 'hash-test'),
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/services/mapeamentoMemoriaService.js', () => ({
  MapeamentoMemoriaService: vi.fn().mockImplementation(() => ({
    salvar: vi.fn().mockResolvedValue(undefined),
    buscar: vi.fn().mockResolvedValue(null),
  })),
}))

vi.mock('../../../servicos-global/produto/pedido/shared/campos-pedido-ddd.js', () => ({
  CAMPOS_PEDIDO_DDD_TODOS: [],
  normalizarNomeCampo: vi.fn((s: string) => s),
  CAMPO_POR_ROTULO_NORMALIZADO: new Map(),
  CAMPO_POR_NOME_INTERNO: new Map(),
  CAMPO_POR_ALIAS_LEGADO: new Map(),
}))

import { criarSmartImportService } from '../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TENANT_ID = 'org_test_001'
const WORKSPACE_ID = 'ws_test_001'
const PREVIEW_ID = `${TENANT_ID}-hash123-1234567890`

function criarDbMock() {
  const pedidosCriados: Record<string, unknown>[] = []

  const dbMock: Record<string, unknown> = {
    pedidoCasasDecimais: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    statusPedido: {
      findFirst: vi.fn().mockResolvedValue({
        id_pedido_status: 'status_rascunho_001',
      }),
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
    // $transaction NÃO deve existir — simula TransactionClient real
  }
  return { dbMock, pedidosCriados }
}

function payloadBase(linhas: Array<{ linha_arquivo: number; dados: Record<string, unknown> }>) {
  return {
    preview_id: PREVIEW_ID,
    linhas_incluidas: linhas.map(l => l.linha_arquivo),
    linhas: linhas.map(l => ({
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

// ─── Testes ──────────────────────────────────────────────────────────────────
describe('SmartImportService.confirmar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria pedido com item sem chamar $transaction (this.db já é tx de withOrganizacao)', async () => {
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

  it('NÃO tenta chamar $transaction — TransactionClient não tem esse método', async () => {
    const { dbMock } = criarDbMock()
    // Se alguém adicionar $transaction de volta, este mock faz o teste falhar explicitamente
    ;(dbMock as Record<string, unknown>).$transaction = vi.fn(() => {
      throw new Error('$transaction não deveria ser chamado — this.db já é TransactionClient')
    })

    const service = criarSmartImportService(dbMock)
    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-002',
        part_number_item: 'PART-B',
        descricao_item: 'Item B',
        quantidade_inicial_item: 5,
      },
    }])

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)
    expect(resultado.criados).toBe(1)
    expect((dbMock as Record<string, unknown>).$transaction).not.toHaveBeenCalled()
  })

  it('duas linhas com mesmo numero_pedido — segunda adiciona item ao pedido da primeira (append incremental)', async () => {
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
    expect(resultado.erros).toHaveLength(0)
    expect((dbMock.pedido as Record<string, unknown>).create).toHaveBeenCalledTimes(1)
    expect((dbMock.pedidoItem as Record<string, unknown>).create).toHaveBeenCalledTimes(1)
  })

  it('decisao pular — linha é ignorada e contabilizada em pulados', async () => {
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
    expect((dbMock.pedido as Record<string, unknown>).create).not.toHaveBeenCalled()
  })

  it('valor unitário negativo — linha é rejeitada com erro', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)

    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-NEG',
        part_number_item: 'NEG-PART',
        descricao_item: 'Valor negativo',
        quantidade_inicial_item: 1,
        valor_por_unidade_item: -5.50,
      },
    }])

    const resultado = await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)

    expect(resultado.erros).toHaveLength(1)
    expect(resultado.erros[0].motivo).toContain('negativo')
    expect(resultado.criados).toBe(0)
  })

  it('preview_id de outro tenant — lança AppError 403', async () => {
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

  it('recalcularAgregadosPedido recebe this.db (TransactionClient), não tx local', async () => {
    const { dbMock } = criarDbMock()
    const service = criarSmartImportService(dbMock)

    const payload = payloadBase([{
      linha_arquivo: 1,
      dados: {
        numero_pedido: 'PO-AGG',
        part_number_item: 'AGG-PART',
        descricao_item: 'Agregados',
        quantidade_inicial_item: 5,
      },
    }])

    await service.confirmar(TENANT_ID, 'user_001', payload, WORKSPACE_ID)

    expect(mockRecalcularAgregados).toHaveBeenCalledWith(
      dbMock,
      expect.stringContaining('pedi_id_'),
      TENANT_ID,
    )
  })
})
