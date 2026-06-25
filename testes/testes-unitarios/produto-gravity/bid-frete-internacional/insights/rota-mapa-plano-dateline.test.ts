import { describe, expect, it } from 'vitest'
import { splitScreenPathByDateline } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/mapa-plano-rota-bid-frete-internacional'

describe('splitScreenPathByDateline', () => {
  const worldW = 720

  it('mantém um único segmento quando não há salto de longitude', () => {
    const points = [
      { sx: 100, sy: 200 },
      { sx: 150, sy: 210 },
      { sx: 200, sy: 220 },
    ]
    expect(splitScreenPathByDateline(points, worldW)).toEqual([points])
  })

  it('divide quando há salto horizontal maior que metade do mapa', () => {
    const points = [
      { sx: 650, sy: 180 },
      { sx: 655, sy: 182 },
      { sx: 40, sy: 185 },
      { sx: 80, sy: 188 },
    ]
    const segments = splitScreenPathByDateline(points, worldW)
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual([
      { sx: 650, sy: 180 },
      { sx: 655, sy: 182 },
    ])
    expect(segments[1]).toEqual([
      { sx: 40, sy: 185 },
      { sx: 80, sy: 188 },
    ])
  })

  it('não retorna segmentos com menos de dois pontos', () => {
    const points = [
      { sx: 10, sy: 10 },
      { sx: 600, sy: 200 },
      { sx: 605, sy: 205 },
    ]
    const segments = splitScreenPathByDateline(points, worldW)
    expect(segments.every((seg) => seg.length >= 2)).toBe(true)
  })
})
