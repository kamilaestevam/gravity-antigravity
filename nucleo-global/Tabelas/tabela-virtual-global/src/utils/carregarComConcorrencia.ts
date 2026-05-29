/** Executa promises com limite de concorrência (evita N requests paralelos). */
export async function carregarComConcorrencia<T, R>(
  items: readonly T[],
  limite: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return []

  const results = new Array<R>(items.length)
  let cursor = 0

  const workers = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await fn(items[idx], idx)
    }
  })

  await Promise.all(workers)
  return results
}
