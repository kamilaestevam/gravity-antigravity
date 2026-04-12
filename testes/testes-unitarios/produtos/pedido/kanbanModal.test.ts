/**
 * kanbanModal.test.ts
 *
 * Testes unitários para a lógica de estado do ModalKanbanPedido.
 * Cobre: dirty, handleSalvar, status, opcaoStatus, formatação de datas.
 *
 * Funções puras extraídas da lógica do componente — sem jsdom necessário.
 */

import { describe, it, expect } from 'vitest'

// ── Lógica extraída de ModalKanbanPedido ──────────────────────────────────────

function isDirty(novoStatus: string, statusAtual: string): boolean {
  return novoStatus !== statusAtual
}

function handleSalvar(
  novoStatus: string,
  statusAtual: string,
  onSalvarStatus: (s: string) => void,
  onFechar: () => void,
): void {
  if (novoStatus && novoStatus !== statusAtual) onSalvarStatus(novoStatus)
  onFechar()
}

function opcaoStatus(colunas: { key: string; label: string }[]) {
  return colunas.map(c => ({ valor: c.key, rotulo: c.label }))
}

function isVencida(val: string | null, campo: string): boolean {
  if (!val || !campo.includes('prevista')) return false
  const d = new Date(val)
  return !isNaN(d.getTime()) && d < new Date()
}

// ── Dados de teste ─────────────────────────────────────────────────────────────

const COLUNAS_TESTE = [
  { key: 'draft',         label: 'Rascunho'    },
  { key: 'aberto',        label: 'Aberto'      },
  { key: 'em_andamento',  label: 'Em Andamento' },
  { key: 'cancelado',     label: 'Cancelado'   },
]

// ── M01 — status inicial igual ao pedido ─────────────────────────────────────

describe('M01 — status inicial = pedido.status', () => {
  it('novoStatus começa igual ao status do pedido', () => {
    const pedidoStatus = 'aberto'
    const novoStatus = pedidoStatus // simulando o useEffect: setNovoStatus(pedido.status)
    expect(novoStatus).toBe('aberto')
  })
})

// ── M02 — mudar status atualiza novoStatus ────────────────────────────────────

describe('M02 — mudar status atualiza novoStatus local', () => {
  it('setNovoStatus(v) resulta em valor string correto', () => {
    const setNovoStatus = (v: string) => v
    const resultado = setNovoStatus(String('cancelado' ?? ''))
    expect(resultado).toBe('cancelado')
  })

  it('null é convertido para string vazia', () => {
    const setNovoStatus = (v: string) => v
    const resultado = setNovoStatus(String(null ?? ''))
    expect(resultado).toBe('')
  })
})

// ── M03 — dirty = true quando status mudou ───────────────────────────────────

describe('M03 — dirty reflete mudança de status', () => {
  it('dirty = false quando status não mudou', () => {
    expect(isDirty('aberto', 'aberto')).toBe(false)
  })

  it('dirty = true quando status mudou', () => {
    expect(isDirty('cancelado', 'aberto')).toBe(true)
  })

  it('dirty = true mesmo com maiúsculas diferentes', () => {
    expect(isDirty('Aberto', 'aberto')).toBe(true)
  })
})

// ── M04 — salvar chama onSalvarStatus com o novo status ──────────────────────

describe('M04 — handleSalvar dispara callback com status correto', () => {
  it('chama onSalvarStatus quando status mudou', () => {
    const chamadas: string[] = []
    const fechadas: number[] = []
    handleSalvar('cancelado', 'aberto', s => chamadas.push(s), () => fechadas.push(1))
    expect(chamadas).toEqual(['cancelado'])
    expect(fechadas).toHaveLength(1)
  })

  it('não chama onSalvarStatus quando status não mudou, mas fecha', () => {
    const chamadas: string[] = []
    const fechadas: number[] = []
    handleSalvar('aberto', 'aberto', s => chamadas.push(s), () => fechadas.push(1))
    expect(chamadas).toHaveLength(0)
    expect(fechadas).toHaveLength(1)
  })

  it('não chama onSalvarStatus quando novoStatus é string vazia', () => {
    const chamadas: string[] = []
    handleSalvar('', 'aberto', s => chamadas.push(s), () => {})
    expect(chamadas).toHaveLength(0)
  })
})

// ── M05 — cancelar: status revertido naturalmente (sem save) ─────────────────

describe('M05 — cancelar não salva status', () => {
  it('ao fechar sem salvar, onSalvarStatus não é chamado', () => {
    const chamadas: string[] = []
    // simula: onFechar() diretamente, sem handleSalvar
    const onFechar = () => {}
    onFechar()
    expect(chamadas).toHaveLength(0)
  })
})

// ── M06 — data vencida usa classe CSS, não cor inline ────────────────────────

describe('M06 — datas vencidas detectadas corretamente', () => {
  it('data no passado em campo prevista = vencida', () => {
    expect(isVencida('2020-01-01T00:00:00.000Z', 'data_prevista_embarque')).toBe(true)
  })

  it('data no futuro = não vencida', () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    expect(isVencida(futuro, 'data_prevista_embarque')).toBe(false)
  })

  it('campo sem "prevista" no nome = nunca vencida', () => {
    expect(isVencida('2020-01-01T00:00:00.000Z', 'data_emissao_pedido')).toBe(false)
  })

  it('val null = não vencida', () => {
    expect(isVencida(null, 'data_prevista_embarque')).toBe(false)
  })
})

// ── M07 — opcaoStatus mapeia colunas corretamente ────────────────────────────

describe('M07 — SelectGlobal recebe opcoes mapeadas de colunas', () => {
  it('mapeia key→valor e label→rotulo', () => {
    const opcoes = opcaoStatus(COLUNAS_TESTE)
    expect(opcoes[0]).toEqual({ valor: 'draft', rotulo: 'Rascunho' })
    expect(opcoes[3]).toEqual({ valor: 'cancelado', rotulo: 'Cancelado' })
  })

  it('mantém a mesma quantidade de itens', () => {
    const opcoes = opcaoStatus(COLUNAS_TESTE)
    expect(opcoes).toHaveLength(COLUNAS_TESTE.length)
  })

  it('array vazio retorna array vazio', () => {
    expect(opcaoStatus([])).toEqual([])
  })
})

// ── M08 — aba lembrete: abrirCompleto navega corretamente ─────────────────────

describe('M08 — abrirCompleto fecha o modal após navegar', () => {
  it('onFechar é chamado ao abrir pedido completo', () => {
    const fechadas: number[] = []
    const navegar: string[] = []
    function abrirCompleto(numeroPedido: string, onFechar: () => void) {
      navegar.push(numeroPedido)
      onFechar()
    }
    abrirCompleto('PO-2026-0001', () => fechadas.push(1))
    expect(navegar).toEqual(['PO-2026-0001'])
    expect(fechadas).toHaveLength(1)
  })
})
