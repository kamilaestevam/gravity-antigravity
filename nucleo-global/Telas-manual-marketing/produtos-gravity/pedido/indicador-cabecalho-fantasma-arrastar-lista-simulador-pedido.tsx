export function IndicadorCabecalhoFantasmaArrastarListaSimuladorPedido({
  rotulo,
  x,
  y,
}: {
  rotulo: string
  x: number
  y: number
}) {
  if (!rotulo) return null

  return (
    <div
      className="pds-th-fantasma-arrastar-lista"
      style={{ left: x + 14, top: y + 10 }}
      role="presentation"
      aria-hidden
    >
      {rotulo}
    </div>
  )
}
