import { describe, expect, it } from 'vitest'
import { CriarColunaSchema, AtualizarColunaSchema } from '../../../../servicos-global/produto/pedido/server/src/routes/colunas-usuario-pedido-schemas'
import { calcularDivergenciasPedido } from '../../../../servicos-global/produto/pedido/shared/pedidoDivergencias'

describe('colunas-usuario — alerta_divergencia_itens', () => {
  it('CriarColunaSchema default false', () => {
    const parsed = CriarColunaSchema.parse({ nome: 'Teste', tipo: 'texto' })
    expect(parsed.alerta_divergencia_itens).toBe(false)
  })

  it('CriarColunaSchema aceita true', () => {
    const parsed = CriarColunaSchema.parse({
      nome: 'Teste',
      tipo: 'numero',
      alerta_divergencia_itens: true,
    })
    expect(parsed.alerta_divergencia_itens).toBe(true)
  })

  it('AtualizarColunaSchema aceita toggle', () => {
    const parsed = AtualizarColunaSchema.parse({ alerta_divergencia_itens: true })
    expect(parsed.alerta_divergencia_itens).toBe(true)
  })
})

describe('calcularDivergenciasPedido — colunas personalizadas', () => {
  it('detecta divergência entre itens na mesma coluna custom', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { _colunas_usuario: { col_a: '10' } },
        { _colunas_usuario: { col_a: '20' } },
      ],
      { _colunas_usuario: { col_a: '10' } },
    )
    const custom = divergencias._colunas_usuario_divergentes as Record<string, boolean>
    expect(custom.col_a).toBe(true)
  })
})
