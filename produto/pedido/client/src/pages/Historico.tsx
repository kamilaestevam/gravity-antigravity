import React from 'react'
import { Historico as HistoricoGlobal } from '@tenant/historico'

export default function Historico() {
  return (
    <HistoricoGlobal
      productId="pedido"
      apiBaseUrl="/historico-api"
    />
  )
}
