import { describe, it, expect } from 'vitest'
import { formatarData } from '../../../servicos-global/produto/pedido/client/src/shared/useFormatoData'

/**
 * Testa a lógica de conversão de datas usada no PATCH /:id/itens/:itemId/campo
 * (pedidos.ts). A lógica é inline no handler — extraímos a mesma regra aqui
 * para validar os cenários de borda sem precisar subir o servidor.
 */
function converterDataParaPrisma(campo: string, valor: unknown): unknown {
  let valorFinal: unknown = valor === undefined ? null : valor
  if (campo.startsWith('data_')) {
    if (valorFinal === null || valorFinal === '') {
      valorFinal = null
    } else if (typeof valorFinal === 'string') {
      const d = new Date(valorFinal)
      if (isNaN(d.getTime())) throw new Error(`Data invalida para "${campo}": "${valorFinal}". Esperado YYYY-MM-DD.`)
      valorFinal = d
    }
  }
  return valorFinal
}

describe('Conversão de data no PATCH item — string → Date para Prisma DateTime', () => {
  it('data YYYY-MM-DD válida retorna Date', () => {
    const resultado = converterDataParaPrisma('data_prevista_item_pronto', '2026-05-07')
    expect(resultado).toBeInstanceOf(Date)
    expect((resultado as Date).toISOString()).toContain('2026-05-07')
  })

  it('data ISO completa (com horário) retorna Date', () => {
    const resultado = converterDataParaPrisma('data_confirmada_inspecao_item', '2026-03-15T14:30:00.000Z')
    expect(resultado).toBeInstanceOf(Date)
    expect((resultado as Date).getFullYear()).toBe(2026)
  })

  it('string vazia limpa para null', () => {
    const resultado = converterDataParaPrisma('data_meta_coleta_item', '')
    expect(resultado).toBeNull()
  })

  it('null preserva null', () => {
    const resultado = converterDataParaPrisma('data_documento_item', null)
    expect(resultado).toBeNull()
  })

  it('undefined converte para null', () => {
    const resultado = converterDataParaPrisma('data_previsao_recebimento_rascunho_item', undefined)
    expect(resultado).toBeNull()
  })

  it('data inválida lança erro', () => {
    expect(() =>
      converterDataParaPrisma('data_confirmacao_aprovacao_rascunho_item', 'nao-e-data'),
    ).toThrow('Data invalida')
  })

  it('campo não-data passa valor direto (sem conversão)', () => {
    const resultado = converterDataParaPrisma('incoterm_item', 'FOB')
    expect(resultado).toBe('FOB')
  })

  it('campo não-data preserva string vazia (não converte para null)', () => {
    const resultado = converterDataParaPrisma('descricao_item', '')
    expect(resultado).toBe('')
  })

  it('campo não-data preserva null', () => {
    const resultado = converterDataParaPrisma('ncm_item', null)
    expect(resultado).toBeNull()
  })
})

function normDate(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString()
  const s = String(v)
  return s === '' ? null : s
}

describe('normDate — normalização de datas no mapPedido/mapItem', () => {
  it('Date object → ISO string', () => {
    const d = new Date('2026-01-02T00:00:00.000Z')
    expect(normDate(d)).toBe('2026-01-02T00:00:00.000Z')
  })

  it('string ISO passa direto', () => {
    expect(normDate('2026-05-07T10:30:00.000Z')).toBe('2026-05-07T10:30:00.000Z')
  })

  it('string date-only passa direto', () => {
    expect(normDate('2026-01-02')).toBe('2026-01-02')
  })

  it('null → null', () => {
    expect(normDate(null)).toBeNull()
  })

  it('undefined → null', () => {
    expect(normDate(undefined)).toBeNull()
  })

  it('string vazia → null', () => {
    expect(normDate('')).toBeNull()
  })
})

describe('formatarData — aceita Date objects (fix formato inconsistente)', () => {
  it('Date object é formatado corretamente', () => {
    const d = new Date('2026-01-02T00:00:00.000Z')
    const resultado = formatarData(d)
    expect(resultado).toMatch(/02.*01.*2026/)
  })

  it('string ISO é formatada', () => {
    const resultado = formatarData('2026-01-02T00:00:00.000Z')
    expect(resultado).toMatch(/02.*01.*2026/)
  })

  it('null retorna traço', () => {
    expect(formatarData(null)).toBe('—')
  })

  it('undefined retorna traço', () => {
    expect(formatarData(undefined)).toBe('—')
  })
})
