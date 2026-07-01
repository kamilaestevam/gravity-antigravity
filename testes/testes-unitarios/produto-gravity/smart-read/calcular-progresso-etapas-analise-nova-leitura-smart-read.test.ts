import { describe, expect, it } from 'vitest'
import {
  PROGRESSO_MAXIMO_AGUARDANDO_ANALISE,
  calcularProgressoEtapasAnaliseNovaLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/calcular-progresso-etapas-analise-nova-leitura-smart-read'

describe('calcularProgressoEtapasAnaliseNovaLeituraSmartRead', () => {
  it('não marca Completo nem 100% antes da análise real terminar', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(18, false, false)
    expect(etapas.every((e) => e.status !== 'completo')).toBe(true)
    expect(etapas.every((e) => e.progresso <= PROGRESSO_MAXIMO_AGUARDANDO_ANALISE)).toBe(true)
    expect(etapas.some((e) => e.progresso >= 90)).toBe(true)
  })

  it('continua avançando lentamente após 16s sem completar', () => {
    const em18 = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(18, false, false)
    const em58 = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(58, false, false)
    const media18 = em18.reduce((acc, e) => acc + e.progresso, 0) / 3
    const media58 = em58.reduce((acc, e) => acc + e.progresso, 0) / 3
    expect(media58).toBeGreaterThanOrEqual(media18)
    expect(em58.every((e) => e.progresso <= PROGRESSO_MAXIMO_AGUARDANDO_ANALISE)).toBe(true)
  })

  it('marca 100% Completo somente quando analiseCompleta', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(10, true, false)
    expect(etapas.every((e) => e.progresso === 100 && e.status === 'completo')).toBe(true)
  })
})
