export type ScreenPointMapaPlanoBidFrete = { sx: number; sy: number }

/** Quebra polilinha quando há salto de tela na linha de data — impede traço horizontal atravessando o mapa. */
export function splitScreenPathByDateline(
  points: ScreenPointMapaPlanoBidFrete[],
  worldW: number,
): ScreenPointMapaPlanoBidFrete[][] {
  if (points.length < 2) return []
  const threshold = worldW * 0.45
  const segments: ScreenPointMapaPlanoBidFrete[][] = []
  let current: ScreenPointMapaPlanoBidFrete[] = [points[0]]

  for (let j = 1; j < points.length; j++) {
    const prev = points[j - 1]
    const cur = points[j]
    if (Math.abs(cur.sx - prev.sx) > threshold) {
      if (current.length >= 2) segments.push(current)
      current = [cur]
    } else {
      current.push(cur)
    }
  }
  if (current.length >= 2) segments.push(current)
  return segments
}
