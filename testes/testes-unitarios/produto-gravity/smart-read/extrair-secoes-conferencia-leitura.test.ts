import { describe, expect, it } from 'vitest'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts'

describe('Smart Read — extrair seções conferência', () => {
  it('agrupa campos legado por seção com labels DDD', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      exporter: {
        name: 'Acme Corp',
        country: 'US',
      },
      observations: '',
    })

    const exportador = secoes.find((s) => s.titulo === 'Exporter')
    expect(exportador?.campos).toHaveLength(2)
    expect(exportador?.campos.find((c) => c.chave === 'exporter.name')?.rotulo).toBe('Nome do exportador')
    expect(exportador?.campos.filter((c) => c.preenchido)).toHaveLength(2)
  })

  it('mapeia campos top-level invoice', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      items_quantity: 2,
      observations: 'Texto livre',
      isSigned: false,
    })

    const obs = secoes.flatMap((s) => s.campos).find((c) => c.chave === 'observations')
    expect(obs?.rotulo).toBe('Observações')
    expect(obs?.preenchido).toBe(true)

    const assinado = secoes.flatMap((s) => s.campos).find((c) => c.chave === 'isSigned')
    expect(assinado?.rotulo).toBe('Documento assinado')
    expect(assinado?.valor).toBe('Não')
  })

  it('calcula estatísticas de preenchimento', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      campo_a: 'valor',
      campo_b: '',
    })
    const stats = calcularEstatisticasConferencia(secoes)
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.preenchidos + stats.vazios).toBe(stats.total)
  })

  it('interpreta lista fields com section do legado', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      fields: [
        { section: 'Importador', label: 'Nome do importador', value: 'Cliente BR' },
        { section: 'Importador', label: 'Cidade', value: '' },
      ],
    })
    const importador = secoes.find((s) => s.titulo === 'Importador')
    expect(importador?.campos).toHaveLength(2)
    expect(importador?.campos.filter((c) => c.preenchido)).toHaveLength(1)
  })
})
