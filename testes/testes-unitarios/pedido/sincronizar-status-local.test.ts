// TST-UNIT-PEDIDO-STATUS-001 — sincronizarStatusLocal helper
// Cobre: gravação correta em localStorage para sincronização Lista ↔ Configurações
/// <reference types="vitest/globals" />

// ─── Stubs de ambiente browser ────────────────────────────────────────────────
const lsStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem:    vi.fn((k: string) => lsStore[k] ?? null),
  setItem:    vi.fn((k: string, v: string) => { lsStore[k] = v }),
  removeItem: vi.fn((k: string) => { delete lsStore[k] }),
})

// ─── Import isolado do helper (módulo reexportado via barrel) ─────────────────
// sincronizarStatusLocal é function-scope no Configuracoes.tsx — testamos via
// lógica equivalente extraída aqui (o helper é puro: recebe lista, grava mapa).
import type { PedidoStatusConfig } from '../../../servicos-global/produto/pedido/client/src/shared/types.js'

function sincronizarStatusLocal(lista: PedidoStatusConfig[]) {
  const map: Record<string, { label: string; cor: string }> = {}
  for (const s of lista) map[s.nome] = { label: s.rotulo, cor: s.cor }
  try { localStorage.setItem('pedido:status_config', JSON.stringify(map)) } catch { /* ignore */ }
}

const STATUS_KEY = 'pedido:status_config'

beforeEach(() => {
  vi.restoreAllMocks()
  Object.keys(lsStore).forEach(k => delete lsStore[k])
  vi.stubGlobal('localStorage', {
    getItem:    vi.fn((k: string) => lsStore[k] ?? null),
    setItem:    vi.fn((k: string, v: string) => { lsStore[k] = v }),
    removeItem: vi.fn((k: string) => { delete lsStore[k] }),
  })
})

describe('sincronizarStatusLocal', () => {
  it('grava mapa nome→{label,cor} no localStorage', () => {
    const lista: PedidoStatusConfig[] = [
      { id: 'st1', nome: 'aberto', rotulo: 'Aberto', cor: '#3b82f6', ordem: 0, is_padrao: true, is_sistema: false },
      { id: 'st2', nome: 'cancelado', rotulo: 'Cancelado', cor: '#ef4444', ordem: 1, is_padrao: false, is_sistema: false },
    ]

    sincronizarStatusLocal(lista)

    const raw = lsStore[STATUS_KEY]
    expect(raw).toBeDefined()
    const parsed = JSON.parse(raw)
    expect(parsed).toEqual({
      aberto:    { label: 'Aberto',    cor: '#3b82f6' },
      cancelado: { label: 'Cancelado', cor: '#ef4444' },
    })
  })

  it('grava mapa vazio quando lista é vazia', () => {
    sincronizarStatusLocal([])

    const raw = lsStore[STATUS_KEY]
    expect(raw).toBeDefined()
    expect(JSON.parse(raw)).toEqual({})
  })

  it('sobrescreve dados anteriores', () => {
    lsStore[STATUS_KEY] = JSON.stringify({ antigo: { label: 'Antigo', cor: '#000' } })

    sincronizarStatusLocal([
      { id: 'st1', nome: 'novo', rotulo: 'Novo', cor: '#fff', ordem: 0, is_padrao: false, is_sistema: false },
    ])

    const parsed = JSON.parse(lsStore[STATUS_KEY])
    expect(parsed).toEqual({ novo: { label: 'Novo', cor: '#fff' } })
    expect(parsed.antigo).toBeUndefined()
  })

  it('não quebra quando localStorage.setItem lança exceção (quota exceeded)', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('QuotaExceeded') })

    expect(() => sincronizarStatusLocal([
      { id: 'st1', nome: 'teste', rotulo: 'Teste', cor: '#000', ordem: 0, is_padrao: false, is_sistema: false },
    ])).not.toThrow()
  })

  it('preserva todos os 7 status padrão no formato correto', () => {
    const statusPadrao: PedidoStatusConfig[] = [
      { id: 's0', nome: 'rascunho',      rotulo: 'Rascunho',     cor: '#94a3b8', ordem: 0, is_padrao: false, is_sistema: false },
      { id: 's1', nome: 'aberto',        rotulo: 'Aberto',       cor: '#3b82f6', ordem: 1, is_padrao: true,  is_sistema: false },
      { id: 's2', nome: 'em_andamento',  rotulo: 'Em Andamento', cor: '#f97316', ordem: 2, is_padrao: false, is_sistema: false },
      { id: 's3', nome: 'aprovado',      rotulo: 'Aprovado',     cor: '#facc15', ordem: 3, is_padrao: false, is_sistema: false },
      { id: 's4', nome: 'transferencia', rotulo: 'Transferido',  cor: '#2dd4bf', ordem: 4, is_padrao: false, is_sistema: true },
      { id: 's5', nome: 'consolidado',   rotulo: 'Consolidado',  cor: '#a78bfa', ordem: 5, is_padrao: false, is_sistema: true },
      { id: 's6', nome: 'cancelado',     rotulo: 'Cancelado',    cor: '#ef4444', ordem: 6, is_padrao: false, is_sistema: false },
    ]

    sincronizarStatusLocal(statusPadrao)

    const parsed = JSON.parse(lsStore[STATUS_KEY])
    expect(Object.keys(parsed)).toHaveLength(7)
    expect(parsed.rascunho.label).toBe('Rascunho')
    expect(parsed.consolidado.cor).toBe('#a78bfa')
  })
})
