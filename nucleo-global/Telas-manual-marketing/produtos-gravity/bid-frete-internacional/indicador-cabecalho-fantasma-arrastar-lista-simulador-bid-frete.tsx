export function IndicadorCabecalhoFantasmaArrastarListaSimuladorBidFrete({
  rotulo,
  x,
  y,
  largura,
}: {
  rotulo: string
  x: number
  y: number
  largura?: number
}) {
  if (!rotulo) return null

  return (
    <div
      className="bfs-th-fantasma-arrastar-lista"
      style={{
        left: x - 8,
        top: y - 6,
        width: largura != null && largura > 0 ? largura : undefined,
      }}
      role="presentation"
      aria-hidden
    >
      <span className="bfs-th-fantasma-arrastar-lista__handle" aria-hidden>⠿</span>
      <span className="bfs-th-fantasma-arrastar-lista__rotulo">{rotulo}</span>
    </div>
  )
}
