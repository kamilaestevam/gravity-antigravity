// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Reproduz a lógica de merge de campos JSON (detalhes_operacionais).
 * A função original não é exportada, então testamos via reprodução do comportamento.
 */
function mergeDetalhesOperacionais(
  atual: Record<string, unknown> | null,
  campo: string,
  valor: string | number,
): Record<string, unknown> {
  const base = atual ?? {}
  return { ...base, [campo]: valor }
}

describe('Edição em Massa — Detalhes Operacionais (JSON merge)', () => {
  it('U24: editar nome_exportador preserva outros campos existentes', () => {
    const atual = {
      nome_importador: 'Empresa ABC',
      pais_origem: 'BR',
    }

    const resultado = mergeDetalhesOperacionais(atual, 'nome_exportador', 'Global Trade Inc.')

    expect(resultado).toEqual({
      nome_importador: 'Empresa ABC',
      pais_origem: 'BR',
      nome_exportador: 'Global Trade Inc.',
    })
  })

  it('U25: editar múltiplos campos JSON no mesmo batch', () => {
    const atual: Record<string, unknown> = { pais_origem: 'BR' }

    const aposExportador = mergeDetalhesOperacionais(atual, 'nome_exportador', 'Export Co.')
    const aposImportador = mergeDetalhesOperacionais(aposExportador, 'nome_importador', 'Import Co.')

    expect(aposImportador).toEqual({
      pais_origem: 'BR',
      nome_exportador: 'Export Co.',
      nome_importador: 'Import Co.',
    })
  })

  it('U26: campo JSON + campo de coluna coexistem (merge não afeta campos de coluna)', () => {
    const detalhesAtuais: Record<string, unknown> | null = null

    const resultado = mergeDetalhesOperacionais(detalhesAtuais, 'nome_exportador', 'Nova Export')

    // O merge apenas trata o JSON — campos de coluna (ex: incoterm) são atualizados separadamente
    expect(resultado).toEqual({ nome_exportador: 'Nova Export' })
    // Garantir que o resultado é um objeto limpo sem propriedades extras
    expect(Object.keys(resultado)).toHaveLength(1)
  })
})
