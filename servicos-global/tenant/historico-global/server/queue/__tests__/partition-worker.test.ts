import { describe, it, expect } from 'vitest'

/**
 * Testa a lógica pura de cálculo de nomes e datas de partições,
 * sem depender de banco de dados.
 *
 * A lógica de geração de partições está em createFuturePartitions()
 * e dropOldPartitions(). Extraímos a lógica de data aqui para
 * garantir que os nomes e ranges estão corretos.
 */

function getPartitionName(year: number, month: number): string {
  const m = String(month).padStart(2, '0')
  return `history_log_${year}_${m}`
}

function getPartitionRange(year: number, month: number): { start: string; end: string } {
  const m = String(month).padStart(2, '0')
  const start = `${year}-${m}-01`
  const nextDate = new Date(year, month, 1) // month é 1-based → Date é 0-based, então month sem -1 dá o próximo
  const nextYear = nextDate.getFullYear()
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0')
  return { start, end: `${nextYear}-${nextMonth}-01` }
}

function parsePartitionDate(tablename: string): Date | null {
  const match = tablename.match(/^history_log_(\d{4})_(\d{2})$/)
  if (!match) return null
  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1 // 0-indexed
  return new Date(year, month, 1)
}

describe('partition name generation', () => {
  it('gera nome correto para janeiro', () => {
    expect(getPartitionName(2026, 1)).toBe('history_log_2026_01')
  })

  it('gera nome correto para dezembro', () => {
    expect(getPartitionName(2026, 12)).toBe('history_log_2026_12')
  })

  it('padding de mês com zero à esquerda', () => {
    expect(getPartitionName(2026, 3)).toBe('history_log_2026_03')
  })
})

describe('partition range calculation', () => {
  it('janeiro 2026 vai de 2026-01-01 a 2026-02-01', () => {
    const range = getPartitionRange(2026, 1)
    expect(range.start).toBe('2026-01-01')
    expect(range.end).toBe('2026-02-01')
  })

  it('dezembro 2026 vai de 2026-12-01 a 2027-01-01 (virada de ano)', () => {
    const range = getPartitionRange(2026, 12)
    expect(range.start).toBe('2026-12-01')
    expect(range.end).toBe('2027-01-01')
  })

  it('novembro 2026 vai de 2026-11-01 a 2026-12-01', () => {
    const range = getPartitionRange(2026, 11)
    expect(range.start).toBe('2026-11-01')
    expect(range.end).toBe('2026-12-01')
  })
})

describe('partition date parsing (para dropOldPartitions)', () => {
  it('extrai data corretamente de history_log_2025_03', () => {
    const date = parsePartitionDate('history_log_2025_03')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2025)
    expect(date!.getMonth()).toBe(2) // março = índice 2
  })

  it('retorna null para nome inválido', () => {
    expect(parsePartitionDate('history_log_invalid')).toBeNull()
    expect(parsePartitionDate('some_other_table')).toBeNull()
    expect(parsePartitionDate('')).toBeNull()
  })

  it('partição com mais de 12 meses é candidata a remoção', () => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 12)

    // Partição de 2 anos atrás — deve ser removida
    const oldYear = new Date().getFullYear() - 2
    const oldName = `history_log_${oldYear}_01`
    const partDate = parsePartitionDate(oldName)!
    expect(partDate < cutoff).toBe(true)
  })

  it('partição do mês atual NÃO é candidata a remoção', () => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 12)

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const currentName = `history_log_${year}_${month}`
    const partDate = parsePartitionDate(currentName)!
    expect(partDate < cutoff).toBe(false)
  })
})
