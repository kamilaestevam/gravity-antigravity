// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExcluirService } from '../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js'

/**
 * Regressão 2026-05-26 — exclusão por blacklist opt-out.
 *
 * Coluna DB `excluir_status_permitidos` guarda status BLOQUEADOS (nome legado).
 * Default [] = todos os status custom permitidos.
 */

const LEGACY_EXCLUIR_WHITELIST = [
  'rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado',
] as const

function normalizarStatusBloqueadosExclusao(raw: string[] | null | undefined): string[] {
  if (!raw || raw.length === 0) return []
  if (
    raw.length === LEGACY_EXCLUIR_WHITELIST.length &&
    LEGACY_EXCLUIR_WHITELIST.every((s) => raw.includes(s))
  ) {
    return []
  }
  return raw
}

function statusBloqueiaExclusao(statusPedido: string, bloqueados: string[]): boolean {
  return bloqueados.includes(statusPedido)
}

function migrarStatusBloqueadosUi(raw: string[] | undefined): string[] {
  if (!raw?.length) return []
  if (
    raw.length === LEGACY_EXCLUIR_WHITELIST.length &&
    LEGACY_EXCLUIR_WHITELIST.every((s) => raw.includes(s))
  ) {
    return []
  }
  return raw
}

const ORG_ID = 'org-excluir-test'

function criarPedidoMock(id: string, status: string) {
  return {
    id_pedido: id,
    numero_pedido: `PED-${id}`,
    status_pedido: status,
    itens_pedido: [{ id_item: `it-${id}` }],
  }
}

function criarDbMock(excluirStatusPermitidos: string[] | null, pedidos: ReturnType<typeof criarPedidoMock>[]) {
  return {
    configuracaoPedido: {
      findFirst: vi.fn().mockResolvedValue({
        excluir_status_permitidos: excluirStatusPermitidos,
        excluir_pedido_sem_item_permitido: true,
      }),
    },
    pedido: {
      findMany: vi.fn().mockResolvedValue(pedidos),
    },
    pedidoTransferencia: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
  }
}

describe('normalizarStatusBloqueadosExclusao — blacklist opt-out', () => {
  it('U-EXB-01: array vazio → todos permitidos', () => {
    expect(normalizarStatusBloqueadosExclusao([])).toEqual([])
  })

  it('U-EXB-02: null/undefined → todos permitidos', () => {
    expect(normalizarStatusBloqueadosExclusao(null)).toEqual([])
    expect(normalizarStatusBloqueadosExclusao(undefined)).toEqual([])
  })

  it('U-EXB-03: whitelist legada (7 canônicos) → migra para []', () => {
    expect(normalizarStatusBloqueadosExclusao([...LEGACY_EXCLUIR_WHITELIST])).toEqual([])
  })

  it('U-EXB-04: blacklist parcial preservada', () => {
    const bloqueados = ['aprovado', 'consolidado']
    expect(normalizarStatusBloqueadosExclusao(bloqueados)).toEqual(bloqueados)
  })

  it('U-EXB-05: status custom na blacklist preservado', () => {
    const bloqueados = ['pagamento_aprovado']
    expect(normalizarStatusBloqueadosExclusao(bloqueados)).toEqual(bloqueados)
  })
})

describe('statusBloqueiaExclusao', () => {
  it('lista vazia nunca bloqueia', () => {
    expect(statusBloqueiaExclusao('pagamento_aprovado', [])).toBe(false)
  })

  it('status na lista bloqueia', () => {
    expect(statusBloqueiaExclusao('aprovado', ['aprovado'])).toBe(true)
  })
})

describe('migrarStatusBloqueadosUi — espelho do Configuracoes.tsx', () => {
  it('whitelist legada na UI → []', () => {
    expect(migrarStatusBloqueadosUi([...LEGACY_EXCLUIR_WHITELIST])).toEqual([])
  })
})

describe('ExcluirService.preview — blacklist via config', () => {
  const service = new ExcluirService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('U-EXS-01: sem blacklist permite status custom pagamento_aprovado', async () => {
    const db = criarDbMock([], [criarPedidoMock('ped-1', 'pagamento_aprovado')])
    const resultado = await service.preview(db, ORG_ID, ['ped-1'])

    expect(resultado.permitidos).toHaveLength(1)
    expect(resultado.bloqueados).toHaveLength(0)
    expect(resultado.permitidos[0].id).toBe('ped-1')
  })

  it('U-EXS-02: status na blacklist vai para bloqueados', async () => {
    const db = criarDbMock(['aprovado'], [criarPedidoMock('ped-2', 'aprovado')])
    const resultado = await service.preview(db, ORG_ID, ['ped-2'])

    expect(resultado.permitidos).toHaveLength(0)
    expect(resultado.bloqueados).toHaveLength(1)
    expect(resultado.bloqueados[0].status).toBe('aprovado')
    expect(resultado.bloqueados[0].motivo).toContain('bloqueado')
  })

  it('U-EXS-03: mix permitido + bloqueado no mesmo preview', async () => {
    const db = criarDbMock(
      ['consolidado'],
      [
        criarPedidoMock('ped-ok', 'pagamento_aprovado'),
        criarPedidoMock('ped-no', 'consolidado'),
      ],
    )
    const resultado = await service.preview(db, ORG_ID, ['ped-ok', 'ped-no'])

    expect(resultado.permitidos.map((p) => p.id)).toEqual(['ped-ok'])
    expect(resultado.bloqueados.map((b) => b.id)).toEqual(['ped-no'])
  })

  it('U-EXS-04: whitelist legada migrada permite qualquer status', async () => {
    const db = criarDbMock(
      [...LEGACY_EXCLUIR_WHITELIST],
      [criarPedidoMock('ped-custom', 'pagamento_aprovado')],
    )
    const resultado = await service.preview(db, ORG_ID, ['ped-custom'])

    expect(resultado.permitidos).toHaveLength(1)
    expect(resultado.bloqueados).toHaveLength(0)
  })
})
